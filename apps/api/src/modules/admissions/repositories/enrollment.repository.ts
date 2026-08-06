import { randomUUID } from "crypto";
import { prisma, Prisma } from "@beaconu/db";

const ENROLLMENT_SELECT = {
  id: true,
  studentId: true,
  collegeId: true,
  courseId: true,
  campusId: true,
  applicationCourseId: true,
  admissionCycleId: true,
  enrollmentNumber: true,
  academicYear: true,
  enrolledAt: true,
  status: true,
  completedAt: true,
  createdAt: true,
  course: { select: { name: true, code: true } },
} as const;

export class EnrollmentRepository {
  static async existsForStudentAtCollege(studentId: string, collegeId: string) {
    const row = await prisma.enrollment.findFirst({
      where: { studentId, collegeId },
      select: { id: true },
    });
    return row !== null;
  }

  static async findByApplicationCourseId(applicationCourseId: string) {
    return prisma.enrollment.findUnique({
      where: { applicationCourseId },
      select: ENROLLMENT_SELECT,
    });
  }

  static async findByEnrollmentNumber(enrollmentNumber: string) {
    return prisma.enrollment.findUnique({ where: { enrollmentNumber } });
  }

  static async create(
    tx: Prisma.TransactionClient,
    data: {
      studentId: string;
      collegeId: string;
      courseId: string;
      campusId: string | null;
      applicationCourseId: string;
      admissionCycleId: string;
      academicYear: string;
    },
  ) {
    const placeholder = randomUUID().replace(/-/g, "").slice(0, 30);
    return tx.enrollment.create({
      data: { ...data, enrollmentNumber: placeholder },
      select: ENROLLMENT_SELECT,
    });
  }

  static async setEnrollmentNumber(
    tx: Prisma.TransactionClient,
    id: string,
    enrollmentNumber: string,
  ) {
    return tx.enrollment.update({
      where: { id },
      data: { enrollmentNumber },
      select: ENROLLMENT_SELECT,
    });
  }
}
