import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { platformPermissionsSchemas } from "../validators/platform-permissions.validator";
import { PlatformPermissionsService } from "../services/platform-permissions.service";

export class PlatformPermissionsController {
  static async listPermissions(_req: Request, res: Response) {
    const permissions = await PlatformPermissionsService.listPermissions();
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Platform permissions fetched successfully",
          permissions,
        ),
      );
  }

  static async createPermission(req: Request, res: Response) {
    const data = platformPermissionsSchemas.createPermission.parse(req.body);
    const permission = await PlatformPermissionsService.createPermission(data);
    return res
      .status(201)
      .json(
        ApiResponse.success(
          "Platform permission created successfully",
          permission,
        ),
      );
  }

  static async updatePermission(req: Request, res: Response) {
    const id = String(req.params.id);
    const data = platformPermissionsSchemas.updatePermission.parse(req.body);
    const permission = await PlatformPermissionsService.updatePermission(
      id,
      data,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Platform permission updated successfully",
          permission,
        ),
      );
  }

  static async deletePermission(req: Request, res: Response) {
    const id = String(req.params.id);
    await PlatformPermissionsService.deletePermission(id);
    return res
      .status(200)
      .json(
        ApiResponse.success("Platform permission deleted successfully", null),
      );
  }
}
