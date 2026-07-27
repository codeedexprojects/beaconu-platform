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

export interface ApplicationStatusCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  status: string;
}

/** One entry per Application the student has for an admission cycle (can
 * be several, one per course) — the cycle-level admission status API
 * returns `null` instead of this array when the student hasn't started
 * any application yet. `courses` lists every non-withdrawn course on that
 * application (primary + any extras), not just one. */
export interface ApplicationStatusSummary {
  applicationId: string;
  applicationNumber: string;
  collegeId: string;
  collegeName: string;
  admissionCycleId: string;
  admissionCycleName: string;
  courses: ApplicationStatusCourse[];
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

export interface ConfirmPaymentInput {
  transaction_id: string;
  provider_payment_id: string;
  provider_signature?: string;
}
