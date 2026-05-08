import { prisma } from '@beaconu/db';
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/errors';
import { CreatePlatformRoleData, UpdatePlatformRolePermissionsData } from './platform-roles.schema';

const SYSTEM_PLATFORM_ROLE_SLUGS = [
  'super_admin',
  'operations_admin',
  'lead_manager',
  'finance_team',
  'support_team',
  'content_manager',
] as const;

export class PlatformRolesService {
  static async listPermissions() {
    const permissions = await prisma.platformRolePermission.findMany({
      select: {
        permissionCode: true,
      },
      distinct: ['permissionCode'],
      orderBy: {
        permissionCode: 'asc',
      },
    });

    return permissions.map((permission) => permission.permissionCode);
  }

  static async listRoles() {
    const roles = await prisma.platformRole.findMany({
      include: {
        permissions: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      permissions: role.permissions.map((permission) => permission.permissionCode),
    }));
  }

  static async createRole(data: CreatePlatformRoleData) {
    const existingRole = await prisma.platformRole.findUnique({
      where: { slug: data.slug },
    });

    if (existingRole) {
      throw new ConflictError('Role slug already exists');
    }

    const uniquePermissions = Array.from(new Set(data.permissions));

    const role = await prisma.platformRole.create({
      data: {
        name: data.name,
        slug: data.slug,
        isSystemRole: data.is_system_role,
      },
    });

    if (uniquePermissions.length > 0) {
      await prisma.platformRolePermission.createMany({
        data: uniquePermissions.map((permissionCode) => ({
          platformRoleId: role.id,
          permissionCode,
        })),
        skipDuplicates: true,
      });
    }

    return prisma.platformRole.findUnique({
      where: { id: role.id },
      include: { permissions: true },
    });
  }

  static async upsertSystemRoles() {
    const systemRoleNames: Record<(typeof SYSTEM_PLATFORM_ROLE_SLUGS)[number], string> = {
      super_admin: 'Super Admin',
      operations_admin: 'Operations Admin',
      lead_manager: 'Lead Manager',
      finance_team: 'Finance Team',
      support_team: 'Support Team',
      content_manager: 'Content Manager',
    };

    for (const roleSlug of SYSTEM_PLATFORM_ROLE_SLUGS) {
      await prisma.platformRole.upsert({
        where: { slug: roleSlug },
        update: {
          name: systemRoleNames[roleSlug],
          isSystemRole: true,
        },
        create: {
          name: systemRoleNames[roleSlug],
          slug: roleSlug,
          isSystemRole: true,
        },
      });
    }
  }

  static async updateRolePermissions(roleId: string, data: UpdatePlatformRolePermissionsData) {
    const role = await prisma.platformRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (!role.isActive) {
      throw new ForbiddenError('Cannot modify permissions for an inactive role');
    }

    const uniquePermissions = Array.from(new Set(data.permissions));

    await prisma.$transaction([
      prisma.platformRolePermission.deleteMany({
        where: { platformRoleId: role.id },
      }),
      prisma.platformRolePermission.createMany({
        data: uniquePermissions.map((permissionCode) => ({
          platformRoleId: role.id,
          permissionCode,
        })),
      }),
    ]);

    const updated = await prisma.platformRole.findUnique({
      where: { id: role.id },
      include: {
        permissions: true,
      },
    });

    return {
      id: updated!.id,
      name: updated!.name,
      slug: updated!.slug,
      isSystemRole: updated!.isSystemRole,
      isActive: updated!.isActive,
      permissions: updated!.permissions.map((permission) => permission.permissionCode),
    };
  }
}
