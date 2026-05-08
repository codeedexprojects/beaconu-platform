import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/responses/api-response';
import { unifiedAuthSchemas } from './auth-unified.schema';
import { UnifiedAuthService } from './auth-unified.service';
import { AuthService } from './auth.service';

export class UnifiedAuthController {
  static async registerCounsellor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = unifiedAuthSchemas.registerCounsellor.parse(req.body);
      const result = await UnifiedAuthService.registerCounsellor(data);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json(
        ApiResponse.success('Counsellor registered successfully', {
          user: result.user,
          accessToken: result.tokens.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = unifiedAuthSchemas.login.parse(req.body);
      const result = await UnifiedAuthService.login(data);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(
        ApiResponse.success('Login successful', {
          user: result.user,
          accessToken: result.tokens.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async loginCounsellor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = unifiedAuthSchemas.login.parse(req.body);
      const result = await UnifiedAuthService.loginCounsellor(data);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(
        ApiResponse.success('Counsellor login successful', {
          user: result.user,
          accessToken: result.tokens.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await AuthService.refreshTokens(refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(
        ApiResponse.success('Token refreshed successfully', {
          accessToken: result.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      return res.status(200).json(ApiResponse.success('Logged out successfully', null));
    } catch (error) {
      next(error);
    }
  }
}
