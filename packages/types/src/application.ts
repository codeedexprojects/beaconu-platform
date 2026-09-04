import type { PaginationMeta } from "./api";

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

export type PendingApplicationAction =
  | "payment"
  | "personal_details"
  | "family_details"
  | "address_details"
  | "qualification_details"
  | "entrance_exam_details"
  | "declaration"
  | "submit"
  | "none";

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

export interface ApplicationAssessmentStatus {
  status: AssessmentStatusValue;
  attemptId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalScore: number | null;
  maxScore: number | null;
}

export type InterviewStatusValue =
  | "not_required"
  | "not_scheduled"
  | "scheduled"
  | "completed"
  | "cancelled";

export interface ApplicationInterviewStatus {
  status: InterviewStatusValue;
  scheduledAt: string | null;
  completedAt: string | null;
  outcome: string | null;
  score: string | null;
  remarks: string | null;
}

export interface TokenPaymentMethodsAvailable {
  online: boolean;
  offline: boolean;
}

export interface ApplicationAmountDetails {
  status: "not_issued" | "issued" | "expired" | "withdrawn";
  applicationCourseId: string | null;
  offerNumber: string | null;
  tokenAmount: string | null;
  tokenPaymentStatus: string | null;
  validUntil: string | null;
  documentUrl: string | null;
  paymentMethods: TokenPaymentMethodsAvailable;
}

export type FormStepKey =
  | "payment"
  | "personal_details"
  | "family_details"
  | "address_details"
  | "tenth_grade"
  | "twelfth_grade"
  | "undergraduate"
  | "pg"
  | "diploma"
  | "achievements_details"
  | "entrance_exam_details"
  | "documents"
  | "declaration";

export type FormStepStatus = "completed" | "current" | "pending";

export interface FormStepEntry {
  key: FormStepKey;
  label: string;
  status: FormStepStatus;
}

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
  formSteps: FormStepEntry[];
  createdAt: string;
}

export interface ApplicationShortlistCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  status: string;
}

export interface ApplicationShortlistStatus {
  isShortlisted: boolean;
  courses: ApplicationShortlistCourse[];
}

export interface ApplicationStatusScholarship {
  scholarshipApplicationId: string;
  scholarshipConfigId: string;
  scholarshipName: string;
  status: "pending" | "approved" | "rejected";
}

export interface ApplicationStatusSummary {
  application: ApplicationStatusApplication;
  assessment: ApplicationAssessmentStatus;
  interview: ApplicationInterviewStatus;
  shortlist: ApplicationShortlistStatus;
  scholarships: ApplicationStatusScholarship[];
  amountDetails: ApplicationAmountDetails;
  // "not_enrolled" if no course on this application has reached Enrollment
  // yet, else the Enrollment row's own status (active|on_leave|suspended|
  // completed|withdrawn|course_switched).
  enrollmentStatus: string;
}

export interface ApplicationStatusSummaryCourseBasic {
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  status: string;
}

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
  formSteps: FormStepEntry[];
  createdAt: string;
}

export interface StartApplicationInput {
  nationality: string;
  course_id: string;
  campus_id?: string | null;
  state_of_domicile?: string | null;
  passport_country?: string | null;
  passport_number?: string | null;
  referral_code?: string | null;
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
  email?: string | null;
  mobile_country_code?: string;
  mobile_number?: string | null;
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
  country?: string;
}

export interface AddressDetailsInput {
  correspondence: AddressBlock;
  same_as_correspondence: boolean;
  permanent?: AddressBlock | null;
}

export interface QualificationEntry {
  level: string;
  board_or_university: string;
  institution_name: string;
  year_of_passing: number;
  percentage_or_cgpa: number;
  subjects?: string | null;
}

// Legacy flat shape — superseded by the level-specific tenth/twelfth/
// undergraduate screens below, kept only so old draft data still types.
export interface QualificationDetailsInput {
  qualifications: QualificationEntry[];
}

export interface SubjectMarksEntry {
  subject_name: string;
  evaluation_pattern: string;
  theory_marks?: number | null;
  practical_marks?: number | null;
  internal_marks?: number | null;
  max_marks: number;
  obtained_marks: number;
  attempts?: number | null;
  percentage?: number | null;
}

export type MarkingScheme = "percentage" | "gpa" | "other";

export interface ResultSummary {
  marking_scheme: MarkingScheme;
  marks_obtained?: number | null;
  max_marks?: number | null;
  percentage?: number | null;
  remarks?: string | null;
}

export interface TenthGradeDetailsInput {
  academic_year: string;
  admission_year: string;
  year_of_passing: number;
  board_name: string;
  registration_number?: string | null;
  school_name: string;
  school_code?: string | null;
  school_address?: string | null;
  school_state: string;
  medium_of_instruction: string;
  subjects: SubjectMarksEntry[];
  result_summary: ResultSummary;
  marksheet_url?: string | null;
}

