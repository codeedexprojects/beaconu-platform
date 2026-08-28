import { randomUUID } from "crypto";
import { prisma, Prisma } from "@beaconu/db";

const APPLICATION_SELECT = {
  id: true,
  applicationNumber: true,
  studentId: true,
  collegeId: true,
  campusId: true,
  admissionCycleId: true,
  currentStep: true,
  formStatus: true,
  profilePhotoUrl: true,
  whatsappCountryCode: true,
  whatsappNumber: true,
  nationality: true,
  stateOfDomicile: true,
  passportCountry: true,
  passportNumber: true,
  totalApplicationFee: true,
  feePaymentStatus: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const APPLICATION_LIST_SELECT = {
  ...APPLICATION_SELECT,
  admissionCycle: {
    select: { id: true, name: true, admissionYear: true, status: true },
  },
  college: {
    select: { id: true, name: true, slug: true, logoUrl: true },
  },
} as const;

export class ApplicationRepository {
  static async countNewlySubmittedForCollege(collegeId: string) {
    return prisma.application.count({
      where: { collegeId, formStatus: "submitted" },
    });
  }

  static async findCycleForApply(admissionCycleId: string) {
    return prisma.admissionCycle.findUnique({
      where: { id: admissionCycleId },
      select: {
        id: true,
        collegeId: true,
        status: true,
        admissionYear: true,
        startsOn: true,
        endsOn: true,
        college: { select: { code: true } },
      },
    });
  }

  static async findCampusInCollege(campusId: string, collegeId: string) {
    return prisma.campus.findFirst({
      where: { id: campusId, collegeId },
      select: { id: true },
    });
  }

  static async findActiveCourseSelectionInCollege(
    studentId: string,
    collegeId: string,
    courseId: string,
  ) {
    return prisma.applicationCourse.findFirst({
      where: {
        courseId,
        // "withdrawn" = student removed this course pre-decision, still
        // filling the application. "dropped_out" = a confirmed seat was
        // later cancelled (see SeatCancellationService). Both are terminal,
        // non-blocking states — the student is free to submit a fresh
        // application for the same course again.
        status: { notIn: ["withdrawn", "dropped_out"] },
        application: { studentId, collegeId },
      },
      select: { id: true, applicationId: true, status: true },
    });
  }

  static async findByIdForStudent(id: string, studentId: string) {
    return prisma.application.findFirst({
      where: { id, studentId },
      select: APPLICATION_SELECT,
    });
  }

  static async findByIdWithCoursesForStudent(id: string, studentId: string) {
    return prisma.application.findFirst({
      where: { id, studentId },
      select: {
        id: true,
        collegeId: true,
        applicationNumber: true,
        formStatus: true,
        admissionCycle: {
          select: { assessmentRequired: true, interviewRequired: true },
        },
        applicationCourses: {
          where: { status: { not: "withdrawn" } },
          select: {
            id: true,
            status: true,
            course: { select: { name: true } },
          },
        },
      },
    });
  }

  static async findByIdWithCoursesForCollege(id: string, collegeId: string) {
    return prisma.application.findFirst({
      where: { id, collegeId },
      select: {
        id: true,
        collegeId: true,
        applicationNumber: true,
        formStatus: true,
        admissionCycle: {
          select: { assessmentRequired: true, interviewRequired: true },
        },
        applicationCourses: {
          where: { status: { not: "withdrawn" } },
          select: {
            id: true,
            status: true,
            course: { select: { name: true } },
          },
        },
      },
    });
  }

  static async create(data: {
    studentId: string;
    collegeId: string;
    campusId: string | null;
    admissionCycleId: string;
    nationality: string;
    stateOfDomicile: string | null;
    passportCountry: string | null;
    passportNumber: string | null;
  }) {
    const placeholder = randomUUID().replace(/-/g, "").slice(0, 30);
    return prisma.application.create({
      data: { ...data, applicationNumber: placeholder },
      select: APPLICATION_SELECT,
    });
  }

  static async setApplicationNumber(id: string, applicationNumber: string) {
    return prisma.application.update({
      where: { id },
      data: { applicationNumber },
      select: APPLICATION_SELECT,
    });
  }

  static async findOwnDraft(id: string, studentId: string) {
    return prisma.application.findFirst({
      where: { id, studentId },
      select: {
        id: true,
        formStatus: true,
        currentStep: true,
        feePaymentStatus: true,
      },
    });
  }

  static async findDeclaration(id: string, studentId: string) {
    const row = await prisma.application.findFirst({
      where: { id, studentId },
      select: { declaration: true },
    });
    return row?.declaration ?? null;
  }

  static async findEntranceExamDetails(id: string, studentId: string) {
    const row = await prisma.application.findFirst({
      where: { id, studentId },
      select: { entranceExamDetails: true },
    });
    return row?.entranceExamDetails ?? null;
  }

  static async updateDetailStep(
    id: string,
    jsonField: "declaration" | "entranceExamDetails",
    jsonValue: object,
    stepNumber: number,
  ) {
    const current = await prisma.application.findUnique({
      where: { id },
      select: { currentStep: true },
    });
    const nextStep = Math.max(current?.currentStep ?? 1, stepNumber);

    return prisma.application.update({
      where: { id },
      data: {
        [jsonField]: jsonValue,
        currentStep: nextStep,
      },
      select: APPLICATION_SELECT,
    });
  }

  static async advanceStep(
    id: string,
    stepNumber: number,
    topLevelFields?: Record<string, unknown>,
  ) {
    const current = await prisma.application.findUnique({
      where: { id },
      select: { currentStep: true },
    });
    const nextStep = Math.max(current?.currentStep ?? 1, stepNumber);

    return prisma.application.update({
      where: { id },
      data: {
        currentStep: nextStep,
        ...topLevelFields,
      },
      select: APPLICATION_SELECT,
    });
  }

  static async findOwnDraftForSubmit(id: string, studentId: string) {
    return prisma.application.findFirst({
      where: { id, studentId },
      select: {
        id: true,
        formStatus: true,
        feePaymentStatus: true,
        declaration: true,
      },
    });
  }

  static async markSubmitted(
    tx: Prisma.TransactionClient,
    id: string,
    detailsSnapshot: {
      personalDetails: Prisma.InputJsonValue;
      familyDetails: Prisma.InputJsonValue;
      addressDetails: Prisma.InputJsonValue;
      qualificationDetails: Prisma.InputJsonValue;
      achievementsDetails: Prisma.InputJsonValue;
    },
  ) {
    return tx.application.update({
      where: { id },
      data: {
        formStatus: "submitted",
        submittedAt: new Date(),
        currentStep: 9,
        ...detailsSnapshot,
      },
      select: { id: true },
    });
  }

  static async markFeePaid(id: string) {
    return prisma.application.update({
      where: { id },
      data: { feePaymentStatus: "paid" },
      select: { id: true },
    });
  }

  static async hardDeleteFailedDraft(id: string) {
    await prisma.application.delete({ where: { id } });
  }

  static async existsForStudentAtCollege(studentId: string, collegeId: string) {
    const row = await prisma.application.findFirst({
      where: { studentId, collegeId },
      select: { id: true },
    });
    return row !== null;
  }

  static async findAllForStudent(studentId: string, admissionCycleId?: string) {
    return prisma.application.findMany({
      where: { studentId, ...(admissionCycleId && { admissionCycleId }) },
      select: APPLICATION_LIST_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findStatusRows(
    studentId: string,
    filters?: {
      admissionCycleId?: string;
      collegeId?: string;
      applicationId?: string;
    },
  ) {
    return prisma.application.findMany({
      where: {
        studentId,
        ...(filters?.admissionCycleId && {
          admissionCycleId: filters.admissionCycleId,
        }),
        ...(filters?.collegeId && { collegeId: filters.collegeId }),
        ...(filters?.applicationId && { id: filters.applicationId }),
      },
      select: {
        id: true,
        applicationNumber: true,
        formStatus: true,
        feePaymentStatus: true,
        currentStep: true,
        createdAt: true,
        declaration: true,
        qualificationDetails: true,
        achievementsDetails: true,
        entranceExamDetails: true,
        college: { select: { id: true, name: true } },
        admissionCycle: {
          select: {
            id: true,
            name: true,
            assessmentRequired: true,
            tokenOnlinePaymentEnabled: true,
            tokenOfflinePaymentEnabled: true,
          },
        },
        applicationCourses: {
          where: { status: { not: "withdrawn" } },
          select: {
            id: true,
            isPrimary: true,
            status: true,
            course: { select: { id: true, name: true, code: true } },
          },
          orderBy: { preferenceOrder: "asc" },
        },
        student: {
          select: { qualificationDetails: true, achievementsDetails: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findInterviewBookingForApplication(applicationId: string) {
    return prisma.interviewBooking.findFirst({
      where: { applicationId },
      include: { slot: { select: { scheduledDate: true } } },
    });
  }

  static async findOfferLettersByCourseIds(applicationCourseIds: string[]) {
    if (applicationCourseIds.length === 0) return [];
    return prisma.offerLetter.findMany({
      where: { applicationCourseId: { in: applicationCourseIds } },
    });
  }

  static async findEnrollmentsByCourseIds(applicationCourseIds: string[]) {
    if (applicationCourseIds.length === 0) return [];
    return prisma.enrollment.findMany({
      where: { applicationCourseId: { in: applicationCourseIds } },
      select: { applicationCourseId: true, status: true },
    });
  }

  static async findScholarshipApplicationsForApplication(
    applicationId: string,
  ) {
    return prisma.scholarshipApplication.findMany({
      where: { applicationId },
      select: {
        id: true,
        status: true,
        scholarshipConfigId: true,
        scholarshipConfig: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findTokenAmountsForCourses(
    admissionCycleId: string,
    courseIds: string[],
  ) {
    if (courseIds.length === 0) return [];
    return prisma.admissionCycleCourse.findMany({
      where: { admissionCycleId, courseId: { in: courseIds } },
      select: { courseId: true, tokenAmount: true },
    });
  }
}
