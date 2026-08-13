import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

const STUDENT_SELECT = {
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
} as const;

export class StudentsRepository {
  static async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      select: STUDENT_SELECT,
    });
  }

  static async findByEmail(email: string) {
    return prisma.student.findUnique({
      where: { email },
      select: STUDENT_SELECT,
    });
  }

  static async updateById(
    id: string,
    data: {
      fullName?: string;
      email?: string | null;
      avatarUrl?: string | null;
      profileMetadata?: Prisma.InputJsonValue;
    },
  ) {
    return prisma.student.update({
      where: { id },
      data,
      select: STUDENT_SELECT,
    });
  }

  static async updateDetailStep(
    id: string,
    field:
      | "personalDetails"
      | "familyDetails"
      | "addressDetails"
      | "qualificationDetails"
      | "achievementsDetails",
    value: Prisma.InputJsonValue,
  ) {
    return prisma.student.update({
      where: { id },
      data: { [field]: value },
      select: { id: true },
    });
  }

  static async findQualificationDetails(id: string) {
    const row = await prisma.student.findUnique({
      where: { id },
      select: { qualificationDetails: true },
    });
    return row?.qualificationDetails ?? {};
  }

  static async findDetailsForSnapshot(id: string) {
    return prisma.student.findUnique({
      where: { id },
      select: {
        personalDetails: true,
        familyDetails: true,
        addressDetails: true,
        qualificationDetails: true,
        achievementsDetails: true,
      },
    });
  }

  static async setStatus(id: string, status: string) {
    return prisma.student.update({
      where: { id },
      data: { status },
      select: STUDENT_SELECT,
    });
  }
}
