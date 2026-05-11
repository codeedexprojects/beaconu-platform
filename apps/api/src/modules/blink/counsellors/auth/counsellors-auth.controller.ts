import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/responses/api-response';
import { registerCounsellorSchema, loginSchema } from '@/modules/auth/validators/auth.validator';
import { AuthService } from '@/modules/auth/services/auth.service';

export class CounsellorsAuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerCounsellorSchema.parse(req.body);
      const result = await AuthService.registerCounsellor(data);

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
      const data = loginSchema.parse(req.body);
      const result = await AuthService.loginCounsellor(data);

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