export interface TwelfthGradeDetailsInput {
  academic_year: string;
  admission_year: string;
  year_of_passing: number;
  board_name: string;
  course?: string | null;
  registration_number?: string | null;
  school_name: string;
  school_code?: string | null;
  school_address?: string | null;
  school_state: string;
  medium_of_instruction: string;
  has_separate_class_xi_exam: boolean;
  class_xi_status?: "declared" | "undeclared" | null;
  subjects: SubjectMarksEntry[];
  result_summary: ResultSummary;
  marksheet_url?: string | null;
  migration_certificate_url?: string | null;
}

export interface SemesterRecord {
  label: string;
  duration?: string | null;
  gpa?: number | null;
  cgpa_or_percentage?: number | null;
  backlogs?: number | null;
}

export interface ProjectEntry {
  title: string;
  project_type: string;
  duration?: string | null;
  team_size?: number | null;
  role?: string | null;
  description?: string | null;
  key_outcomes?: string | null;
  project_url?: string | null;
}

export interface UndergraduateDetailsInput {
  program_type: "regular" | "distance";
  degree_type: string;
  program_name: string;
  specialization?: string | null;
  university_name: string;
  university_type: string;
  institution_name: string;
  institution_type: string;
  admission_year: string;
  passing_year: string;
  duration_years: number;
  register_number?: string | null;
  academic_cycle: "semester" | "yearly";
  semester_records: SemesterRecord[];
  final_summary: {
    total_credits?: number | null;
    cgpa?: number | null;
    percentage?: number | null;
    rank?: string | null;
    total_backlogs?: number | null;
    result_status: string;
    remarks?: string | null;
  };
  documents: {
    semester_mark_sheet_urls: string[];
    degree_certificate_url?: string | null;
    provisional_certificate_url?: string | null;
    consolidated_mark_sheet_url?: string | null;
  };
  has_projects: boolean;
  projects: ProjectEntry[];
}

// PG and Diploma are structurally identical to Undergraduate.
export type PgDetailsInput = UndergraduateDetailsInput;
export type DiplomaDetailsInput = UndergraduateDetailsInput;

export interface AcademicRecords {
  tenth_grade?: TenthGradeDetailsInput;
  twelfth_grade?: TwelfthGradeDetailsInput;
  undergraduate?: UndergraduateDetailsInput;
  pg?: PgDetailsInput;
  diploma?: DiplomaDetailsInput;
}

export interface InternshipEntry {
  company_name: string;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  key_responsibilities?: string | null;
}

export interface WorkExperienceEntry {
  company_name: string;
  job_title?: string | null;
  industry?: string | null;
  employment_type?: string | null;
  total_experience?: string | null;
}

export interface LanguageEntry {
  language: string;
  proficiency?: string | null;
}

export interface AcademicAwardEntry {
  title: string;
  year?: number | null;
  issuing_body?: string | null;
  proof_url?: string | null;
}

export interface SportsAchievementEntry {
  sport_name: string;
  competition_level?: string | null;
  position_secured?: string | null;
  achievement_year?: number | null;
  certificate_url?: string | null;
}

export interface ArtsCulturalAchievementEntry {
  category: string;
  competition_name?: string | null;
  achievement_level?: string | null;
  position_secured?: string | null;
  certificate_url?: string | null;
}

export interface PublicationEntry {
  title: string;
  journal_publisher?: string | null;
  url?: string | null;
}

export interface PatentEntry {
  title: string;
  patent_number?: string | null;
  status: "filed" | "published" | "granted";
  filing_date?: string | null;
  patent_office?: string | null;
  co_inventors?: string | null;
  document_url?: string | null;
}

export interface CertificationEntry {
  name: string;
  issuing_authority: string;
  certification_id?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  verification_url?: string | null;
  certificate_url?: string | null;
}

export interface PortfolioLinks {
  linkedin_url?: string | null;
  github_url?: string | null;
  researchgate_url?: string | null;
  google_scholar_url?: string | null;
  orcid_id?: string | null;
  personal_website_url?: string | null;
  behance_url?: string | null;
  dribbble_url?: string | null;
  kaggle_url?: string | null;
}

export interface RecommendationLetterEntry {
  document_url: string;
}

export interface InnovationEntry {
  startup_name: string;
  role?: string | null;
  contribution?: string | null;
  incubation_support?: string | null;
  dpiit_registration_number?: string | null;
}

