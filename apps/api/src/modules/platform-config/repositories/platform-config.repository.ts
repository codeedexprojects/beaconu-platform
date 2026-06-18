import { prisma } from "@beaconu/db";

const CONFIG_ID = "default";

export class PlatformConfigRepository {
  static async get() {
    return prisma.platformConfig.findUniqueOrThrow({
      where: { id: CONFIG_ID },
    });
  }

  static async update(
    data: { gstPercentage?: number; counsellorMinWithdrawalAmount?: number },
    updatedByAdminId: string,
  ) {
    return prisma.platformConfig.update({
      where: { id: CONFIG_ID },
      data: { ...data, updatedByAdminId },
    });
  }
}
