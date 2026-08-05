import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import type {
  AdminStudentListItem,
  StudentCounsellingReview,
  StudentHostelReview,
  StudentCollegeReview,
  StudentProfile,
  StudentProfileMetadata,
} from "@beaconu/types";

const ADMIN_LIST_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  phoneCountryCode: true,
  avatarUrl: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  source: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

function mapAdminListItem(row: {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  phoneCountryCode: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  source: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}): AdminStudentListItem {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phoneNumber: row.phoneNumber,
    phoneCountryCode: row.phoneCountryCode,
    avatarUrl: row.avatarUrl,
    isEmailVerified: row.isEmailVerified,
    isPhoneVerified: row.isPhoneVerified,
    source: row.source,
    status: row.status,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class StudentsQuery {
  static async listForAdmin(filters: {
    search?: string;
    status?: string;
    source?: string;
    page: number;
    limit: number;
  }) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
      ...(filters.search && {
        OR: [
          {
            fullName: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          { email: { contains: filters.search, mode: "insensitive" as const } },
          {
            phoneNumber: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        select: ADMIN_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: rows.map(mapAdminListItem),
      meta: PaginationHelper.createMeta(total, filters.page, filters.limit),
    };
  }

  static async getProfile(id: string): Promise<StudentProfile> {
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        phoneCountryCode: true,
        avatarUrl: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        source: true,
        status: true,
        profileMetadata: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        collegeReviews: {
          select: {
            id: true,
            collegeId: true,
            rating: true,
            reviewText: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        hostelReviews: {
          select: {
            id: true,
            hostelId: true,
            rating: true,
            reviewText: true,
            isVerified: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        counsellingSessions: {
          where: { rating: { not: null } },
          select: {
            id: true,
            counsellorId: true,
            rating: true,
            ratingFeedback: true,
            scheduledDate: true,
            status: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!student) throw new NotFoundError("Student not found");

    const collegeReviews: StudentCollegeReview[] = student.collegeReviews.map(
      (review) => ({
        id: review.id,
        collegeId: review.collegeId,
        rating: review.rating,
        reviewText: review.reviewText ?? null,
        status: review.status,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      }),
    );

    const hostelReviews: StudentHostelReview[] = student.hostelReviews.map(
      (review) => ({
        id: review.id,
        hostelId: review.hostelId,
        rating: review.rating,
        reviewText: review.reviewText ?? null,
        isVerified: review.isVerified,
        status: review.status,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      }),
    );

    const counsellingReviews: StudentCounsellingReview[] =
      student.counsellingSessions.map((session) => ({
        sessionId: session.id,
        counsellorId: session.counsellorId,
        rating: session.rating ?? 0,
        ratingFeedback: session.ratingFeedback ?? null,
        scheduledDate: session.scheduledDate.toISOString(),
        status: session.status,
        updatedAt: session.updatedAt.toISOString(),
      }));

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email ?? null,
      phoneNumber: student.phoneNumber ?? null,
      phoneCountryCode: student.phoneCountryCode ?? null,
      avatarUrl: student.avatarUrl ?? null,
      isEmailVerified: student.isEmailVerified,
      isPhoneVerified: student.isPhoneVerified,
      source: student.source,
      status: student.status,
      profileMetadata: (student.profileMetadata ??
        {}) as StudentProfileMetadata,
      lastLoginAt: student.lastLoginAt
        ? student.lastLoginAt.toISOString()
        : null,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
      reviews: {
        collegeReviews,
        hostelReviews,
        counsellingReviews,
      },
    };
  }
}
