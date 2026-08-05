import { prisma } from "@beaconu/db";

const ADMIN_SELECT = {
  id: true,
  admissionCycleId: true,
  courseId: true,
  applicationFee: true,
  interviewRequired: true,
  assessmentRequired: true,
  tokenPaymentStage: true,
  tokenAmount: true,
  workExperienceRequired: true,
  isActive: true,
  createdAt: true,
  course: {
    select: { id: true, name: true, code: true },
  },
} as const;

export class AdmissionCycleCourseRepository {
  static async findCycleInCollege(cycleId: string, collegeId: string) {
    return prisma.admissionCycle.findFirst({
      where: { id: cycleId, collegeId },
      select: { id: true },
    });
  }

  static async findCourseInCollege(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true },
    });
  }

  static async findByCycleId(admissionCycleId: string) {
    return prisma.admissionCycleCourse.findMany({
      where: { admissionCycleId },
      select: ADMIN_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  static async findByCycleAndCourse(
    admissionCycleId: string,
    courseId: string,
  ) {
    return prisma.admissionCycleCourse.findUnique({
      where: { uq_cycle_course: { admissionCycleId, courseId } },
      select: ADMIN_SELECT,
    });
  }

  static async create(data: {
    admissionCycleId: string;
    courseId: string;
    applicationFee: number;
    interviewRequired: boolean;
    assessmentRequired: boolean;
    tokenPaymentStage: string | null;
    tokenAmount: number | null;
    workExperienceRequired: boolean;
  }) {
    return prisma.admissionCycleCourse.create({
      data,
      select: ADMIN_SELECT,
    });
  }

  static async reactivate(
    id: string,
    data: {
      applicationFee: number;
      interviewRequired: boolean;
      assessmentRequired: boolean;
      tokenPaymentStage: string | null;
      tokenAmount: number | null;
      workExperienceRequired: boolean;
    },
  ) {
    return prisma.admissionCycleCourse.update({
      where: { id },
      data: { ...data, isActive: true },
      select: ADMIN_SELECT,
    });
  }

  static async update(
    admissionCycleId: string,
    id: string,
    data: Record<string, unknown>,
  ) {
    const existing = await prisma.admissionCycleCourse.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.admissionCycleCourse.update({
      where: { id },
      data: data as any,
      select: ADMIN_SELECT,
    });
  }

  static async softDeleteById(admissionCycleId: string, id: string) {
    const existing = await prisma.admissionCycleCourse.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.admissionCycleCourse.update({
      where: { id },
      data: { isActive: false },
      select: ADMIN_SELECT,
    });
  }
}
