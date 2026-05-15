import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { PlatformRolesRepository } from "../repositories/platform-roles.repository";
import {
  CreatePlatformRoleData,
  UpdatePlatformRolePermissionsData,
} from "../validators/platform-roles.validator";

const SYSTEM_PLATFORM_ROLE_SLUGS = [
  "super_admin",
  "operations_admin",
  "lead_manager",
  "finance_team",
  "support_team",
  "content_manager",
] as const;

export class PlatformRolesService {
  static async listPermissions() {
    const permissions = await PlatformRolesRepository.listPermissions();
    return permissions.map((p) => p.code);
  }

  static async listRoles() {
    const roles = await PlatformRolesRepository.listRoles();
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      isSystemRole: role.isSystemRole,
      canDelete: true,
      isActive: role.isActive,
      permissions: role.permissions.map((p) => p.permissionCode),
    }));
  }

  static async createRole(data: CreatePlatformRoleData) {
    const existing = await PlatformRolesRepository.findBySlug(data.slug);
    if (existing) throw new ConflictError("Role slug already exists");

    const uniquePermissions = Array.from(new Set(data.permissions));
    const role = await PlatformRolesRepository.create({
      name: data.name,
      slug: data.slug,
      isSystemRole: data.is_system_role,
    });

    if (uniquePermissions.length > 0) {
      await PlatformRolesRepository.createPermissions(
        role.id,
        uniquePermissions,
      );
    }

    return PlatformRolesRepository.findById(role.id);
  }

  static async upsertSystemRoles() {
    const systemRoleNames: Record<
      (typeof SYSTEM_PLATFORM_ROLE_SLUGS)[number],
      string
    > = {
      super_admin: "Super Admin",
      operations_admin: "Operations Admin",
      lead_manager: "Lead Manager",
      finance_team: "Finance Team",
      support_team: "Support Team",
      content_manager: "Content Manager",
    };

    for (const slug of SYSTEM_PLATFORM_ROLE_SLUGS) {
      await PlatformRolesRepository.upsertSystemRole(
        slug,
        systemRoleNames[slug],
      );
    }
  }

  static async updateRolePermissions(
    roleId: string,
    data: UpdatePlatformRolePermissionsData,
  ) {
    const role = await PlatformRolesRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");
    if (!role.isActive)
      throw new ForbiddenError(
        "Cannot modify permissions for an inactive role",
      );

    const uniquePermissions = Array.from(new Set(data.permissions));
    await PlatformRolesRepository.replacePermissions(
      role.id,
      uniquePermissions,
    );

    const updated = await PlatformRolesRepository.findById(role.id);
    return {
      id: updated!.id,
      name: updated!.name,
      slug: updated!.slug,
      isSystemRole: updated!.isSystemRole,
      isActive: updated!.isActive,
      permissions: updated!.permissions.map((p) => p.permissionCode),
    };
  }

  static async deleteRole(roleId: string) {
    const role = await PlatformRolesRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");

    const assignedAdminsCount =
      await PlatformRolesRepository.countAdmins(roleId);
    if (assignedAdminsCount > 0) {
      throw new ForbiddenError(
        "Role is assigned to one or more administrators and cannot be deleted",
      );
    }

    await PlatformRolesRepository.delete(roleId);
  }
}
