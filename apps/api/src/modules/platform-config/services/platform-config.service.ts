import { PlatformConfigRepository } from "../repositories/platform-config.repository";
import { UpdatePlatformConfigInput } from "../validators/platform-config.validator";

export class PlatformConfigService {
  static async getConfig() {
    const config = await PlatformConfigRepository.get();
    return {
      meetingGstPercentage: Number(config.meetingGstPercentage),
      counsellorMinWithdrawalAmount: Number(
        config.counsellorMinWithdrawalAmount,
      ),
      studentReferralPercentage: Number(config.studentReferralPercentage),
      studentMinWithdrawalAmount: Number(config.studentMinWithdrawalAmount),
      updatedByAdminId: config.updatedByAdminId,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  static async updateConfig(data: UpdatePlatformConfigInput, adminId: string) {
    const updated = await PlatformConfigRepository.update(data, adminId);
    return {
      meetingGstPercentage: Number(updated.meetingGstPercentage),
      counsellorMinWithdrawalAmount: Number(
        updated.counsellorMinWithdrawalAmount,
      ),
      studentReferralPercentage: Number(updated.studentReferralPercentage),
      studentMinWithdrawalAmount: Number(updated.studentMinWithdrawalAmount),
      updatedByAdminId: updated.updatedByAdminId,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
