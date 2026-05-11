import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/responses/api-response';
import { CounsellingService } from '../services/counselling.service';

export class CounsellorController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellor = await CounsellingService.getMyProfile(req.userId!);
      return res.status(200).json(ApiResponse.success('Profile retrieved', counsellor));
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellor = await CounsellingService.updateMyProfile(req.userId!, req.body);
      return res.status(200).json(ApiResponse.success('Profile updated', counsellor));
    } catch (error) {
      next(error);
    }
  }
}
