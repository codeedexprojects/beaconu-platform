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
}

export interface UpdateAdmissionCycleInput {
  application_type?: string;
  name?: string;
  admission_year?: string;
  program_level?: string;
  starts_on?: string;
  ends_on?: string;
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
  work_experience_required: boolean;
}

export interface UpdateAdmissionCycleCourseInput {
  application_fee?: number;
  interview_required?: boolean;
  assessment_required?: boolean;
  token_payment_stage?: TokenPaymentStage | null;
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

// A course's quota+seat config within one application form — either
// exclusive to that course (its own totalSeats/openSeats) or pooled, sharing
// seats with other courses via a SeatPool (isPooled: true, totalSeats/
// openSeats resolved from the pool).
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
