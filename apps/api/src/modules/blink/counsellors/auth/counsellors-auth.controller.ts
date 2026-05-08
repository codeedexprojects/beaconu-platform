import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/responses/api-response';
import { unifiedAuthSchemas } from '@/modules/auth/auth-unified.schema';
import { UnifiedAuthService } from '@/modules/auth/auth-unified.service';

export class CounsellorsAuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
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
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
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
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}
