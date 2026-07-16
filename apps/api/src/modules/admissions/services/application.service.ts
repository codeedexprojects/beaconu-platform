import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
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
    const finalized = await ApplicationRepository.setApplicationNumber(
      created.id,
      applicationNumber,
    );

    return toDto(finalized);
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

  static async submit(applicationId: string, studentId: string) {
    const application = await ApplicationRepository.findOwnDraftForSubmit(
      applicationId,
      studentId,
    );
    if (!application) throw new NotFoundError("Application");
    if (application.formStatus !== "draft") {
      throw new ConflictError("This application has already been submitted");
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
        if (course.courseQuotaSeatId) {
          const seatLink = await ApplicationCourseRepository.findSeatPoolLink(
            tx,
            course.courseQuotaSeatId,
          );
          const decremented = seatLink?.seatPoolId
            ? await ApplicationCourseRepository.decrementPoolSeat(
                tx,
                seatLink.seatPoolId,
              )
            : await ApplicationCourseRepository.decrementExclusiveSeat(
                tx,
                course.courseQuotaSeatId,
              );
          if (decremented.count === 0) {
            throw new ConflictError(
              "A selected quota no longer has seats available. Please review your course selections.",
            );
          }
        }

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

  static async getById(applicationId: string, studentId: string) {
    const row = await ApplicationRepository.findByIdForStudent(
      applicationId,
      studentId,
    );
    if (!row) throw new NotFoundError("Application");
    return toDto(row);
  }
}
