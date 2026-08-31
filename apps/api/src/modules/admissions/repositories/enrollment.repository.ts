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
      where: { studentId, collegeId, status: "active" },
      select: { id: true },
    });
    return row !== null;
  }

  static async listStudentIdsForCollege(collegeId: string) {
    const rows = await prisma.enrollment.findMany({
      where: { collegeId, status: "active" },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    return rows.map((row) => row.studentId);
  }

  static async updateStatus(
    tx: Prisma.TransactionClient,
    id: string,
    status: string,
  ) {
    return tx.enrollment.update({
      where: { id },
      data: { status },
      select: { id: true, studentId: true },
    });
  }

  static async findActiveForStudent(studentId: string) {
    return prisma.enrollment.findFirst({
      where: { studentId, status: "active" },
      select: {
        id: true,
        collegeId: true,
        courseId: true,
        applicationCourseId: true,
        admissionCycleId: true,
        academicYear: true,
        college: { select: { name: true, communityLinkUrl: true } },
        course: { select: { name: true, duration: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  static async findByApplicationCourseId(applicationCourseId: string) {
    return prisma.enrollment.findUnique({
      where: { applicationCourseId },
      select: ENROLLMENT_SELECT,
    });
  }

  static async findByIdWithApplicationContext(id: string) {
    return prisma.enrollment.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        collegeId: true,
        courseId: true,
        campusId: true,
        admissionCycleId: true,
        academicYear: true,
        status: true,
        applicationCourseId: true,
        course: { select: { name: true, code: true } },
        college: { select: { code: true } },
        applicationCourse: { select: { applicationId: true } },
      },
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
