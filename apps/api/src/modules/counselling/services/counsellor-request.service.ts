import { CounsellorRequestRepository } from "../repositories/counsellor-request.repository";
import {
  SubmitCounsellorRequestData,
  UpdateCounsellorRequestStatusData,
  ListCounsellorRequestsData,
} from "../validators/counsellor-request.validator";
import { NotFoundError } from "@/shared/errors";

function formatRequest(request: {
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
}) {
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

    return {
      data: requests.map(formatRequest),
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
    return formatRequest(request);
  }

  static async updateStatus(
    id: string,
    data: UpdateCounsellorRequestStatusData,
    reviewedBy: string,
  ) {
    const existing = await CounsellorRequestRepository.findById(id);
    if (!existing) throw new NotFoundError("Counsellor request not found");

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
    };
  }
}
