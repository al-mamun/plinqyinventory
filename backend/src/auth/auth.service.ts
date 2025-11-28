import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto, userAgent?: string, ipAddress?: string) {
    // Validate password strength
    this.validatePasswordStrength(registerDto.password);

    const user = await this.usersService.create({
      ...registerDto,
      role: 'CUSTOMER' as any,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);

    this.logger.log(`User registered: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(`Login attempt with invalid email: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.is_active) {
      this.logger.warn(`Login attempt on inactive account: ${user.email}`);
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for: ${user.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        store: user.store,
      },
    };
  }

  async refreshTokens(refreshToken: string, userAgent?: string, ipAddress?: string) {
    const validation = await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!validation) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(validation.userId);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Rotate refresh token for security
    const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(refreshToken, userAgent, ipAddress);

    if (!newRefreshToken) {
      throw new UnauthorizedException('Failed to rotate refresh token');
    }

    // Generate new access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn') as any,
      },
    );

    this.logger.log(`Tokens refreshed for user: ${user.email}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string, userId: string) {
    if (refreshToken) {
      await this.refreshTokenService.revokeToken(refreshToken);
    }
    this.logger.log(`User logged out: ${userId}`);
  }

  async logoutAll(userId: string) {
    await this.refreshTokenService.revokeAllUserTokens(userId);
    this.logger.log(`All sessions revoked for user: ${userId}`);
  }

  async getActiveSessions(userId: string) {
    return this.refreshTokenService.getUserActiveSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string) {
    return this.refreshTokenService.revokeSession(userId, sessionId);
  }

  private async generateTokens(userId: string, email: string, role: string, userAgent?: string, ipAddress?: string) {
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn') as any,
      },
    );

    const refreshToken = await this.refreshTokenService.createRefreshToken(userId, userAgent, ipAddress);

    return { accessToken, refreshToken };
  }


  private validatePasswordStrength(password: string): void {
    const minLength = this.configService.get<number>('security.passwordMinLength');

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }

    // Check for common passwords (basic check)
    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new BadRequestException('Password is too common. Please choose a stronger password');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return null;
    }

    const { password_hash: _, ...result } = user;
    return result;
  }
}
