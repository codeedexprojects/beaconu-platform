import { NotFoundError } from "@/shared/errors";
import { CounsellingRepository } from "../repositories/counselling.repository";
import {
  UpdateMyProfileInput,
  UpdateCounsellorStatusInput,
} from "../validators/counselling.validator";

export class CounsellingService {
  static async getMyProfile(userId: string) {
    const counsellor = await CounsellingRepository.findById(userId);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    return counsellor;
  }

  static async updateMyProfile(userId: string, data: UpdateMyProfileInput) {
    const counsellor = await CounsellingRepository.findById(userId);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    return CounsellingRepository.updateById(userId, {
      ...(data.full_name ? { fullName: data.full_name } : {}),
      ...(data.phone_number !== undefined
        ? { phoneNumber: data.phone_number }
        : {}),
      ...(data.avatar_url !== undefined ? { avatarUrl: data.avatar_url } : {}),
    });
  }

  static async listAll(filters: { counsellor_type?: string; status?: string }) {
    return CounsellingRepository.findAll({
      counsellorType: filters.counsellor_type,
      status: filters.status,
    });
  }

  static async getById(id: string) {
    const counsellor = await CounsellingRepository.findById(id);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    return counsellor;
  }

  static async updateStatus(id: string, data: UpdateCounsellorStatusInput) {
    const counsellor = await CounsellingRepository.findById(id);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    return CounsellingRepository.updateStatus(id, data.status);
  }
}
