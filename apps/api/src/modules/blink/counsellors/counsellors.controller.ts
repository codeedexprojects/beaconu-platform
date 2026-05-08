import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/responses/api-response';
import { counsellorSchemas } from './counsellors.schema';
import { CounsellorService } from './counsellors.service';

export class CounsellorController {
  // GET /counsellors/me  (counsellor only)
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellor = await CounsellorService.getMyProfile(req.userId!);
      return res.status(200).json(ApiResponse.success('Profile retrieved', counsellor));
    } catch (error) {
      next(error);
    }
  }

  // PATCH /counsellors/me  (counsellor only)
  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = counsellorSchemas.updateMyProfile.parse(req.body);
      const counsellor = await CounsellorService.updateMyProfile(req.userId!, data);
      return res.status(200).json(ApiResponse.success('Profile updated', counsellor));
    } catch (error) {
      next(error);
    }
  }

  // GET /counsellors?counsellor_type=academic&status=active  (platform_admin only)
  static async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorType = req.query.counsellor_type as string | undefined;
      const status = req.query.status as string | undefined;
      const counsellors = await CounsellorService.listAll({ counsellor_type: counsellorType, status });
      return res.status(200).json(ApiResponse.success('Counsellors retrieved', counsellors));
    } catch (error) {
      next(error);
    }
  }

  // GET /counsellors/:id  (platform_admin only)
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellor = await CounsellorService.getById(req.params['id'] as string);
      return res.status(200).json(ApiResponse.success('Counsellor retrieved', counsellor));
    } catch (error) {
      next(error);
    }
  }

  // PATCH /counsellors/:id/status  (platform_admin only)
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = counsellorSchemas.updateStatus.parse(req.body);
      const counsellor = await CounsellorService.updateStatus(req.params['id'] as string, data);
      return res.status(200).json(ApiResponse.success('Status updated', counsellor));
    } catch (error) {
      next(error);
    }
  }
}
