import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { ApplicationCourseService } from "./application-course.service";
import type { StartApplicationInput } from "../validators/application.validator";
import type {
  PersonalDetailsInput,
  FamilyDetailsInput,
  AddressDetailsInput,
  QualificationDetailsInput,
} from "../validators/application-details.validator";
import type { DeclarationInput } from "../validators/application-declaration.validator";

const STEP_NUMBERS = {
  personal: 3,
  family: 4,
  address: 5,
  qualification: 6,
  declaration: 8,
} as const;

type ApplicationRow = NonNullable<
  Awaited<ReturnType<typeof ApplicationRepository.findByIdForStudent>>
>;

function toDto(row: ApplicationRow) {
  return {
    ...row,
    totalApplicationFee: row.totalApplicationFee.toString(),
    submittedAt: row.submittedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Derives a human-readable application number from the row's own
 * atomically-generated `id` (format "APP-<n>"), so it's guaranteed unique
 * without a separate counter or race condition. Must fit
 * applications.application_number's @db.VarChar(30) — college.code can be up
 * to 20 chars, so every segment is capped. */
function buildApplicationNumber(
  collegeCode: string,
  admissionYear: string,
  id: string,
) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  const yearDigits = admissionYear.replace(/[^0-9]/g, "").slice(0, 4);
  return `${collegeCode.slice(0, 12)}-${yearDigits}-${numericSuffix}`;
}

export class ApplicationService {
  static async start(
    studentId: string,
    admissionCycleId: string,
    body: StartApplicationInput,
  ) {
    const cycle =
      await ApplicationRepository.findCycleForApply(admissionCycleId);
    if (!cycle) throw new NotFoundError("Application form not found");
    if (cycle.status !== "open") {
      throw new ConflictError("This application form is not currently open");
    }

    const existing = await ApplicationRepository.findByStudentAndCycle(
      studentId,
      admissionCycleId,
    );
    if (existing) return toDto(existing);

    if (body.campus_id) {
      const campus = await ApplicationRepository.findCampusInCollege(
        body.campus_id,
        cycle.collegeId,
      );
      if (!campus) throw new NotFoundError("Campus not found");
    }

    const created = await ApplicationRepository.create({
      studentId,
      collegeId: cycle.collegeId,
      campusId: body.campus_id ?? null,
      admissionCycleId,
      nationality: body.nationality,
      stateOfDomicile: body.state_of_domicile ?? null,
      passportCountry: body.passport_country ?? null,
      passportNumber: body.passport_number ?? null,
    });

    const applicationNumber = buildApplicationNumber(
      cycle.college.code,
      cycle.admissionYear,
      created.id,
    );
    await ApplicationRepository.setApplicationNumber(
      created.id,
      applicationNumber,
    );

    // The primary course — its fee is what gates payment, and payment is
    // what gates the rest of the flow. Created via the same course-selection
    // logic as any other course, marked isPrimary so it can never be
    // withdrawn and so the payments module knows which selection to
    // charge. Quota-less at creation — set afterward via Change
    // Application Course Quota, same as every other course.
    try {
      await ApplicationCourseService.addCourse(
        created.id,
        studentId,
        {
          course_id: body.course_id,
          course_quota_seat_id: null,
          preference_order: 1,
        },
        { isPrimary: true },
      );
    } catch (error) {
      // Compensating rollback — see hardDeleteFailedDraft's doc comment.
      // Without this, a bad course id or a lost seat-availability race
      // would leave a permanently broken, course-less draft behind.
      await ApplicationRepository.hardDeleteFailedDraft(created.id);
      throw error;
    }

    const row = await ApplicationRepository.findByIdForStudent(
      created.id,
      studentId,
    );
    return toDto(row!);
  }

  static async getMine(studentId: string, admissionCycleId: string) {
    const row = await ApplicationRepository.findByStudentAndCycle(
      studentId,
      admissionCycleId,
    );
    if (!row) throw new NotFoundError("Application not found");
    return toDto(row);
  }

  private static async assertOwnDraft(
    applicationId: string,
    studentId: string,
  ) {
    const application = await ApplicationRepository.findOwnDraft(
      applicationId,
      studentId,
    );
    if (!application) throw new NotFoundError("Application not found");
    if (application.formStatus !== "draft") {
      throw new ConflictError(
        "This application has already been submitted and can no longer be edited",
      );
    }
    if (application.feePaymentStatus !== "paid") {
      throw new ConflictError(
        "Complete payment for your primary course before continuing",
      );
    }
  }

  static async updatePersonalDetails(
    applicationId: string,
    studentId: string,
    body: PersonalDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);

    const {
      profile_photo_url,
      whatsapp_country_code,
      whatsapp_number,
      date_of_birth,
      ...rest
    } = body;

    const row = await ApplicationRepository.updateDetailStep(
      applicationId,
      "personalDetails",
      { ...rest, date_of_birth: date_of_birth.toISOString() },
      STEP_NUMBERS.personal,
      {
        ...(profile_photo_url !== undefined && {
          profilePhotoUrl: profile_photo_url,
        }),
        ...(whatsapp_country_code !== undefined && {
          whatsappCountryCode: whatsapp_country_code,
        }),
        ...(whatsapp_number !== undefined && {
          whatsappNumber: whatsapp_number,
        }),
      },
    );
    return toDto(row);
  }

  static async updateFamilyDetails(
    applicationId: string,
    studentId: string,
    body: FamilyDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    const row = await ApplicationRepository.updateDetailStep(
      applicationId,
      "familyDetails",
      body,
      STEP_NUMBERS.family,
    );
    return toDto(row);
  }

  static async updateAddressDetails(
    applicationId: string,
    studentId: string,
    body: AddressDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    const row = await ApplicationRepository.updateDetailStep(
      applicationId,
      "addressDetails",
      body,
      STEP_NUMBERS.address,
    );
    return toDto(row);
  }

  static async updateQualificationDetails(
    applicationId: string,
    studentId: string,
    body: QualificationDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    const row = await ApplicationRepository.updateDetailStep(
      applicationId,
      "qualificationDetails",
      body,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  static async updateDeclaration(
    applicationId: string,
    studentId: string,
    body: DeclarationInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    const row = await ApplicationRepository.updateDetailStep(
      applicationId,
      "declaration",
      { ...body, accepted_at: new Date().toISOString() },
      STEP_NUMBERS.declaration,
    );
    return toDto(row);
  }

  /** No seat decrement happens here. Until a college admin reviews and
   * approves the application, this is only ever a request — like an
   * allotment in real college admissions, a seat is never actually
   * consumed just by applying for it. Seat decrement belongs to a future
   * admin-approval action (not yet built); the atomic decrement helpers
   * already exist on ApplicationCourseRepository (decrementExclusiveSeat,
   * decrementPoolSeat, findSeatPoolLink) for that to call directly. */
  static async submit(applicationId: string, studentId: string) {
    const application = await ApplicationRepository.findOwnDraftForSubmit(
      applicationId,
      studentId,
    );
    if (!application) throw new NotFoundError("Application");
    if (application.formStatus !== "draft") {
      throw new ConflictError("This application has already been submitted");
    }
    if (application.feePaymentStatus !== "paid") {
      throw new ConflictError(
        "Complete payment for your primary course before submitting",
      );
    }

    const declaration = application.declaration as {
      accepted?: boolean;
    } | null;
    if (!declaration?.accepted) {
      throw new ConflictError(
        "Please complete and accept the declaration before submitting",
      );
    }

    const courses =
      await ApplicationCourseRepository.findActiveForSubmit(applicationId);
    if (courses.length === 0) {
      throw new ConflictError("Add at least one course before submitting");
    }

    await prisma.$transaction(async (tx) => {
      for (const course of courses) {
        await ApplicationCourseRepository.markSubmitted(tx, course.id);
        await ApplicationCourseRepository.createStatusLog(tx, {
          applicationCourseId: course.id,
          fromStatus: "draft",
          toStatus: "submitted",
          changedByType: "student",
          changedById: studentId,
        });
      }

      await ApplicationRepository.markSubmitted(tx, applicationId);
    });

    const row = await ApplicationRepository.findByIdForStudent(
      applicationId,
      studentId,
    );
    return toDto(row!);
  }

  static async listMine(studentId: string) {
    const rows = await ApplicationRepository.findAllForStudent(studentId);
    return rows.map((row) => {
      const { admissionCycle, college, ...rest } = row;
      return {
        ...rest,
        totalApplicationFee: rest.totalApplicationFee.toString(),
        submittedAt: rest.submittedAt?.toISOString() ?? null,
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString(),
        cycleName: admissionCycle.name,
        cycleStatus: admissionCycle.status,
        admissionYear: admissionCycle.admissionYear,
        collegeName: college.name,
        collegeSlug: college.slug,
        collegeLogoUrl: college.logoUrl,
      };
    });
  }

  /** Called by the payments module after it confirms the primary course's
   * fee was paid — cross-module write kept inside admissions' own
   * repository per the "repos serve their own service only" rule; the
   * payments module never touches the applications table directly. */
  static async markFeePaid(applicationId: string) {
    await ApplicationRepository.markFeePaid(applicationId);
  }

  static async getById(applicationId: string, studentId: string) {
    const row = await ApplicationRepository.findByIdForStudent(
      applicationId,
      studentId,
    );
    if (!row) throw new NotFoundError("Application");
    return toDto(row);
  }
}
