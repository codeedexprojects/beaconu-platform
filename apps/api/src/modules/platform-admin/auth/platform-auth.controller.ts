import { Request, Response, NextFunction } from 'express';
import { PlatformAuthService } from './platform-auth.service';
import { platformAuthSchemas } from './platform-auth.schema';
import { ApiResponse } from '@/shared/responses/api-response';

export class PlatformAuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = platformAuthSchemas.login.parse(req.body);
      const result = await PlatformAuthService.login(data);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      return res.status(200).json(
        ApiResponse.success('Platform admin login successful', {
          user: result.user,
          accessToken: result.tokens.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
