import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PlatformUsersQuery } from "../queries/platform-users.query";
import { BlinkService } from "../../blink/services/blink.service";

export class PlatformUsersController {
  static async getAllProfiles(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await PlatformUsersQuery.getAllProfiles();
      return res
        .status(200)
        .json(ApiResponse.success("All profiles fetched successfully", result));
    } catch (error) {
      next(error);
    }
  }

  static async updateBlinkUserStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const result = await BlinkService.updateBlinkUserStatus(id, status);
      return res
        .status(200)
        .json(
          ApiResponse.success("Blink user status updated successfully", result),
        );
    } catch (error) {
      next(error);
    }
  }

  static async getPendingBlinkUsers(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await PlatformUsersQuery.getPendingBlinkUsers();
      return res
        .status(200)
        .json(
          ApiResponse.success("Pending blink users fetched successfully", result),
        );
    } catch (error) {
      next(error);
    }
  }
}
