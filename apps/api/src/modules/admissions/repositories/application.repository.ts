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

  /** The cross-application duplicate-course guard: is `courseId` already
   * actively (non-withdrawn) selected in ANY of this student's
   * Applications at this COLLEGE — across every admission cycle, not just
   * the current one? Used by both start() (the primary course) and
   * addCourse() (any additional course) — a course can only ever be "live"
   * in one of the student's applications at a college at a time. */
  static async findActiveCourseSelectionInCollege(
    studentId: string,
    collegeId: string,
    courseId: string,
  ) {
    return prisma.applicationCourse.findFirst({
      where: {
        courseId,
        status: { not: "withdrawn" },
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

  /** applicationNumber is @unique @db.VarChar(30) with no DB default, so we
   * seed it with a throwaway placeholder (guaranteed unique, fits the column)
   * and overwrite it right after with the human-readable number derived from
   * the row's own atomically-generated `id` — see ApplicationService.start(). */
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

  /** Full-replace write for a JSON blob that genuinely lives on Application
   * itself (only "declaration" left — personal/family/address/qualification
   * moved to the Student profile, see StudentsService). Advances currentStep
   * to the furthest step reached so far — never regresses it if the student
   * revisits an earlier step. */
  static async updateDetailStep(
    id: string,
    jsonField: "declaration",
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

  /** Progress-tracking-only advance for the four steps whose actual data
   * now lives on Student (see StudentsService.update*Details) — this just
   * bumps currentStep (never regressing) and, for personal details only,
   * patches the handful of top-level Application columns that conceptually
   * belong to it (profile photo, WhatsApp) which weren't part of the move. */
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

  /** `detailsSnapshot` freezes the student's current personal/family/
   * address/qualification details onto this specific Application row —
   * a one-time copy taken here at submit, never updated again even if the
   * student's Student-level profile changes afterward. */
  static async markSubmitted(
    tx: Prisma.TransactionClient,
    id: string,
    detailsSnapshot: {
      personalDetails: Prisma.InputJsonValue;
      familyDetails: Prisma.InputJsonValue;
      addressDetails: Prisma.InputJsonValue;
      qualificationDetails: Prisma.InputJsonValue;
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

  /** Compensating rollback for Start Application only: if primary-course
   * creation fails after the draft Application row was already created
   * (bad course/quota id, no seats), the half-created draft must not
   * survive — the idempotent "existing draft" check on retry would
   * otherwise return this broken, course-less row forever, permanently
   * blocking the student from starting over. This is not a general delete
   * capability; the row being removed never became a real business
   * record. */
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

  static async findAllForStudent(studentId: string, admissionCycleId?: string) {
    return prisma.application.findMany({
      where: { studentId, ...(admissionCycleId && { admissionCycleId }) },
      select: APPLICATION_LIST_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  /** For the admission-status API — one row per Application the student
   * has (optionally narrowed to one cycle and/or one college), each with
   * what's needed to compute its pending action (fee status, form status,
   * currentStep), the owning college's + cycle's own id/name (every
   * college runs its own independent admission cycles — this is what lets
   * results spanning colleges be told apart), and every non-withdrawn
   * course on it (not just the primary — an application can carry
   * several). Omitting both filters spans every cycle/college the student
   * has ever applied to. `collegeId` alone (no `admissionCycleId`) covers
   * a college that runs several concurrent cycles — narrower than "all
   * colleges", broader than "one specific cycle". */
  static async findStatusRows(
    studentId: string,
    filters?: { admissionCycleId?: string; collegeId?: string },
  ) {
    return prisma.application.findMany({
      where: {
        studentId,
        ...(filters?.admissionCycleId && {
          admissionCycleId: filters.admissionCycleId,
        }),
        ...(filters?.collegeId && { collegeId: filters.collegeId }),
      },
      select: {
        id: true,
        applicationNumber: true,
        formStatus: true,
        feePaymentStatus: true,
        currentStep: true,
        createdAt: true,
        college: { select: { id: true, name: true } },
        admissionCycle: {
          select: { id: true, name: true, assessmentRequired: true },
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
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Cross-module read into `interviews`' own table — that module has no
   * service layer yet (schema-only), so this duplicates a minimal direct
   * read here rather than inventing a fake service call, matching the
   * precedent in payments/repositories/application-payment.repository.ts. */
  static async findInterviewBookingsByCourseIds(
    applicationCourseIds: string[],
  ) {
    if (applicationCourseIds.length === 0) return [];
    return prisma.interviewBooking.findMany({
      where: { applicationCourseId: { in: applicationCourseIds } },
      include: { slot: { select: { scheduledDate: true } } },
    });
  }

  /** Same reasoning as findInterviewBookingsByCourseIds, for OfferLetter —
   * no service layer exists for that model yet either. */
  static async findOfferLettersByCourseIds(applicationCourseIds: string[]) {
    if (applicationCourseIds.length === 0) return [];
    return prisma.offerLetter.findMany({
      where: { applicationCourseId: { in: applicationCourseIds } },
    });
  }
}
