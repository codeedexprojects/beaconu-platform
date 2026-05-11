import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/responses/api-response';
import { BlinkService } from '../services/blink.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 90 * 24 * 60 * 60 * 1000,
};

export class AssociateAdminController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.registerAssociateAdmin(req.body);
      res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);
      return res.status(201).json(
        ApiResponse.success('Associate admin registered successfully', {
          user: result.user,
          accessToken: result.tokens.accessToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async registerEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.registerAssociateEmployee(req.body);
      return res.status(201).json(ApiResponse.success(result.message, { user: result.user }));
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.getProfile(req.userId!);
      return res.status(200).json(ApiResponse.success('Profile fetched successfully', result));
    } catch (error) {
      next(error);
    }
  }

  static async listEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.listAssociateEmployees(req.userId!);
      return res.status(200).json(ApiResponse.success('Employees fetched successfully', result));
    } catch (error) {
      next(error);
    }
  }

  static async updateEmployeeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.params['employeeId'] as string;
      const result = await BlinkService.updateAssociateEmployeeStatus(req.userId!, employeeId, req.body);
      return res.status(200).json(ApiResponse.success('Employee status updated successfully', result));
    } catch (error) {
      next(error);
    }
  }
}
