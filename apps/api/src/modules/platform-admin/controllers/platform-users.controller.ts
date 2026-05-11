import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PlatformUsersQuery } from "../queries/platform-users.query";

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
}
