export interface StudentApplicationDto {
  id: string;
  applicationNumber: string;
  studentId: string;
  collegeId: string;
  campusId: string | null;
  admissionCycleId: string;
  currentStep: number;
  formStatus: string;
  profilePhotoUrl: string | null;
  whatsappCountryCode: string | null;
  whatsappNumber: string | null;
  nationality: string | null;
  stateOfDomicile: string | null;
  passportCountry: string | null;
  passportNumber: string | null;
  totalApplicationFee: string;
  feePaymentStatus: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The single next thing the student needs to do on a given Application.
 * "payment" — primary course's fee isn't paid yet. One of the four detail
 * steps or "declaration" — resume there. "submit" — every step is done,
 * call Submit Application. "none" — already submitted. Documents aren't
 * part of this sequence — check List Required/Uploaded Documents
 * separately. */
export type PendingApplicationAction =
  | "payment"
  | "personal_details"
  | "family_details"
  | "address_details"
  | "qualification_details"
  | "declaration"
  | "submit"
  | "none";

/** Mirrors AssessmentStatus's own AttemptStatus union (assessment module),
 * plus "not_required" for cycles that don't gate on an assessment at all. */
export type AssessmentStatusValue =
  | "not_required"
  | "not_started"
  | "in_progress"
  | "completed"
  | "auto_submitted"
  | "terminated"
  | "under_evaluation"
  | "evaluated"
  | "result_published";

/** One attempt covers the whole Application (every course on it), not a
 * single course — see AssessmentAttempt / Plan R. */
export interface ApplicationAssessmentStatus {
  status: AssessmentStatusValue;
  attemptId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalScore: number | null;
  maxScore: number | null;
}

export type InterviewStatusValue =
  | "not_scheduled"
  | "booked"
  | "completed"
  | "cancelled"
  | "rescheduled";

/** Application-level, not per-course — a student interviews once for the
 * whole application, resolved off its primary course's booking (the
 * course that drives the rest of the pipeline). `not_scheduled` (every
 * field null) simply means the student hasn't booked an Interview Slot
 * yet — the interviews module itself is fully built. */
export interface ApplicationInterviewStatus {
  status: InterviewStatusValue;
  scheduledAt: string | null;
  completedAt: string | null;
  outcome: string | null;
  score: string | null;
  remarks: string | null;
}

/** Application-level, resolved off the primary course's OfferLetter (token
 * amount is a whole-application concept, not per-course). `not_issued`
 * (every field null) until one is actually created — no API writes/reads
 * that model yet either. */
export interface ApplicationAmountDetails {
  status: "not_issued" | "issued" | "expired" | "withdrawn";
  offerNumber: string | null;
  tokenAmount: string | null;
  tokenPaymentStatus: string | null;
  validUntil: string | null;
  documentUrl: string | null;
}

/** One document requirement's status — mirrors Get Required Documents'
 * per-item shape, minus acceptedMimeTypes/rejectionReason (call that
 * endpoint directly for the upload form itself; this is just the
 * onboarding-overview summary). */
export interface ApplicationDocumentStatusItem {
  documentType: string;
  documentLabel: string;
  isRequired: boolean;
  uploaded: boolean;
  verificationStatus: string | null;
}

/** Application-level — the same applicable-document checklist Get
 * Required Documents computes, summarized into counts + a compact list so
 * the full onboarding overview doesn't need a second call. Not part of
 * `pendingAction`'s sequence (Submit Application doesn't require
 * documents, and currentStep doesn't track them) — this is the section
 * that actually surfaces "N of M uploaded" instead. */
export interface ApplicationDocumentsStatus {
  totalRequired: number;
  uploadedCount: number;
  missingCount: number;
  pendingVerificationCount: number;
  rejectedCount: number;
  items: ApplicationDocumentStatusItem[];
}

export interface ApplicationStatusCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  /** Raw ApplicationCourse.status pipeline value (see root CLAUDE.md's
   * Application status flow). */
  status: string;
  /** True once `status` has reached "shortlisted" or any later pipeline
   * stage (offer_issued, token_paid, enrolled). */
  isShortlisted: boolean;
}

/** The application-record part of the status response — form/payment
 * progress and every non-withdrawn course on it (primary + any extras),
 * not just one. */
export interface ApplicationStatusApplication {
  applicationId: string;
  applicationNumber: string;
  collegeId: string;
  collegeName: string;
  admissionCycleId: string;
  admissionCycleName: string;
  formStatus: string;
  feePaymentStatus: string;
  pendingAction: PendingApplicationAction;
  courses: ApplicationStatusCourse[];
  createdAt: string;
}

