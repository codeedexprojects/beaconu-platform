import { NotFoundError } from "@/shared/errors";
import { CounsellingRepository } from "../repositories/counselling.repository";
import {
  UpdateMyProfileInput,
  UpdateCounsellorStatusInput,
} from "../validators/counselling.validator";

function formatCounsellor(counsellor: any) {
  if (!counsellor) return counsellor;
  return {
    id: counsellor.id,
    counsellor_code: counsellor.counsellorCode ?? null,
    full_name: counsellor.fullName,
    email: counsellor.email,
    phone_number: counsellor.phoneNumber,
    avatar_url: counsellor.avatarUrl ?? null,
    counsellor_type: counsellor.counsellorType,
    status: counsellor.status,
    rating: Number(counsellor.rating ?? 0.0),
    known_languages: counsellor.knownLanguages,
    session_fee: Number(counsellor.sessionFee ?? 0.0),
    wallet_balance: Number(counsellor.wallet?.balance ?? 0.0),
    profile_metadata: counsellor.profileMetadata,
    last_login_at: counsellor.lastLoginAt,
    created_at: counsellor.createdAt,
    updated_at: counsellor.updatedAt,
  };
}

export class CounsellingService {
  static async getMyProfile(userId: string) {
    const counsellor = await CounsellingRepository.findById(userId);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    return formatCounsellor(counsellor);
  }

  static async updateMyProfile(userId: string, data: UpdateMyProfileInput) {
    const counsellor = await CounsellingRepository.findById(userId);
    if (!counsellor) throw new NotFoundError("Counsellor not found");

    const updated = await CounsellingRepository.updateById(userId, {
      ...(data.full_name ? { fullName: data.full_name } : {}),
      ...(data.phone_number !== undefined
        ? { phoneNumber: data.phone_number }
        : {}),
      ...(data.avatar_url !== undefined ? { avatarUrl: data.avatar_url } : {}),
      ...(data.counsellor_type !== undefined
        ? { counsellorType: data.counsellor_type }
        : {}),
      ...(data.known_languages !== undefined
        ? { knownLanguages: data.known_languages }
        : {}),
      ...(data.session_fee !== undefined
        ? { sessionFee: data.session_fee }
        : {}),
    });

    return formatCounsellor(updated);
  }

  static async listAll(filters: {
    counsellor_type?: string;
    status?: string;
    language?: string;
  }) {
    const counsellors = await CounsellingRepository.findAll({
      counsellorType: filters.counsellor_type,
      status: filters.status,
      language: filters.language,
    });
    return counsellors.map(formatCounsellor);
  }

  static async getById(id: string) {
    const counsellor = await CounsellingRepository.findById(id);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    return formatCounsellor(counsellor);
  }

  static async updateStatus(id: string, data: UpdateCounsellorStatusInput) {
    const counsellor = await CounsellingRepository.findById(id);
    if (!counsellor) throw new NotFoundError("Counsellor not found");
    const updated = await CounsellingRepository.updateStatus(id, data.status);
    return formatCounsellor(updated);
  }
}
