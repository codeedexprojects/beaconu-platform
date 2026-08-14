import { prisma, Prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { ApplicationCourseService } from "./application-course.service";
import { ApplicationDocumentService } from "./application-document.service";
import { StudentsService } from "@/modules/students/services/students.service";
import { AttemptService } from "@/modules/assessments/services/attempt.service";
import type { StartApplicationInput } from "../validators/application.validator";
import type {
  PersonalDetailsInput,
  FamilyDetailsInput,
  AddressDetailsInput,
  QualificationDetailsInput,
} from "../validators/application-details.validator";
import type { DeclarationInput } from "../validators/application-declaration.validator";
import type {
  TenthGradeDetailsInput,
  TwelfthGradeDetailsInput,
  UndergraduateDetailsInput,
  PgDetailsInput,
  DiplomaDetailsInput,
} from "../validators/academic-records.validator";
import type { AchievementsDetailsInput } from "../validators/achievements-details.validator";
import type { EntranceExamDetailsInput } from "../validators/entrance-exam.validator";

const STEP_NUMBERS = {
  personal: 3,
  family: 4,
  address: 5,
  qualification: 6,
  achievements: 7,
  entranceExam: 8,
  declaration: 9,
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

function buildApplicationNumber(
  collegeCode: string,
  admissionYear: string,
  id: string,
) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  const yearDigits = admissionYear.replace(/[^0-9]/g, "").slice(0, 4);
  return `${collegeCode.slice(0, 12)}-${yearDigits}-${numericSuffix}`;
}

/** Cheap, currentStep-only resolution of the single next thing the student
 * needs to do on this application — see getStatus's doc comment for why
 * this can't distinguish "documents still pending" from "documents already
 * done, sitting on declaration". */
function resolvePendingAction(
  formStatus: string,
  feePaymentStatus: string,
  currentStep: number,
) {
  if (formStatus === "submitted") return "none" as const;
  if (feePaymentStatus !== "paid") return "payment" as const;
  if (currentStep < STEP_NUMBERS.personal) return "personal_details" as const;
  if (currentStep < STEP_NUMBERS.family) return "family_details" as const;
  if (currentStep < STEP_NUMBERS.address) return "address_details" as const;
  if (currentStep < STEP_NUMBERS.qualification)
    return "qualification_details" as const;
  // achievements (step 7) is optional/supplementary — not gated here.
  if (currentStep < STEP_NUMBERS.entranceExam)
    return "entrance_exam_details" as const;
  if (currentStep < STEP_NUMBERS.declaration) return "declaration" as const;
  return "submit" as const;
}

type StatusRow = Awaited<
  ReturnType<typeof ApplicationRepository.findStatusRows>
>[number];

function isEmptyJson(value: unknown): boolean {
  return (
    !value || (typeof value === "object" && Object.keys(value).length === 0)
  );
}

type FormStepStatus = "completed" | "current" | "pending";
interface FormStepEntry {
  key: string;
  label: string;
  status: FormStepStatus;
}

const FORM_STEP_LABELS: Record<string, string> = {
  payment: "Application Fee Payment",
  personal_details: "Personal Information",
  family_details: "Family/Guardian Details",
  address_details: "Address Details",
  tenth_grade: "Academic Records — 10th Grade Details",
  twelfth_grade: "Academic Records — 12th Grade Details",
  undergraduate: "Academic Records — Undergraduate Details",
  pg: "Academic Records — PG Details",
  diploma: "Academic Records — Diploma Details",
  achievements_details: "Achievements & Extracurricular Profile",
  entrance_exam_details: "Competitive Exam Records",
  documents: "Identity & Category Proofs (Documents)",
  declaration: "Declaration",
};

function step(key: string, status: FormStepStatus): FormStepEntry {
  return { key, label: FORM_STEP_LABELS[key]!, status };
}

/** Every screen in the 10-screen form (+ payment/documents), with a real
 * per-screen status — unlike pendingAction, which only ever names the
 * single next mandatory step. Sequential/mandatory screens (payment →
 * personal → family → address → qualification-gate → entrance exam →
 * declaration) derive status from currentStep, same thresholds as
 * resolvePendingAction. The 5 academic-record sub-screens don't share a
 * currentStep slot (any ONE of them satisfies the "qualification" gate),
 * so their status is read off actual saved data instead. Achievements is
 * optional and never blocks, so it's only ever "completed" or "pending",
 * never "current". */
async function buildFormSteps(
  studentId: string,
  row: StatusRow,
): Promise<FormStepEntry[]> {
  const submitted = row.formStatus === "submitted";
  const pendingAction = resolvePendingAction(
    row.formStatus,
    row.feePaymentStatus,
    row.currentStep,
  );

  const qualificationDetails = (
    isEmptyJson(row.qualificationDetails)
      ? row.student.qualificationDetails
      : row.qualificationDetails
  ) as Record<string, unknown>;
  const achievementsDetails = isEmptyJson(row.achievementsDetails)
    ? row.student.achievementsDetails
    : row.achievementsDetails;
  const declaration = (row.declaration ?? {}) as { accepted?: boolean };

  const documentsRequired = await ApplicationDocumentService.listRequired(
    row.id,
    studentId,
  );
  const documentsComplete = documentsRequired.every(
    (d) => !d.isRequired || d.uploaded !== null,
  );

  function sequentialStatus(
    gateKey: string,
    threshold: number,
  ): FormStepStatus {
    if (submitted || row.currentStep >= threshold) return "completed";
    return pendingAction === gateKey ? "current" : "pending";
  }

  return [
    row.feePaymentStatus === "paid"
      ? step("payment", "completed")
      : step("payment", "current"),
    step(
      "personal_details",
      sequentialStatus("personal_details", STEP_NUMBERS.personal),
    ),
    step(
      "family_details",
      sequentialStatus("family_details", STEP_NUMBERS.family),
    ),
    step(
      "address_details",
      sequentialStatus("address_details", STEP_NUMBERS.address),
    ),
    step(
      "tenth_grade",
      qualificationDetails?.tenth_grade ? "completed" : "pending",
    ),
    step(
      "twelfth_grade",
      qualificationDetails?.twelfth_grade ? "completed" : "pending",
    ),
    step(
      "undergraduate",
      qualificationDetails?.undergraduate ? "completed" : "pending",
    ),
    step("pg", qualificationDetails?.pg ? "completed" : "pending"),
    step("diploma", qualificationDetails?.diploma ? "completed" : "pending"),
    step(
      "achievements_details",
      !isEmptyJson(achievementsDetails) ? "completed" : "pending",
    ),
    step(
      "entrance_exam_details",
      sequentialStatus("entrance_exam_details", STEP_NUMBERS.entranceExam),
    ),
    step("documents", documentsComplete ? "completed" : "pending"),
    step(
      "declaration",
      submitted || declaration.accepted
        ? "completed"
        : pendingAction === "declaration"
          ? "current"
          : "pending",
    ),
  ];
}

const SHORTLISTED_OR_LATER = new Set([
  "shortlisted",
  "offer_issued",
  "token_paid",
  "enrolled",
]);

const TOKEN_PAID_OR_LATER = new Set(["token_paid", "enrolled"]);

async function resolveAssessmentStatus(studentId: string, row: StatusRow) {
  if (!row.admissionCycle.assessmentRequired) {
    return {
      status: "not_required" as const,
      attemptId: null,
      startedAt: null,
      completedAt: null,
      totalScore: null,
      maxScore: null,
    };
  }
  const attempt = await AttemptService.findStatusForApplication(
    studentId,
    row.id,
  );
  if (!attempt) {
    return {
      status: "not_started" as const,
      attemptId: null,
      startedAt: null,
      completedAt: null,
      totalScore: null,
      maxScore: null,
    };
  }
  return attempt;
}

const NOT_SCHEDULED_INTERVIEW = {
  status: "not_scheduled" as const,
  scheduledAt: null,
  completedAt: null,
  outcome: null,
  score: null,
  remarks: null,
};

const NOT_ISSUED_AMOUNT_DETAILS = {
  status: "not_issued" as const,
  applicationCourseId: null,
  offerNumber: null,
  tokenAmount: null,
  tokenPaymentStatus: null,
  validUntil: null,
  documentUrl: null,
};

/** Original flat shape, kept as-is for the all-cycles endpoint
 * (`getStatusAllCycles` / `GET /application-forms/status`) — only the
 * single-cycle endpoint (`getStatus` / `GET /:id/application/status`) was
 * asked to move to the richer application/assessment/interview/
 * amountDetails shape (`buildStatusSummary`, below). */
async function toBasicStatusSummary(studentId: string, row: StatusRow) {
  return {
    applicationId: row.id,
    applicationNumber: row.applicationNumber,
    collegeId: row.college.id,
    collegeName: row.college.name,
    admissionCycleId: row.admissionCycle.id,
    admissionCycleName: row.admissionCycle.name,
    courses: row.applicationCourses.map((ac) => ({
      courseId: ac.course.id,
      courseName: ac.course.name,
      courseCode: ac.course.code,
      isPrimary: ac.isPrimary,
      status: ac.status,
    })),
    formStatus: row.formStatus,
    feePaymentStatus: row.feePaymentStatus,
    pendingAction: resolvePendingAction(
      row.formStatus,
      row.feePaymentStatus,
      row.currentStep,
    ),
    formSteps: await buildFormSteps(studentId, row),
    createdAt: row.createdAt.toISOString(),
  };
}

async function buildStatusSummary(studentId: string, row: StatusRow) {
  const applicationCourseIds = row.applicationCourses.map((ac) => ac.id);

  const shortlistedCourses = row.applicationCourses.filter((ac) =>
    SHORTLISTED_OR_LATER.has(ac.status),
  );
  const tokenAmountCourse =
    shortlistedCourses.find((ac) => ac.isPrimary) ?? shortlistedCourses[0];

  const [
    assessment,
    booking,
    offerLetters,
    scholarshipApplications,
    tokenAmountRows,
    enrollments,
  ] = await Promise.all([
    resolveAssessmentStatus(studentId, row),
    ApplicationRepository.findInterviewBookingForApplication(row.id),
    ApplicationRepository.findOfferLettersByCourseIds(applicationCourseIds),
    ApplicationRepository.findScholarshipApplicationsForApplication(row.id),
    tokenAmountCourse
      ? ApplicationRepository.findTokenAmountsForCourses(
          row.admissionCycle.id,
          [tokenAmountCourse.course.id],
        )
      : Promise.resolve([]),
    ApplicationRepository.findEnrollmentsByCourseIds(applicationCourseIds),
  ]);

  const enrollmentStatus = enrollments[0]?.status ?? "not_enrolled";

  // Matched against the shortlisted course (not necessarily the primary
  // one) — amountDetails describes whichever course actually has an offer,
  // and only a shortlisted-or-later course can have one.
  const offer = tokenAmountCourse
    ? offerLetters.find((o) => o.applicationCourseId === tokenAmountCourse.id)
    : undefined;

  const configuredTokenAmount = tokenAmountRows[0]?.tokenAmount
    ? tokenAmountRows[0].tokenAmount.toString()
    : null;

  const interview = booking
    ? {
        status: booking.status as
          | "booked"
          | "completed"
          | "cancelled"
          | "rescheduled",
        scheduledAt: booking.slot.scheduledDate.toISOString(),
        completedAt: booking.completedAt
          ? booking.completedAt.toISOString()
          : null,
        outcome: booking.interviewOutcome,
        score: booking.interviewScore
          ? booking.interviewScore.toString()
          : null,
        remarks: booking.interviewRemarks,
      }
    : NOT_SCHEDULED_INTERVIEW;

  const amountDetails = offer
    ? {
        status: offer.status as "issued" | "expired" | "withdrawn",
        applicationCourseId: offer.applicationCourseId,
        offerNumber: offer.offerNumber,
        tokenAmount: offer.tokenAmount.toString(),
        tokenPaymentStatus: offer.tokenPaymentStatus,
        validUntil: offer.validUntil.toISOString(),
        // Only surface the offer letter document once the token has
        // actually been paid — before that, the student can see the
        // amount/status but not download the letter itself.
        documentUrl:
          offer.tokenPaymentStatus === "paid" ? offer.documentUrl : null,
      }
    : {
        ...NOT_ISSUED_AMOUNT_DETAILS,
        applicationCourseId: tokenAmountCourse?.id ?? null,
        tokenAmount: configuredTokenAmount,
        tokenPaymentStatus: tokenAmountCourse
          ? TOKEN_PAID_OR_LATER.has(tokenAmountCourse.status)
            ? "paid"
            : "pending"
          : null,
      };

  return {
    application: {
      applicationId: row.id,
      applicationNumber: row.applicationNumber,
      collegeId: row.college.id,
      collegeName: row.college.name,
      admissionCycleId: row.admissionCycle.id,
      admissionCycleName: row.admissionCycle.name,
      formStatus: row.formStatus,
      feePaymentStatus: row.feePaymentStatus,
      pendingAction: resolvePendingAction(
        row.formStatus,
        row.feePaymentStatus,
        row.currentStep,
      ),
      formSteps: await buildFormSteps(studentId, row),
      createdAt: row.createdAt.toISOString(),
    },
    assessment,
    interview,
    shortlist: {
      isShortlisted: row.applicationCourses.some((ac) =>
        SHORTLISTED_OR_LATER.has(ac.status),
      ),
      courses: row.applicationCourses
        .filter((ac) => SHORTLISTED_OR_LATER.has(ac.status))
        .map((ac) => ({
          courseId: ac.course.id,
          courseName: ac.course.name,
          courseCode: ac.course.code,
          status: ac.status,
        })),
    },
    scholarships: scholarshipApplications.map((s) => ({
      scholarshipApplicationId: s.id,
      scholarshipConfigId: s.scholarshipConfigId,
      scholarshipName: s.scholarshipConfig.name,
      status: s.status as "pending" | "approved" | "rejected",
    })),
    amountDetails,
    enrollmentStatus,
  };
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

    // startsOn/endsOn are @db.Date (date-only, no time component) — compare
    // against the whole day, not an exact instant: a cycle isn't open for
    // applications until its start date, and stays open through the whole
    // of its end date (inclusive), not just up to midnight at its start.
    const now = new Date();
    if (now < cycle.startsOn) {
      throw new ConflictError(
        "This application form is not open yet — check back on its start date",
      );
    }
    if (cycle.endsOn) {
      const endOfDeadlineDay = new Date(cycle.endsOn);
      endOfDeadlineDay.setUTCHours(23, 59, 59, 999);
      if (now > endOfDeadlineDay) {
        throw new ConflictError(
          "The deadline for this application form has passed",
        );
      }
    }

    // Cross-application guard (Plan N, broadened in Plan R to the whole
    // college): a student can have several Applications at this college
    // now, one per course — but never two active ones for the SAME course,
    // regardless of which cycle each is under.
    const activeSelection =
      await ApplicationRepository.findActiveCourseSelectionInCollege(
        studentId,
        cycle.collegeId,
        body.course_id,
      );
    if (activeSelection) {
      throw new ConflictError(
        "You already have an active application for this course at this college",
      );
    }

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

  /** Live read off the Student profile, to resume/pre-fill the wizard —
   * not the frozen per-application snapshot (that's submit()-only). Works
   * regardless of formStatus — even a submitted application's owner can
   * still see their current profile data (e.g. before starting a second
   * application). Returns only the one section asked for, since each
   * detail step is its own page on the client. */
  static async getFormDetails(
    applicationId: string,
    studentId: string,
    section:
      | "personal_details"
      | "family_details"
      | "address_details"
      | "qualification_details"
      | "achievements_details",
  ) {
    const application = await ApplicationRepository.findByIdForStudent(
      applicationId,
      studentId,
    );
    if (!application) throw new NotFoundError("Application not found");

    const details = await StudentsService.getDetailsForSnapshot(studentId);
    const bySection = {
      personal_details: details.personalDetails,
      family_details: details.familyDetails,
      address_details: details.addressDetails,
      qualification_details: details.qualificationDetails,
      achievements_details: details.achievementsDetails,
    };
    return bySection[section];
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

  /** These four write to the Student profile (reusable across every
   * application), not to this Application row — Application.assertOwnDraft
   * still gates on this specific application being editable, but the
   * payload itself lands on Student, keyed by studentId. See Plan M. */
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

    await StudentsService.updatePersonalDetails(studentId, {
      ...rest,
      date_of_birth: date_of_birth.toISOString(),
    });

    const row = await ApplicationRepository.advanceStep(
      applicationId,
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
    await StudentsService.updateFamilyDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
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
    await StudentsService.updateAddressDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
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
    await StudentsService.updateQualificationDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  /** The three academic-record screens (10th/12th/undergraduate) are
   * independent sub-forms of the same overall "qualification details"
   * step — each merges its own section into Student.qualificationDetails
   * (see StudentsService.mergeQualificationSection) without needing its
   * own resume-step number; all three share STEP_NUMBERS.qualification. */
  static async updateTenthGradeDetails(
    applicationId: string,
    studentId: string,
    body: TenthGradeDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    await StudentsService.updateTenthGradeDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  static async updateTwelfthGradeDetails(
    applicationId: string,
    studentId: string,
    body: TwelfthGradeDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    await StudentsService.updateTwelfthGradeDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  static async updateUndergraduateDetails(
    applicationId: string,
    studentId: string,
    body: UndergraduateDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    await StudentsService.updateUndergraduateDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  /** PG and Diploma are structurally identical to Undergraduate — same
   * merge-into-qualificationDetails pattern, same step number. */
  static async updatePgDetails(
    applicationId: string,
    studentId: string,
    body: PgDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    await StudentsService.updatePgDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  static async updateDiplomaDetails(
    applicationId: string,
    studentId: string,
    body: DiplomaDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    await StudentsService.updateDiplomaDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.qualification,
    );
    return toDto(row);
  }

  /** Internships/work-experience/awards/publications/patents/certs/
   * portfolio-links/recommendations/innovation/volunteering — one big
   * optional "extracurricular profile" screen. Every field is optional,
   * so this never blocks resolvePendingAction/submit the way the
   * mandatory detail steps do. */
  static async updateAchievementsDetails(
    applicationId: string,
    studentId: string,
    body: AchievementsDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    await StudentsService.updateAchievementsDetails(studentId, body);
    const row = await ApplicationRepository.advanceStep(
      applicationId,
      STEP_NUMBERS.achievements,
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
      {
        ...body,
        date: body.date.toISOString(),
        accepted_at: new Date().toISOString(),
      },
      STEP_NUMBERS.declaration,
    );
    return toDto(row);
  }

  static async updateEntranceExamDetails(
    applicationId: string,
    studentId: string,
    body: EntranceExamDetailsInput,
  ) {
    await ApplicationService.assertOwnDraft(applicationId, studentId);
    const row = await ApplicationRepository.updateDetailStep(
      applicationId,
      "entranceExamDetails",
      body,
      STEP_NUMBERS.entranceExam,
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

    // Freeze whatever's currently on the Student profile onto this
    // Application row — the one-time snapshot (Plan M). Read outside the
    // transaction since it's just a source read, not part of the atomic
    // write set.
    const detailsSnapshot =
      await StudentsService.getDetailsForSnapshot(studentId);

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

      await ApplicationRepository.markSubmitted(tx, applicationId, {
        personalDetails:
          detailsSnapshot.personalDetails as Prisma.InputJsonValue,
        familyDetails: detailsSnapshot.familyDetails as Prisma.InputJsonValue,
        addressDetails: detailsSnapshot.addressDetails as Prisma.InputJsonValue,
        qualificationDetails:
          detailsSnapshot.qualificationDetails as Prisma.InputJsonValue,
        achievementsDetails:
          detailsSnapshot.achievementsDetails as Prisma.InputJsonValue,
      });
    });

    const row = await ApplicationRepository.findByIdForStudent(
      applicationId,
      studentId,
    );
    return toDto(row!);
  }

  /** Cycle-level admission status — null if the student hasn't started any
   * application here yet, otherwise one entry per Application (a student
   * can have several under one cycle now, Plan N — one per course). Each
   * entry's pendingAction is derived cheaply off currentStep (never re-
   * derived from checking which fields are actually filled), so a step
   * revisited out of order after currentStep has already advanced past it
   * won't be reflected here — same limitation the PATCH endpoints already
   * have with "never regress currentStep". Documents aren't part of this
   * resume sequence: currentStep doesn't track them (see
   * ApplicationRepository.advanceStep's doc comment) and Submit doesn't
   * require them either, so they're left for the client to check
   * separately via List Required/Uploaded Documents. */
  static async getStatus(
    studentId: string,
    admissionCycleId: string,
    applicationId?: string,
  ) {
    const cycle =
      await ApplicationRepository.findCycleForApply(admissionCycleId);
    if (!cycle) throw new NotFoundError("Application form not found");

    const rows = await ApplicationRepository.findStatusRows(studentId, {
      admissionCycleId,
      applicationId,
    });
    if (rows.length === 0) return null;
    return Promise.all(rows.map((row) => buildStatusSummary(studentId, row)));
  }

  /** Same as getStatus but with no specific cycle id — optionally narrowed
   * to one college (covers a college running several concurrent cycles),
   * or fully unscoped to span every college the student has ever applied
   * to (a general "my applications" status screen). */
  static async getStatusAllCycles(studentId: string, collegeId?: string) {
    const rows = await ApplicationRepository.findStatusRows(studentId, {
      collegeId,
    });
    if (rows.length === 0) return null;
    return Promise.all(rows.map((row) => toBasicStatusSummary(studentId, row)));
  }

  static async listMine(studentId: string, admissionCycleId?: string) {
    const rows = await ApplicationRepository.findAllForStudent(
      studentId,
      admissionCycleId,
    );
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

  static async hasApplicationAtCollege(studentId: string, collegeId: string) {
    return ApplicationRepository.existsForStudentAtCollege(
      studentId,
      collegeId,
    );
  }

  static async getById(applicationId: string, studentId: string) {
    const row = await ApplicationRepository.findByIdForStudent(
      applicationId,
      studentId,
    );
    if (!row) throw new NotFoundError("Application");
    return toDto(row);
  }

  /** Cross-module read for other modules (e.g. scholarships) that need to
   * verify ownership + inspect every non-withdrawn course's status on an
   * Application, without duplicating a raw Prisma query for a table this
   * module already owns. */
  static async getForStudentWithCourseStatuses(
    applicationId: string,
    studentId: string,
  ) {
    const row = await ApplicationRepository.findByIdWithCoursesForStudent(
      applicationId,
      studentId,
    );
    if (!row) throw new NotFoundError("Application not found");
    return {
      id: row.id,
      collegeId: row.collegeId,
      applicationNumber: row.applicationNumber,
      formStatus: row.formStatus,
      assessmentRequired: row.admissionCycle.assessmentRequired,
      courses: row.applicationCourses.map((ac) => ({
        applicationCourseId: ac.id,
        status: ac.status,
        courseName: ac.course.name,
      })),
    };
  }

  /** College-scoped counterpart to getForStudentWithCourseStatuses, for
   * staff-driven flows (e.g. InterviewBookingService.completeInterview)
   * that have no student identity to check ownership against — scoped by
   * collegeId instead. */
  static async getForCollegeWithCourseStatuses(
    applicationId: string,
    collegeId: string,
  ) {
    const row = await ApplicationRepository.findByIdWithCoursesForCollege(
      applicationId,
      collegeId,
    );
    if (!row) throw new NotFoundError("Application not found");
    return {
      id: row.id,
      collegeId: row.collegeId,
      applicationNumber: row.applicationNumber,
      formStatus: row.formStatus,
      assessmentRequired: row.admissionCycle.assessmentRequired,
      courses: row.applicationCourses.map((ac) => ({
        applicationCourseId: ac.id,
        status: ac.status,
        courseName: ac.course.name,
      })),
    };
  }
}
