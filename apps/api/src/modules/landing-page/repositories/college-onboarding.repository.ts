import { prisma } from "@beaconu/db";
import {
  SubmitCollegeOnboardingData,
  UpdateOnboardingStatusData,
  ListOnboardingRequestsData,
} from "../validators/college-onboarding.validator";
import { COLLEGE_ONBOARDING_STATUS } from "@/shared/constants";

export class CollegeOnboardingRepository {
  static async findByContactEmail(email: string, excludeId?: string) {
    return prisma.collegeOnboardingRequest.findFirst({
      where: {
        contactEmail: {
          equals: email,
          mode: "insensitive",
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: {
        id: true,
      },
    });
  }

  static async create(data: SubmitCollegeOnboardingData) {
    return prisma.collegeOnboardingRequest.create({
      data: {
        collegeName: data.college_name,
        universityName: data.university_name,
        contactPersonName: data.contact_person_name,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        city: data.city,
        state: data.state,
        groupCode: data.group_code,
        message: data.message,
        status: COLLEGE_ONBOARDING_STATUS.PENDING,
      },
    });
  }

  static async updateLead(id: string, data: SubmitCollegeOnboardingData) {
    return prisma.collegeOnboardingRequest.update({
      where: { id },
      data: {
        collegeName: data.college_name,
        universityName: data.university_name,
        contactPersonName: data.contact_person_name,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        city: data.city,
        state: data.state,
        groupCode: data.group_code,
        message: data.message,
      },
    });
  }

  static async findById(id: string) {
    return prisma.collegeOnboardingRequest.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: { id: true, fullName: true, email: true },
        },
        createdCollege: {
          select: {
            id: true,
            slug: true,
            settings: true,
            institutionGroups: {
              select: { groupCode: true },
            },
          },
        },
      },
    });
  }

  static async findMany(filters: ListOnboardingRequestsData) {
    const { status, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                collegeName: { contains: search, mode: "insensitive" as const },
              },
              {
                contactPersonName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                contactEmail: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              { city: { contains: search, mode: "insensitive" as const } },
              { state: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [requests, total] = await Promise.all([
      prisma.collegeOnboardingRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: { id: true, fullName: true, email: true },
          },
          createdCollege: {
            select: {
              id: true,
              slug: true,
              settings: true,
              institutionGroups: {
                select: { groupCode: true },
              },
              staffMembers: {
                select: { id: true, status: true },
                take: 1,
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      }),
      prisma.collegeOnboardingRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }

  static async updateStatus(
    id: string,
    data: UpdateOnboardingStatusData,
    reviewedBy: string,
  ) {
    return prisma.collegeOnboardingRequest.update({
      where: { id },
      data: {
        status: data.status,
        reviewRemarks: data.review_remarks,
        reviewedBy,
      },
    });
  }

  static async countByStatus() {
    return prisma.collegeOnboardingRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
  }
}
