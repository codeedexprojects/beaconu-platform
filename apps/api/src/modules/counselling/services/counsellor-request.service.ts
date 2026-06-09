import crypto from "crypto";
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
    counsellorType: string;
    qualification: string | null;
    yearsOfExperience: string | null;
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
    counsellor_type: request.counsellorType,
    qualification: request.qualification,
    years_of_experience: request.yearsOfExperience,
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
    const request = await CounsellorRequestRepository.create(data);
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

      const passwordHash = await CryptoUtils.hash(
        crypto.randomBytes(16).toString("hex"),
      );

      const [updated, counsellor] = await Promise.all([
        CounsellorRequestRepository.updateStatus(id, data, reviewedBy),
        AuthRepository.createCounsellor({
          fullName: existing.fullName,
          email: existing.email,
          passwordHash,
          phoneNumber: existing.phoneNumber,
          counsellorType: existing.counsellorType as "academic" | "mindcare",
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