/** One entry per Application the student has for an admission cycle (can
 * be several, one per course) — the cycle-level admission status API
 * returns `null` instead of this array when the student hasn't started
 * any application yet. `assessment`/`interview`/`amountDetails` are all
 * whole-application concepts (never per-course), sitting alongside
 * `application` rather than nested inside it. */
export interface ApplicationStatusSummary {
  application: ApplicationStatusApplication;
  documents: ApplicationDocumentsStatus;
  assessment: ApplicationAssessmentStatus;
  interview: ApplicationInterviewStatus;
  amountDetails: ApplicationAmountDetails;
}

export interface ApplicationStatusSummaryCourseBasic {
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  status: string;
}

/** The original, flat status shape — kept as-is for the all-cycles
 * endpoint (`GET /application-forms/status`). Only the cycle-scoped
 * endpoint (`GET /:id/application/status`, see `ApplicationStatusSummary`
 * above) moved to the richer application/assessment/interview/
 * amountDetails shape. */
export interface ApplicationStatusSummaryBasic {
  applicationId: string;
  applicationNumber: string;
  collegeId: string;
  collegeName: string;
  admissionCycleId: string;
  admissionCycleName: string;
  courses: ApplicationStatusSummaryCourseBasic[];
  formStatus: string;
  feePaymentStatus: string;
  pendingAction: PendingApplicationAction;
  createdAt: string;
}

export interface StartApplicationInput {
  nationality: string;
  // The primary course — required, since payment (and everything after
  // it) is gated on this selection. Its quota is set afterward via
  // Change Application Course Quota, never at Start.
  course_id: string;
  campus_id?: string | null;
  state_of_domicile?: string | null;
  passport_country?: string | null;
  passport_number?: string | null;
}

export interface ApplicationCourseQuotaOption {
  courseQuotaSeatId: string;
  collegeQuotaId: string;
  quotaName: string;
  quotaSlug: string;
  bucketType: "in_state" | "out_of_state";
  applicationFee: string;
  tuitionFeeOverride: string | null;
  totalSeats: number | null;
  openSeats: number | null;
}

