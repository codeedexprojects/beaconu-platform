import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";

export class AssociateAdminController {
  static async registerEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await BlinkService.registerAssociateEmployee(req.body);
      return res
        .status(201)
        .json(ApiResponse.success(result.message, { user: result.user }));
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.getProfile(req.userId!);
      return res
        .status(200)
        .json(ApiResponse.success("Profile fetched successfully", result));
    } catch (error) {
      next(error);
    }
  }

  static async listEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.listAssociateEmployees(req.userId!);
      return res
        .status(200)
        .json(ApiResponse.success("Employees fetched successfully", result));
    } catch (error) {
      next(error);
    }
  }

  static async listPendingEmployees(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await BlinkService.listPendingEmployees(req.userId!);
      return res
        .status(200)
        .json(
          ApiResponse.success(
            "Pending employees fetched successfully",
            result,
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateEmployeeStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const employeeId = req.params["employeeId"] as string;
      const result = await BlinkService.updateAssociateEmployeeStatus(
        req.userId!,
        employeeId,
        req.body,
      );
      return res
        .status(200)
        .json(
          ApiResponse.success("Employee status updated successfully", result),
        );
    } catch (error) {
      next(error);
    }
  }
  static async approveEmployeeStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id as string;
      const status = req.body.status;

      const result = await BlinkService.updateBlinkUserStatus(id, status);

      return res
        .status(200)
        .json(
          ApiResponse.success(
            "Employee status updated by Platform Admin",
            result,
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
