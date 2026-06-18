import { PlatformConfigRepository } from "../repositories/platform-config.repository";
import { UpdatePlatformConfigInput } from "../validators/platform-config.validator";

export class PlatformConfigService {
  static async getConfig() {
    const config = await PlatformConfigRepository.get();
    return {
      gstPercentage: Number(config.gstPercentage),
      counsellorMinWithdrawalAmount: Number(
        config.counsellorMinWithdrawalAmount,
      ),
      updatedByAdminId: config.updatedByAdminId,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  static async updateConfig(data: UpdatePlatformConfigInput, adminId: string) {
    const updated = await PlatformConfigRepository.update(data, adminId);
    return {
      gstPercentage: Number(updated.gstPercentage),
      counsellorMinWithdrawalAmount: Number(
        updated.counsellorMinWithdrawalAmount,
      ),
      updatedByAdminId: updated.updatedByAdminId,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
