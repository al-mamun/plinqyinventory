import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    // Generate cryptographically secure random token
    const token = crypto.randomBytes(64).toString('hex');

    const expiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn');
    const expiresAt = this.calculateExpiration(expiresIn);

    // Store refresh token in database
    await this.prisma.refresh_token.create({
      data: {
        token,
        user_id: userId,
        expires_at: expiresAt,
        device_info: userAgent ? { userAgent } : undefined,
        ip_address: ipAddress,
      },
    });

    this.logger.log(`Created refresh token for user ${userId}`);
    return token;
  }

  async validateRefreshToken(token: string): Promise<{ userId: string } | null> {
    const refreshToken = await this.prisma.refresh_token.findUnique({
      where: { token },
      include: { app_user: true },
    });

    if (!refreshToken) {
      this.logger.warn('Refresh token not found');
      return null;
    }

    if (refreshToken.is_revoked) {
      this.logger.warn(`Revoked refresh token attempted: ${token.substring(0, 10)}...`);
      // If a revoked token is used, revoke all tokens for this user (security breach)
      await this.revokeAllUserTokens(refreshToken.user_id);
      return null;
    }

    if (refreshToken.expires_at < new Date()) {
      this.logger.warn('Expired refresh token');
      await this.deleteToken(token);
      return null;
    }

    if (refreshToken.app_user && !refreshToken.app_user.is_active) {
      this.logger.warn('User account is inactive');
      return null;
    }

    return { userId: refreshToken.user_id };
  }

  async rotateRefreshToken(
    oldToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string | null> {
    const validation = await this.validateRefreshToken(oldToken);

    if (!validation) {
      return null;
    }

    // Revoke old token
    await this.revokeToken(oldToken);

    // Create new token
    const newToken = await this.createRefreshToken(
      validation.userId,
      userAgent,
      ipAddress,
    );

    this.logger.log(`Rotated refresh token for user ${validation.userId}`);
    return newToken;
  }

  async revokeToken(token: string): Promise<void> {
    await this.prisma.refresh_token.update({
      where: { token },
      data: {
        is_revoked: true,
        updated_at: new Date(),
      },
    });
    this.logger.log(`Revoked refresh token: ${token.substring(0, 10)}...`);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refresh_token.updateMany({
      where: {
        user_id: userId,
        is_revoked: false,
      },
      data: {
        is_revoked: true,
        updated_at: new Date(),
      },
    });
    this.logger.warn(`Revoked all refresh tokens for user ${userId}`);
  }

  async deleteToken(token: string): Promise<void> {
    await this.prisma.refresh_token.delete({
      where: { token },
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.prisma.refresh_token.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
    this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
  }

  async getUserActiveSessions(userId: string) {
    return this.prisma.refresh_token.findMany({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        device_info: true,
        ip_address: true,
        created_at: true,
        expires_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const session = await this.prisma.refresh_token.findFirst({
      where: {
        id: sessionId,
        user_id: userId,
      },
    });

    if (!session) {
      return false;
    }

    await this.prisma.refresh_token.update({
      where: { id: sessionId },
      data: {
        is_revoked: true,
        updated_at: new Date(),
      },
    });

    return true;
  }

  private calculateExpiration(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid duration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const now = new Date();
    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error('Invalid duration unit');
    }
  }
}
