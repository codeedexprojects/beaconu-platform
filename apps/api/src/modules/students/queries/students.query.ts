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
  static async listEnrolledForCollege(
    collegeId: string,
    filters: { search?: string; status?: string; page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        student: {
          OR: [
            {
              fullName: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              phoneNumber: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          ],
        },
      }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.enrollment.findMany({
        where,
        select: {
          id: true,
          enrollmentNumber: true,
          academicYear: true,
          status: true,
          enrolledAt: true,
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              avatarUrl: true,
            },
          },
          course: { select: { id: true, name: true, code: true } },
        },
        orderBy: { enrolledAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.enrollment.count({ where }),
    ]);

    const studentIds = [...new Set(rows.map((row) => row.student.id))];
    const [codes, referralGroups, cards, pendingRedemptions] =
      await Promise.all([
        prisma.studentReferralCode.findMany({
          where: { studentId: { in: studentIds } },
          select: { studentId: true, code: true, isActive: true },
        }),
        prisma.studentReferral.groupBy({
          by: ["referrerStudentId", "status"],
          where: { referrerStudentId: { in: studentIds } },
          _count: { _all: true },
          _sum: { payoutAmount: true },
        }),
        prisma.beaconuCard.findMany({
          where: { studentId: { in: studentIds } },
          select: {
            studentId: true,
            balance: true,
            totalEarned: true,
            totalWithdrawn: true,
          },
        }),
        prisma.studentWalletTransaction.groupBy({
          by: ["studentId"],
          where: {
            studentId: { in: studentIds },
            type: "debit",
            withdrawalStatus: "pending",
          },
          _sum: { amount: true },
        }),
      ]);

    const referralFor = (studentId: string) => {
      const code = codes.find((c) => c.studentId === studentId);
      const groups = referralGroups.filter(
        (g) => g.referrerStudentId === studentId && g.status !== "void",
      );
      if (!code && groups.length === 0) return null;
      const count = (status: string) =>
        groups.find((g) => g.status === status)?._count._all ?? 0;
      return {
        code: code?.code ?? null,
        isActive: code?.isActive ?? false,
        invited: groups.reduce((sum, g) => sum + g._count._all, 0),
        enrolled: count("enrolled") + count("paid"),
        rewarded: count("paid"),
        earned: groups
          .reduce((sum, g) => sum + Number(g._sum.payoutAmount ?? 0), 0)
          .toFixed(2),
      };
    };

    const walletFor = (studentId: string) => {
      const card = cards.find((c) => c.studentId === studentId);
      if (!card) return null;
      const pending = pendingRedemptions.find((p) => p.studentId === studentId);
      return {
        balance: card.balance.toString(),
        totalEarned: card.totalEarned.toString(),
        totalWithdrawn: card.totalWithdrawn.toString(),
        pendingRedemption: Number(pending?._sum.amount ?? 0).toFixed(2),
      };
    };

    return {
      students: rows.map((row) => ({
        id: row.student.id,
        fullName: row.student.fullName,
        email: row.student.email,
        phoneNumber: row.student.phoneNumber,
        avatarUrl: row.student.avatarUrl,
        enrollmentId: row.id,
        enrollmentNumber: row.enrollmentNumber,
        courseId: row.course.id,
        courseName: row.course.name,
        courseCode: row.course.code,
        academicYear: row.academicYear,
        enrollmentStatus: row.status,
        enrolledAt: row.enrolledAt.toISOString(),
        referral: referralFor(row.student.id),
        wallet: walletFor(row.student.id),
      })),
      meta: PaginationHelper.createMeta(total, filters.page, filters.limit),
    };
  }

  static async listMinimalForCollege(
    collegeId: string,
    filters: { search?: string; page: number; limit: number },
  ) {
    const where = {
      enrollments: { some: { collegeId } },
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
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          avatarUrl: true,
        },
        orderBy: { fullName: "asc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students: rows,
      meta: PaginationHelper.createMeta(total, filters.page, filters.limit),
    };
  }

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

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: id, status: "active" },
      select: { collegeId: true, college: { select: { name: true } } },
      orderBy: { enrolledAt: "desc" },
    });

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
      enrolledCollege: enrollment
        ? { collegeId: enrollment.collegeId, name: enrollment.college.name }
        : null,
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
