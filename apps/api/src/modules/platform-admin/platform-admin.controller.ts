import { Request, Response, NextFunction } from 'express';
import { PlatformAdminService } from './platform-admin.service';
import { platformAdminSchemas } from './platform-admin.schema';
import { ApiResponse } from '@/shared/responses/api-response';

export class PlatformAdminController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = platformAdminSchemas.login.parse(req.body);
      const result = await PlatformAdminService.login(data);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      return res.status(200).json(
        ApiResponse.success('Super-admin login successful', {
          user: result.user,
          accessToken: result.tokens.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PlatformAdminService.getAllProfiles();
      return res.status(200).json(
        ApiResponse.success('All profiles fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}
