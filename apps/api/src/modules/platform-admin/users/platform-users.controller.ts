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

  static async getAllAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PlatformUsersService.getAllAdmins();
      return res.status(200).json(
        ApiResponse.success('Platform admins fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllAssociateAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PlatformUsersService.getAllAssociateAdmins();
      return res.status(200).json(
        ApiResponse.success('Associate admins fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateAssociateAdminStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const associateAdminId = String(req.params.associateAdminId);
      const { status } = req.body;
      const result = await PlatformUsersService.updateAssociateAdminStatus(associateAdminId, status);
      return res.status(200).json(
        ApiResponse.success('Associate admin status updated successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PlatformUsersService.createAdmin(req.body);
      return res.status(201).json(
        ApiResponse.success('Platform admin created successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}
