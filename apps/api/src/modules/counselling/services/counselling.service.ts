import { Prisma } from "@beaconu/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { CounsellingRepository } from "../repositories/counselling.repository";
import {
  UpdateMyProfileInput,
  UpdateCounsellorStatusInput,
} from "../validators/counselling.validator";

function deriveExpertise(metadata: Record<string, unknown>): string[] {
  if (Array.isArray(metadata.expertise)) return metadata.expertise;
  if (typeof metadata.specialization === "string") {
    return metadata.specialization
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function deriveEducation(metadata: Record<string, unknown>): string[] {
  if (Array.isArray(metadata.education)) return metadata.education;
  if (
    typeof metadata.qualification === "string" &&
    metadata.qualification.trim()
  ) {
    return [metadata.qualification.trim()];
  }
  return [];
}

function formatCounsellor(counsellor: any) {
  if (!counsellor) return counsellor;
  const metadata = counsellor.profileMetadata ?? {};
  const isMindcare = counsellor.counsellorType === "mindcare";
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
    session_fee: isMindcare ? null : Number(counsellor.sessionFee ?? 0.0),
    wallet_balance: isMindcare
      ? null
      : Number(counsellor.wallet?.balance ?? 0.0),
    about: metadata.about ?? null,
    expertise: deriveExpertise(metadata),
    education: deriveEducation(metadata),
    upi_id: isMindcare ? null : (counsellor.upiId ?? null),
    bank_details: isMindcare ? null : (counsellor.bankDetails ?? {}),
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

    const resolvedType = data.counsellor_type ?? counsellor.counsellorType;
    if (resolvedType === "mindcare") {
      if (
        data.session_fee !== undefined ||
        data.upi_id !== undefined ||
        data.bank_details !== undefined
      ) {
        throw new ValidationError(
          "session_fee, upi_id, and bank_details are not applicable to MindCare counsellors",
        );
      }
    }

    const existingMetadata = (counsellor.profileMetadata ?? {}) as Record<
      string,
      unknown
    >;
    const metadataUpdate: Record<string, unknown> = {};
    if (data.about !== undefined) metadataUpdate.about = data.about;
    if (data.expertise !== undefined) metadataUpdate.expertise = data.expertise;
    if (data.education !== undefined) metadataUpdate.education = data.education;

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
      ...(data.upi_id !== undefined ? { upiId: data.upi_id } : {}),
      ...(data.bank_details !== undefined
        ? { bankDetails: data.bank_details as Prisma.InputJsonValue }
        : {}),
      ...(Object.keys(metadataUpdate).length > 0
        ? {
            profileMetadata: {
              ...existingMetadata,
              ...metadataUpdate,
            } as Prisma.InputJsonValue,
          }
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
