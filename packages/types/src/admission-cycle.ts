export type AdmissionCycleStatus = "open" | "closed" | "archived";

export interface AdmissionCycleItem {
  id: string;
  collegeId: string;
  applicationType: string;
  name: string;
  slug: string;
  admissionYear: string;
  programLevel: string;
  startsOn: string;
  endsOn: string | null;
  status: AdmissionCycleStatus;
  assessmentRequired: boolean;
  assessmentTemplateId: string | null;
  tokenOnlinePaymentEnabled: boolean;
  tokenOfflinePaymentEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionCycleInput {
  application_type: string;
  name: string;
  admission_year: string;
  program_level: string;
  starts_on: string;
  ends_on?: string;
  assessment_required?: boolean;
  assessment_template_id?: string | null;
  token_online_payment_enabled?: boolean;
  token_offline_payment_enabled?: boolean;
}

export interface UpdateAdmissionCycleInput {
  application_type?: string;
  name?: string;
  admission_year?: string;
  program_level?: string;
  starts_on?: string;
  ends_on?: string;
  assessment_required?: boolean;
  assessment_template_id?: string | null;
  token_online_payment_enabled?: boolean;
  token_offline_payment_enabled?: boolean;
}

export type TokenPaymentStage = "before_assessment" | "after_shortlisting";

export interface AdmissionCycleCourseItem {
  id: string;
  admissionCycleId: string;
  courseId: string;
  applicationFee: string;
  interviewRequired: boolean;
  assessmentRequired: boolean;
  tokenPaymentStage: TokenPaymentStage | null;
  tokenAmount: string | null;
  workExperienceRequired: boolean;
  isActive: boolean;
  createdAt: string;
  courseName: string;
  courseCode: string;
}

export interface AttachAdmissionCycleCourseInput {
  course_id: string;
  application_fee: number;
  interview_required: boolean;
  assessment_required: boolean;
  token_payment_stage?: TokenPaymentStage | null;
  token_amount?: number | null;
  work_experience_required: boolean;
}

export interface UpdateAdmissionCycleCourseInput {
  application_fee?: number;
  interview_required?: boolean;
  assessment_required?: boolean;
  token_payment_stage?: TokenPaymentStage | null;
  token_amount?: number | null;
  work_experience_required?: boolean;
  is_active?: boolean;
}

export type QuotaBucketType = "in_state" | "out_of_state";

export interface SeatPoolCourseRef {
  id: string;
  name: string;
  code: string;
}

export interface SeatPoolItem {
  id: string;
  collegeQuotaId: string;
  admissionCycleId: string;
  totalSeats: number;
  openSeats: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quotaName: string;
  quotaSlug: string;
  bucketType: QuotaBucketType;
  courses: SeatPoolCourseRef[];
}

export interface CreateSeatPoolInput {
  college_quota_id: string;
  total_seats: number;
  course_ids: string[];
}

export interface UpdateSeatPoolInput {
  total_seats?: number;
  course_ids?: string[];
  is_active?: boolean;
}

export interface CourseQuotaSeatsItem {
  id: string;
  admissionCycleCourseId: string;
  collegeQuotaId: string;
  seatPoolId: string | null;
  totalSeats: number | null;
  openSeats: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quotaName: string;
  quotaSlug: string;
  bucketType: QuotaBucketType;
  isPooled: boolean;
}

export interface AttachCourseQuotaInput {
  college_quota_id: string;
  total_seats: number;
}

export interface UpdateCourseQuotaSeatsInput {
  total_seats?: number;
  is_active?: boolean;
}

export interface DocumentRequirementCourseRef {
  id: string;
  name: string;
  code: string;
}

export interface DocumentRequirementQuotaRef {
  id: string;
  name: string;
  slug: string;
  bucketType: QuotaBucketType;
}

export type DocumentMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/svg+xml"
  | "application/pdf";

export interface DocumentRequirementItem {
  id: string;
  collegeId: string;
  admissionCycleId: string;
  documentType: string;
  documentCategory: string;
  documentLabel: string;
  isRequired: boolean;
  appliesToNationalities: string[] | null;
  acceptedMimeTypes: DocumentMimeType[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courses: DocumentRequirementCourseRef[];
  quotas: DocumentRequirementQuotaRef[];
}

export interface CreateDocumentRequirementInput {
  document_category: string;
  document_label: string;
  is_required: boolean;
  applies_to_nationalities?: string[];
  accepted_mime_types?: DocumentMimeType[];
  sort_order?: number;
  course_ids?: string[];
  quota_ids?: string[];
}

export interface UpdateDocumentRequirementInput {
  document_category?: string;
  document_label?: string;
  is_required?: boolean;
  applies_to_nationalities?: string[] | null;
  accepted_mime_types?: DocumentMimeType[] | null;
  sort_order?: number;
  is_active?: boolean;
  course_ids?: string[];
  quota_ids?: string[];
}
