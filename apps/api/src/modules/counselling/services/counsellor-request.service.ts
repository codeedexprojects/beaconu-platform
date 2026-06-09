import { CounsellorRequestRepository } from "../repositories/counsellor-request.repository";
import {
  SubmitCounsellorRequestData,
  UpdateCounsellorRequestStatusData,
  ListCounsellorRequestsData,
} from "../validators/counsellor-request.validator";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { AuthRepository } from "@/modules/auth/repositories/auth.repository";
import { CryptoUtils } from "@/shared/utils";

function formatRequest(
  request: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    gender: string | null;
    city: string | null;
    counsellorType: string;
    qualification: string | null;
    yearsOfExperience: string | null;
    knownLanguages: string | null;
    specialization: string | null;
    licenseNumber: string | null;
    message: string | null;
    status: string;
    reviewRemarks: string | null;
    reviewer: { id: string; fullName: string; email: string } | null;
    createdAt: Date;
    updatedAt: Date;
  },
  counsellorCode?: string | null,
) {
  return {
    id: request.id,
    full_name: request.fullName,
    email: request.email,
    phone_number: request.phoneNumber,
    gender: request.gender,
    city: request.city,
    counsellor_type: request.counsellorType,
    qualification: request.qualification,
    years_of_experience: request.yearsOfExperience,
    known_languages: request.knownLanguages,
    specialization: request.specialization,
    license_number: request.licenseNumber,
    message: request.message,
    status: request.status,
    review_remarks: request.reviewRemarks,
    counsellor_code: counsellorCode ?? null,
    reviewer: request.reviewer
      ? { id: request.reviewer.id, name: request.reviewer.fullName }
      : null,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  };
}

export class CounsellorRequestService {
  static async submit(data: SubmitCounsellorRequestData) {
    const existing = await AuthRepository.findCounsellorByEmail(data.email);
    if (existing) {
      throw new ConflictError("An account already exists with this email");
    }

    const passwordHash = await CryptoUtils.hash(data.password);
    const request = await CounsellorRequestRepository.create(
      data,
      passwordHash,
    );
    return {
      id: request.id,
      status: request.status,
      created_at: request.createdAt,
    };
  }

  static async list(filters: ListCounsellorRequestsData) {
    const { requests, total, page, limit } =
      await CounsellorRequestRepository.findMany(filters);

    const approvedEmails = requests
      .filter((r) => r.status === "approved")
      .map((r) => r.email);

    const codeMap =
      await AuthRepository.findCounsellorCodesByEmails(approvedEmails);

    return {
      data: requests.map((r) => formatRequest(r, codeMap.get(r.email) ?? null)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const request = await CounsellorRequestRepository.findById(id);
    if (!request) throw new NotFoundError("Counsellor request not found");

    let counsellorCode: string | null = null;
    if (request.status === "approved") {
      const counsellor = await AuthRepository.findCounsellorByEmail(
        request.email,
      );
      counsellorCode = counsellor?.counsellorCode ?? null;
    }

    return formatRequest(request, counsellorCode);
  }

  static async updateStatus(
    id: string,
    data: UpdateCounsellorRequestStatusData,
    reviewedBy: string,
  ) {
    const existing = await CounsellorRequestRepository.findById(id);
    if (!existing) throw new NotFoundError("Counsellor request not found");

    if (data.status === "approved") {
      const existingCounsellor = await AuthRepository.findCounsellorByEmail(
        existing.email,
      );
      if (existingCounsellor) {
        throw new ConflictError(
          "A counsellor account already exists for this email",
        );
      }

      if (!existing.passwordHash) {
        throw new ConflictError(
          "Registration is missing password — counsellor must re-register",
        );
      }

      const [updated, counsellor] = await Promise.all([
        CounsellorRequestRepository.updateStatus(id, data, reviewedBy),
        AuthRepository.createCounsellor({
          fullName: existing.fullName,
          email: existing.email,
          passwordHash: existing.passwordHash,
          phoneNumber: existing.phoneNumber,
          counsellorType: existing.counsellorType as "academic" | "mindcare",
          knownLanguages: existing.knownLanguages,
          profileMetadata: {
            gender: existing.gender ?? undefined,
            city: existing.city ?? undefined,
            specialization: existing.specialization ?? undefined,
            license_number: existing.licenseNumber ?? undefined,
          },
          status: "active",
        }),
      ]);

      return {
        id: updated.id,
        status: updated.status,
        review_remarks: updated.reviewRemarks,
        updated_at: updated.updatedAt,
        counsellor_code: counsellor.counsellorCode,
      };
    }

    const updated = await CounsellorRequestRepository.updateStatus(
      id,
      data,
      reviewedBy,
    );

    return {
      id: updated.id,
      status: updated.status,
      review_remarks: updated.reviewRemarks,
      updated_at: updated.updatedAt,
      counsellor_code: null,
    };
  }
}
