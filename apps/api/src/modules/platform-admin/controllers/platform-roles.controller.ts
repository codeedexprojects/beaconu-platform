import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { platformRolesSchemas } from "../validators/platform-roles.validator";
import { PlatformRolesService } from "../services/platform-roles.service";

export class PlatformRolesController {
  static async listPermissions(_req: Request, res: Response) {
    const permissions = await PlatformRolesService.listPermissions();
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Platform permissions fetched successfully",
          permissions,
        ),
      );
  }

  static async listRoles(_req: Request, res: Response) {
    const roles = await PlatformRolesService.listRoles();
    return res
      .status(200)
      .json(ApiResponse.success("Platform roles fetched successfully", roles));
  }

  static async createRole(req: Request, res: Response) {
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
  }

  static async updateRolePermissions(req: Request, res: Response) {
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
  }

  static async deleteRole(req: Request, res: Response) {
    const roleId = String(req.params.id);
    await PlatformRolesService.deleteRole(roleId);
    return res
      .status(200)
      .json(ApiResponse.success("Platform role deleted successfully", null));
  }
}
