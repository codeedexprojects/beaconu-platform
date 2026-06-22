import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PlatformConfigService } from "../services/platform-config.service";

export class PlatformConfigController {
  static async getConfig(req: Request, res: Response) {
    const result = await PlatformConfigService.getConfig();
    return res
      .status(200)
      .json(
        ApiResponse.success("Platform config fetched successfully", result),
      );
  }

  static async updateConfig(req: Request, res: Response) {
    const result = await PlatformConfigService.updateConfig(
      req.body,
      req.userId!,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Platform config updated successfully", result),
      );
  }
}
