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

  static async findByStudentAndCycle(
    studentId: string,
    admissionCycleId: string,
  ) {
    return prisma.application.findUnique({
      where: { uq_student_cycle: { studentId, admissionCycleId } },
      select: APPLICATION_SELECT,
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
      select: { id: true, formStatus: true, currentStep: true },
    });
  }

  /** Full-replace write for one of the JSON detail blobs (personal, family,
   * address, qualification), plus the handful of top-level columns that
   * conceptually belong to "personal details" (profile photo, WhatsApp).
   * Advances currentStep to the furthest step reached so far — never
   * regresses it if the student revisits an earlier step. */
  static async updateDetailStep(
    id: string,
    jsonField:
      | "personalDetails"
      | "familyDetails"
      | "addressDetails"
      | "qualificationDetails"
      | "declaration",
    jsonValue: object,
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
        [jsonField]: jsonValue,
        currentStep: nextStep,
        ...topLevelFields,
      },
      select: APPLICATION_SELECT,
    });
  }

  static async findOwnDraftForSubmit(id: string, studentId: string) {
    return prisma.application.findFirst({
      where: { id, studentId },
      select: { id: true, formStatus: true, declaration: true },
    });
  }

  static async markSubmitted(tx: Prisma.TransactionClient, id: string) {
    return tx.application.update({
      where: { id },
      data: {
        formStatus: "submitted",
        submittedAt: new Date(),
        currentStep: 9,
      },
      select: { id: true },
    });
  }

  static async findAllForStudent(studentId: string) {
    return prisma.application.findMany({
      where: { studentId },
      select: APPLICATION_LIST_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }
}
