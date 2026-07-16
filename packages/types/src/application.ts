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

export interface StartApplicationInput {
  nationality: string;
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

export interface ApplicationCourseQuotaOptionsDto {
  baseApplicationFee: string;
  quotas: ApplicationCourseQuotaOption[];
}

export interface ApplicationCourseDto {
  id: string;
  applicationId: string;
  courseId: string;
  applicationFee: string;
  status: string;
  courseQuotaSeatId: string | null;
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
