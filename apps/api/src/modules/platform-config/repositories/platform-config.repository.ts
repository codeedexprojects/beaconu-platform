import { prisma } from "@beaconu/db";
import type { UpdatePlatformConfigInput } from "../validators/platform-config.validator";

const CONFIG_ID = "default";

export class PlatformConfigRepository {
  static async get() {
    return prisma.platformConfig.findUniqueOrThrow({
      where: { id: CONFIG_ID },
    });
  }

  static async update(
    data: UpdatePlatformConfigInput,
    updatedByAdminId: string,
  ) {
    return prisma.platformConfig.update({
      where: { id: CONFIG_ID },
      data: { ...data, updatedByAdminId },
    });
  }
}