export interface VolunteeringEntry {
  organization_name: string;
  role?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface AchievementsDetailsInput {
  internships: InternshipEntry[];
  has_work_experience: boolean;
  work_experience: WorkExperienceEntry[];
  languages: LanguageEntry[];
  academic_awards: AcademicAwardEntry[];
  sports_achievements: SportsAchievementEntry[];
  arts_cultural_achievements: ArtsCulturalAchievementEntry[];
  hobbies: string[];
  other_interests?: string | null;
  publications: PublicationEntry[];
  patents: PatentEntry[];
  professional_certifications: CertificationEntry[];
  portfolio_links: PortfolioLinks;
  recommendation_letters: RecommendationLetterEntry[];
  innovation_entrepreneurship: InnovationEntry[];
  volunteering: VolunteeringEntry[];
}

export type ApplicationFormDetailsSection =
  | "personal_details"
  | "family_details"
  | "address_details"
  | "qualification_details"
  | "achievements_details"
  | "tenth_grade"
  | "twelfth_grade"
  | "undergraduate"
  | "pg"
  | "diploma"
  | "entrance_exam_details"
  | "declaration";

export interface ApplicationFormDetailsBySection {
  personal_details: Partial<PersonalDetailsInput>;
  family_details: Partial<FamilyDetailsInput>;
  address_details: Partial<AddressDetailsInput>;
  qualification_details: Partial<AcademicRecords>;
  achievements_details: Partial<AchievementsDetailsInput>;
  tenth_grade: Partial<TenthGradeDetailsInput>;
  twelfth_grade: Partial<TwelfthGradeDetailsInput>;
  undergraduate: Partial<UndergraduateDetailsInput>;
  pg: Partial<PgDetailsInput>;
  diploma: Partial<DiplomaDetailsInput>;
  entrance_exam_details: Partial<EntranceExamDetailsInput>;
  declaration: Partial<DeclarationInput>;
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
  // Legacy — superseded by signature_url/place/date, kept optional.
  full_name_confirmation?: string | null;
  signature_url: string;
  place: string;
  date: string;
}

export interface EntranceExamRecord {
  exam_name: string;
  year_of_appearance?: number | null;
  roll_number?: string | null;
  score_or_percentile?: string | null;
  mark_card_url?: string | null;
}

export interface EntranceExamDetailsInput {
  has_attempted_entrance_exam: boolean;
  exams: EntranceExamRecord[];
  recommendation_letters: RecommendationLetterEntry[];
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
  profilePhotoUrl: string | null;
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

export interface PendingEnrollmentItem {
  applicationCourseId: string;
  applicationId: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  courseId: string;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  admissionCycleId: string;
  admissionCycleName: string;
  applicationFee: string;
  offerNumber: string | null;
  tokenAmount: string | null;
  tokenPaymentStatus: string | null;
  statusUpdatedAt: string | null;
}

export interface PendingShortlistItem {
  applicationCourseId: string;
  applicationId: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  courseName: string;
  courseCode: string;
  isPrimary: boolean;
  admissionCycleName: string;
  currentStage: string;
  statusUpdatedAt: string | null;
}

export interface PendingShortlistDetail extends PendingShortlistItem {
  applicationFee: string;
}

export interface PendingEnrollmentListQuery {
  admission_cycle_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PendingEnrollmentListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PendingEnrollmentListResponse {
  requests: PendingEnrollmentItem[];
  meta: PendingEnrollmentListMeta;
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

export interface ApplicationDocumentVerificationHistoryEntry {
  reason: string;
  rejectedBy: string;
  rejectedByName: string;
  rejectedAt: string;
}

export interface ApplicationDetailDocumentItem {
  id: string;
  documentType: string;
  documentCategory: string;
  fileUrl: string;
  fileName: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
  verifiedByName: string | null;
  verifiedAt: string | null;
  resubmissionCount: number;
  verificationHistory: ApplicationDocumentVerificationHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVerificationListItem {
  applicationId: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  profilePhotoUrl: string | null;
  submittedAt: string | null;
  lastDocumentUpdateAt: string | null;
  totalDocuments: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export interface DocumentVerificationListResponse {
  applications: DocumentVerificationListItem[];
  meta: PaginationMeta;
}

export interface DocumentVerificationDetail {
  applicationId: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  profilePhotoUrl: string | null;
  primaryCourseName: string | null;
  submittedAt: string | null;
  documents: ApplicationDetailDocumentItem[];
}

export interface RejectApplicationDocumentInput {
  reason: string;
}

export interface ApplicationDetailTransactionItem {
  id: string;
  transactionNumber: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface ApplicationDetailPaymentItem {
  id: string;
  applicationCourseId: string | null;
  courseName: string | null;
  feeCategory: string;
  description: string | null;
  totalAmount: string;
  scholarshipDiscount: string;
  netAmount: string;
  paidAmount: string;
  balanceAmount: string;
  status: string;
  transactions: ApplicationDetailTransactionItem[];
  createdAt: string;
}

export interface ApplicationStatusLogItem {
  courseId: string;
  courseName: string;
  fromStatus: string | null;
  toStatus: string;
  changedByType: string;
  changedAt: string;
}

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
  qualificationDetails: Partial<AcademicRecords>;
  achievementsDetails: Partial<AchievementsDetailsInput>;
  entranceExamDetails: Partial<EntranceExamDetailsInput>;
  declaration: Partial<DeclarationInput>;
  courses: ApplicationDetailCourseItem[];
  documents: ApplicationDetailDocumentItem[];
  payments: ApplicationDetailPaymentItem[];
  statusLogs: ApplicationStatusLogItem[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmPaymentInput {
  transaction_id: string;
  provider_payment_id: string;
  provider_signature?: string;
}

export interface EnrollmentItem {
  id: string;
  studentId: string;
  collegeId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  campusId: string | null;
  applicationCourseId: string;
  admissionCycleId: string;
  enrollmentNumber: string;
  academicYear: string;
  enrolledAt: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
}
