import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { platformRolesSchemas } from "../validators/platform-roles.validator";
import { PlatformRolesService } from "../services/platform-roles.service";

export class PlatformRolesController {
  static async listPermissions(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const permissions = await PlatformRolesService.listPermissions();
      return res
        .status(200)
        .json(
          ApiResponse.success(
            "Platform permissions fetched successfully",
            permissions,
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  static async listRoles(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await PlatformRolesService.listRoles();
      return res
        .status(200)
        .json(
          ApiResponse.success("Platform roles fetched successfully", roles),
        );
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const data = platformRolesSchemas.createRole.parse(req.body);
      const role = await PlatformRolesService.createRole(data);
      return res.status(201).json(
        ApiResponse.success("Platform role created successfully", {
          id: role?.id,
          name: role?.name,
          slug: role?.slug,
          isSystemRole: role?.isSystemRole,
          isActive: role?.isActive,
          permissions: role?.permissions.map((p) => p.permissionCode) ?? [],
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateRolePermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = platformRolesSchemas.updatePermissions.parse(req.body);
      const roleId = String(req.params.roleId);
      const result = await PlatformRolesService.updateRolePermissions(
        roleId,
        data,
      );
      return res
        .status(200)
        .json(
          ApiResponse.success(
            "Platform role permissions updated successfully",
            result,
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
