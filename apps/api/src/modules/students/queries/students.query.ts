import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import type { StudentProfile, StudentProfileMetadata } from "@beaconu/types";

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
      },
    });

    if (!student) throw new NotFoundError("Student not found");

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
      profileMetadata: (student.profileMetadata ?? {}) as StudentProfileMetadata,
      lastLoginAt: student.lastLoginAt ? student.lastLoginAt.toISOString() : null,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  }
}
