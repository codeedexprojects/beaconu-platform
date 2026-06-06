import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import type {
  StudentCounsellingReview,
  StudentHostelReview,
  StudentCollegeReview,
  StudentProfile,
  StudentProfileMetadata,
} from "@beaconu/types";

export class StudentsQuery {
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
