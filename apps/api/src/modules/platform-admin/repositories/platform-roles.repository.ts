import { prisma } from "@beaconu/db";

export class PlatformRolesRepository {
  static async listPermissions() {
    return prisma.platformRolePermission.findMany({
      select: { permissionCode: true },
      distinct: ["permissionCode"],
      orderBy: { permissionCode: "asc" },
    });
  }

  static async listRoles() {
    return prisma.platformRole.findMany({
      include: { permissions: true },
      orderBy: { createdAt: "asc" },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.platformRole.findUnique({ where: { slug } });
  }

  static async findById(id: string) {
    return prisma.platformRole.findUnique({
      where: { id },
      include: { permissions: true },
    });
  }

  static async create(data: {
    name: string;
    slug: string;
    isSystemRole: boolean;
  }) {
    return prisma.platformRole.create({ data });
  }

  static async createPermissions(roleId: string, permissionCodes: string[]) {
    return prisma.platformRolePermission.createMany({
      data: permissionCodes.map((permissionCode) => ({
        platformRoleId: roleId,
        permissionCode,
      })),
      skipDuplicates: true,
    });
  }

  static async replacePermissions(roleId: string, permissionCodes: string[]) {
    return prisma.$transaction([
      prisma.platformRolePermission.deleteMany({
        where: { platformRoleId: roleId },
      }),
      prisma.platformRolePermission.createMany({
        data: permissionCodes.map((permissionCode) => ({
          platformRoleId: roleId,
          permissionCode,
        })),
      }),
    ]);
  }

  static async upsertSystemRole(slug: string, name: string) {
    return prisma.platformRole.upsert({
      where: { slug },
      update: { name, isSystemRole: true },
      create: { name, slug, isSystemRole: true },
    });
  }
}
