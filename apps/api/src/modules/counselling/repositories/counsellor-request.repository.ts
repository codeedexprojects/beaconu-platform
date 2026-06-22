import { prisma } from "@beaconu/db";
import {
  SubmitCounsellorRequestData,
  UpdateCounsellorRequestStatusData,
  ListCounsellorRequestsData,
} from "../validators/counsellor-request.validator";
import { COUNSELLOR_REQUEST_STATUS } from "@/shared/constants";

export class CounsellorRequestRepository {
  static async create(data: SubmitCounsellorRequestData, passwordHash: string) {
    return prisma.counsellorRegistrationRequest.create({
      data: {
        fullName: data.full_name,
        email: data.email,
        phoneNumber: data.phone_number,
        gender: data.gender,
        city: data.city,
        counsellorType: data.counsellor_type,
        qualification: data.qualification,
        yearsOfExperience: data.years_of_experience,
        knownLanguages: data.known_languages,
        specialization: data.specialization,
        licenseNumber: data.license_number,
        message: data.message,
        passwordHash,
        status: COUNSELLOR_REQUEST_STATUS.PENDING,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.counsellorRegistrationRequest.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });
  }

  static async findById(id: string) {
    return prisma.counsellorRegistrationRequest.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  static async findMany(filters: ListCounsellorRequestsData) {
    const { status, counsellor_type, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(counsellor_type ? { counsellorType: counsellor_type } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [requests, total] = await Promise.all([
      prisma.counsellorRegistrationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      prisma.counsellorRegistrationRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }

  static async updateStatus(
    id: string,
    data: UpdateCounsellorRequestStatusData,
    reviewedBy: string,
  ) {
    return prisma.counsellorRegistrationRequest.update({
      where: { id },
      data: {
        status: data.status,
        reviewRemarks: data.review_remarks,
        reviewedBy,
      },
    });
  }
}
