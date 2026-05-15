import { prisma } from "@beaconu/db";

export class PlatformPermissionsRepository {
  static async findAll() {
    return prisma.platformPermission.findMany({
      orderBy: { code: "asc" },
    });
  }

  static async findById(id: string) {
    return prisma.platformPermission.findUnique({
      where: { id },
    });
  }

  static async findByCode(code: string) {
    return prisma.platformPermission.findUnique({
      where: { code },
    });
  }

  static async create(data: { code: string; description?: string }) {
    return prisma.platformPermission.create({
      data,
    });
  }

  static async update(
    id: string,
    data: { code?: string; description?: string },
  ) {
    return prisma.platformPermission.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.platformPermission.delete({
      where: { id },
    });
  }
}