export interface ApplicationCourseDto {
  id: string;
  applicationId: string;
  courseId: string;
  applicationFee: string;
  status: string;
  courseQuotaSeatId: string | null;
  isPrimary: boolean;
  preferenceOrder: number;
  courseName: string;
  courseCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddApplicationCourseInput {
  course_id: string;
  course_quota_seat_id?: string | null;
  preference_order?: number;
}

export interface ChangeApplicationCourseQuotaInput {
  course_quota_seat_id?: string | null;
}

export interface CourseCatalogueItem {
  courseId: string;
  courseName: string;
  courseCode: string;
  applicationFee: string;
  quotaOptions: ApplicationCourseQuotaOption[];
}

export interface ApplicationPaymentSummaryCourse {
  applicationCourseId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  preferenceOrder: number;
  selectedQuota: {
    courseQuotaSeatId: string;
    quotaName: string | null;
    applicationFee: string;
  } | null;
  applicationFee: string;
  quotaOptions: ApplicationCourseQuotaOption[];
}

export interface ApplicationPaymentSummaryDto {
  courses: ApplicationPaymentSummaryCourse[];
  totalApplicationFee: string;
  feePaymentStatus: string;
  isLocked: boolean;
}

export interface PersonalDetailsInput {
  full_name: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  category?: string | null;
  blood_group?: string | null;
  religion?: string | null;
  mother_tongue?: string | null;
  marital_status?: string | null;
  aadhar_number?: string | null;
  profile_photo_url?: string | null;
  whatsapp_country_code?: string;
  whatsapp_number?: string | null;
}

export interface FamilyDetailsInput {
  father_name: string;
  father_occupation?: string | null;
  father_phone?: string | null;
  father_email?: string | null;
  mother_name: string;
  mother_occupation?: string | null;
  mother_phone?: string | null;
  mother_email?: string | null;
  guardian_name?: string | null;
  guardian_relation?: string | null;
  guardian_phone?: string | null;
  annual_family_income?: number | null;
  number_of_siblings?: number | null;
}

export interface AddressBlock {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  district?: string | null;
  pin_code: string;
  country: string;
}

export interface AddressDetailsInput {
  permanent: AddressBlock;
  same_as_permanent: boolean;
  current?: AddressBlock | null;
}

export interface QualificationEntry {
  level: string;
  board_or_university: string;
  institution_name: string;
  year_of_passing: number;
  percentage_or_cgpa: number;
  subjects?: string | null;
}

export interface QualificationDetailsInput {
  qualifications: QualificationEntry[];
}

/** Live read of one form-step section off the Student profile — used to
 * resume/pre-fill the wizard. Selected via `?section=` since each step is
 * its own page on the client; whatever was last saved via the matching
 * PATCH, or `{}` if that step hasn't been filled yet. Not the frozen
 * per-application snapshot (that's only set at submit and isn't exposed by
 * this endpoint). */
export type ApplicationFormDetailsSection =
  | "personal_details"
  | "family_details"
  | "address_details"
  | "qualification_details";

export interface ApplicationFormDetailsBySection {
  personal_details: Partial<PersonalDetailsInput>;
  family_details: Partial<FamilyDetailsInput>;
  address_details: Partial<AddressDetailsInput>;
  qualification_details: Partial<QualificationDetailsInput>;
}

export interface RequiredDocumentDto {
  documentType: string;
  documentCategory: string;
  documentLabel: string;
  isRequired: boolean;
  acceptedMimeTypes: string[];
  uploaded: {
    id: string;
    fileUrl: string;
    fileName: string | null;
    verificationStatus: string;
    rejectionReason: string | null;
  } | null;
}

export interface ApplicationDocumentDto {
  id: string;
  applicationId: string;
  documentType: string;
  documentCategory: string;
  fileUrl: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterApplicationDocumentInput {
  document_type: string;
  file_url: string;
  file_name?: string | null;
  file_size_bytes?: number | null;
  mime_type: string;
}

export interface DeclarationInput {
  accepted: boolean;
  full_name_confirmation: string;
}

export interface StudentApplicationListItemDto extends StudentApplicationDto {
  cycleName: string;
  cycleStatus: string;
  admissionYear: string;
  collegeName: string;
  collegeSlug: string;
  collegeLogoUrl: string | null;
}

export interface ApplicationPaymentDto {
  id: string;
  transactionNumber: string;
  amount: string;
  currency: string;
  status: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// College-admin applications list (read-only monitoring view)
// ---------------------------------------------------------------------------

export interface ApplicationListCourseItem {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  status: string;
}

export interface ApplicationListItem {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  admissionCycleId: string;
  admissionCycleName: string;
  formStatus: string;
  feePaymentStatus: string;
  totalApplicationFee: string;
  courses: ApplicationListCourseItem[];
  submittedAt: string | null;
  createdAt: string;
}

export interface ApplicationListQuery {
  admission_cycle_id?: string;
  form_status?: string;
  fee_payment_status?: string;
  course_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationDetailCourseItem {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  status: string;
  applicationFee: string;
  quotaName: string | null;
  rejectionReason: string | null;
  statusUpdatedAt: string | null;
}

export interface ApplicationDetailDocumentItem {
  id: string;
  documentType: string;
  documentCategory: string;
  fileUrl: string;
  fileName: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: string;
}

/** Full read-only detail view for college-admin. `personalDetails` /
 * `familyDetails` / `addressDetails` / `qualificationDetails` are merged:
 * the Application's own frozen snapshot (set once, at submit) if non-empty,
 * else the Student's live profile data (still being filled in, for a draft
 * application) — see ApplicationDetailQuery.getForCollegeAdmin. */
export interface ApplicationDetailDto {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  admissionCycleId: string;
  admissionCycleName: string;
  campusName: string | null;
  currentStep: number;
  formStatus: string;
  feePaymentStatus: string;
  totalApplicationFee: string;
  nationality: string | null;
  stateOfDomicile: string | null;
  passportCountry: string | null;
  passportNumber: string | null;
  profilePhotoUrl: string | null;
  whatsappCountryCode: string | null;
  whatsappNumber: string | null;
  personalDetails: Partial<PersonalDetailsInput>;
  familyDetails: Partial<FamilyDetailsInput>;
  addressDetails: Partial<AddressDetailsInput>;
  qualificationDetails: Partial<QualificationDetailsInput>;
  declaration: Partial<DeclarationInput>;
  courses: ApplicationDetailCourseItem[];
  documents: ApplicationDetailDocumentItem[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmPaymentInput {
  transaction_id: string;
  provider_payment_id: string;
  provider_signature?: string;
}
