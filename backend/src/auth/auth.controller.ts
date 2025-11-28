import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards, Request, Req, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import type { Request as ExpressRequest, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered. JWT cookies set.' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: ExpressRequest,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip || request.socket.remoteAddress;

    const result = await this.authService.register(registerDto, userAgent, ipAddress);

    // Set access token cookie
    const accessTokenConfig = this.configService.get('cookie.accessToken');
    response.cookie('access_token', result.accessToken, accessTokenConfig);

    // Set refresh token cookie
    const refreshTokenConfig = this.configService.get('cookie.refreshToken');
    response.cookie('refresh_token', result.refreshToken, refreshTokenConfig);

    return {
      message: 'Registration successful',
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in. JWT cookies set.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: ExpressRequest,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip || request.socket.remoteAddress;

    const result = await this.authService.login(loginDto, userAgent, ipAddress);

    // Set access token cookie
    const accessTokenConfig = this.configService.get('cookie.accessToken');
    response.cookie('access_token', result.accessToken, accessTokenConfig);

    // Set refresh token cookie
    const refreshTokenConfig = this.configService.get('cookie.refreshToken');
    response.cookie('refresh_token', result.refreshToken, refreshTokenConfig);

    return {
      message: 'Login successful',
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New access token issued. Refresh token rotated.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      response.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Refresh token not found' };
    }

    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip || request.socket.remoteAddress;

    const result = await this.authService.refreshTokens(refreshToken, userAgent, ipAddress);

    if (!result) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      response.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Invalid refresh token' };
    }

    // Set new access token cookie
    const accessTokenConfig = this.configService.get('cookie.accessToken');
    response.cookie('access_token', result.accessToken, accessTokenConfig);

    // Set new refresh token cookie
    const refreshTokenConfig = this.configService.get('cookie.refreshToken');
    response.cookie('refresh_token', result.refreshToken, refreshTokenConfig);

    return {
      message: 'Token refreshed successfully',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'User successfully logged out. Cookies cleared and refresh token revoked.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Request() req,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    // Revoke refresh token if present
    if (refreshToken) {
      await this.authService.logout(refreshToken, req.user.userId);
    }

    // Clear cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return {
      message: 'Logout successful',
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Logout from all devices and revoke all refresh tokens' })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logoutAll(req.user.userId);

    // Clear cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return {
      message: 'Logged out from all devices successfully',
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get all active sessions for the current user' })
  @ApiResponse({ status: 200, description: 'Returns list of active sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSessions(@Request() req) {
    const sessions = await this.authService.getActiveSessions(req.user.userId);
    return {
      sessions,
    };
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Revoke a specific session by ID' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeSession(
    @Request() req,
    @Param('id') sessionId: string,
  ) {
    await this.authService.revokeSession(req.user.userId, sessionId);
    return {
      message: 'Session revoked successfully',
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ status: 200, description: 'Returns authentication status and user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatus(@Request() req) {
    return {
      isAuthenticated: true,
      user: req.user,
    };
  }
}
