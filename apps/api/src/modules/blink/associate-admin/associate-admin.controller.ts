import { Request, Response, NextFunction } from 'express';
import { BlinkService } from '../blink.service';
import { blinkSchemas } from '../blink.schema';
import { AuthService } from '@/modules/auth/auth.service';
import { ApiResponse } from '@/shared/responses/api-response';

export class AssociateAdminController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = blinkSchemas.registerAssociateAdmin.parse(req.body);
      const result = await BlinkService.registerAssociateAdmin(data);

      return res.status(201).json(
        ApiResponse.success(result.message, {
          user: result.user,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async registerEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const data = blinkSchemas.registerAssociateEmployee.parse(req.body);
      const result = await BlinkService.registerAssociateEmployee(data);

      return res.status(201).json(
        ApiResponse.success(result.message, { user: result.user })
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = blinkSchemas.login.parse(req.body);
      const result = await BlinkService.login(data);

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

  static async getMe(req: Request, res: Response, next: NextFunction) {
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
      return res.status(200).json(ApiResponse.success('Associate employees fetched successfully', result));
    } catch (error) {
      next(error);
    }
  }

  static async updateEmployeeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = blinkSchemas.updateEmployeeStatus.parse(req.body);
      const employeeId = String(req.params.employeeId);
      const result = await BlinkService.updateAssociateEmployeeStatus(req.userId!, employeeId, data);
      return res.status(200).json(ApiResponse.success('Employee status updated successfully', result));
    } catch (error) {
      next(error);
    }
  }
}
