import { Request, Response, NextFunction } from 'express';
import { PlatformUsersService } from './platform-users.service';
import { ApiResponse } from '@/shared/responses/api-response';

export class PlatformUsersController {
  static async getAllProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PlatformUsersService.getAllProfiles();
      return res.status(200).json(
        ApiResponse.success('All profiles fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}
