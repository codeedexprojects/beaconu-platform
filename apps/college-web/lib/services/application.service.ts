import { api } from "@/lib/api";
import { getReferralCodeCookie } from "@/lib/cookies";
import type {
  AchievementsDetailsInput,
  AddApplicationCourseInput,
  AddressDetailsInput,
  AdmissionCycleItem,
  ApplicationCourseDto,
  ApplicationDocumentDto,
  ApplicationFormDetailsBySection,
  ApplicationFormDetailsSection,
  ApplicationPaymentDto,
  ApplicationPaymentSummaryDto,
  ApplicationStatusSummary,
  ChangeApplicationCourseQuotaInput,
  ConfirmPaymentInput,
  CourseCatalogueItem,
  DeclarationInput,
  DiplomaDetailsInput,
  EntranceExamDetailsInput,
  FamilyDetailsInput,
  PersonalDetailsInput,
  PgDetailsInput,
  RegisterApplicationDocumentInput,
  RequiredDocumentDto,
  StartApplicationInput,
  StudentApplicationDto,
  StudentApplicationListItemDto,
  TenthGradeDetailsInput,
  TwelfthGradeDetailsInput,
  UndergraduateDetailsInput,
} from "@beaconu/types";

interface UploadPresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

interface UploadVerifyResponse {
  verified: boolean;
  permanentUrl: string;
  viewUrl: string;
}

export async function uploadApplicationDocumentFile(file: File): Promise<{
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}> {
  if (!file.type) {
    throw new Error("Selected file has no MIME type");
  }

  const presigned = await api.post<UploadPresignResponse>(
    "/api/v1/student/uploads/document/presign",
    { mimeType: file.type, fileSizeBytes: file.size },
  );

  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload file to storage (HTTP ${uploadResponse.status})`,
    );
  }

  const verified = await api.post<UploadVerifyResponse>(
    "/api/v1/student/uploads/document/verify",
    { key: presigned.key },
  );

  return {
    url: verified.permanentUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

export async function listAdmissionCycles(
  collegeId: string,
): Promise<AdmissionCycleItem[]> {
  return api.get(`/api/v1/student/application-forms?college_id=${collegeId}`);
}

export async function getAdmissionCycle(
  cycleId: string,
): Promise<AdmissionCycleItem> {
  return api.get(`/api/v1/student/application-forms/${cycleId}`);
}

export async function getCourseCatalogue(
  cycleId: string,
  search?: string,
): Promise<CourseCatalogueItem[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get(`/api/v1/student/application-forms/${cycleId}/courses${qs}`);
}

export async function startApplication(
  cycleId: string,
  input: StartApplicationInput,
): Promise<StudentApplicationDto> {
  const referralCode = getReferralCodeCookie();
  return api.post(`/api/v1/student/application-forms/${cycleId}/application`, {
    ...input,
    ...(referralCode ? { referral_code: referralCode } : {}),
  });
}

export async function addApplicationCourse(
  applicationId: string,
  input: AddApplicationCourseInput,
): Promise<ApplicationCourseDto> {
  return api.post(
    `/api/v1/student/application-forms/my-applications/${applicationId}/courses`,
    input,
  );
}

export async function withdrawApplicationCourse(
  applicationId: string,
  appCourseId: string,
): Promise<void> {
  await api.delete(
    `/api/v1/student/application-forms/my-applications/${applicationId}/courses/${appCourseId}`,
  );
}

export async function changeCourseQuota(
  applicationId: string,
  appCourseId: string,
  input: ChangeApplicationCourseQuotaInput,
): Promise<ApplicationCourseDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/courses/${appCourseId}/quota`,
    input,
  );
}

export async function listMyApplications(): Promise<
  StudentApplicationListItemDto[]
> {
  return api.get(`/api/v1/student/application-forms/my-applications`);
}

export async function getMyApplication(
  applicationId: string,
): Promise<StudentApplicationDto> {
  return api.get(
    `/api/v1/student/application-forms/my-applications/${applicationId}`,
  );
}

export async function getApplicationStatus(
  cycleId: string,
  applicationId: string,
): Promise<ApplicationStatusSummary[] | null> {
  return api.get(
    `/api/v1/student/application-forms/${cycleId}/application/status?application_id=${applicationId}`,
  );
}

export async function getPaymentSummary(
  applicationId: string,
): Promise<ApplicationPaymentSummaryDto> {
  return api.get(
    `/api/v1/student/application-forms/my-applications/${applicationId}/summary`,
  );
}

export async function getFormDetails<S extends ApplicationFormDetailsSection>(
  applicationId: string,
  section: S,
): Promise<ApplicationFormDetailsBySection[S]> {
  return api.get(
    `/api/v1/student/application-forms/my-applications/${applicationId}/details?section=${section}`,
  );
}

export async function updatePersonalDetails(
  applicationId: string,
  input: PersonalDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/personal-details`,
    input,
  );
}

export async function updateFamilyDetails(
  applicationId: string,
  input: FamilyDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/family-details`,
    input,
  );
}

export async function updateAddressDetails(
  applicationId: string,
  input: AddressDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/address-details`,
    input,
  );
}

export async function updateTenthGradeDetails(
  applicationId: string,
  input: TenthGradeDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/academic-records/tenth-grade`,
    input,
  );
}

export async function updateTwelfthGradeDetails(
  applicationId: string,
  input: TwelfthGradeDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/academic-records/twelfth-grade`,
    input,
  );
}

export async function updateUndergraduateDetails(
  applicationId: string,
  input: UndergraduateDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/academic-records/undergraduate`,
    input,
  );
}

export async function updatePgDetails(
  applicationId: string,
  input: PgDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/academic-records/pg`,
    input,
  );
}

export async function updateDiplomaDetails(
  applicationId: string,
  input: DiplomaDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/academic-records/diploma`,
    input,
  );
}

export async function updateAchievementsDetails(
  applicationId: string,
  input: AchievementsDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/achievements-details`,
    input,
  );
}

export async function updateEntranceExamDetails(
  applicationId: string,
  input: EntranceExamDetailsInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/entrance-exam-details`,
    input,
  );
}

export async function listRequiredDocuments(
  applicationId: string,
): Promise<RequiredDocumentDto[]> {
  return api.get(
    `/api/v1/student/application-forms/my-applications/${applicationId}/documents/required`,
  );
}

export async function listUploadedDocuments(
  applicationId: string,
): Promise<ApplicationDocumentDto[]> {
  return api.get(
    `/api/v1/student/application-forms/my-applications/${applicationId}/documents`,
  );
}

export async function registerDocuments(
  applicationId: string,
  documents: RegisterApplicationDocumentInput[],
): Promise<ApplicationDocumentDto[]> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/documents`,
    { documents },
  );
}

export async function updateDeclaration(
  applicationId: string,
  input: DeclarationInput,
): Promise<StudentApplicationDto> {
  return api.patch(
    `/api/v1/student/application-forms/my-applications/${applicationId}/declaration`,
    input,
  );
}

export async function submitApplication(
  applicationId: string,
): Promise<StudentApplicationDto> {
  return api.post(
    `/api/v1/student/application-forms/my-applications/${applicationId}/submit`,
    undefined,
  );
}

export async function initiateApplicationPayment(
  applicationId: string,
): Promise<ApplicationPaymentDto> {
  return api.post(
    `/api/v1/student/payments/applications/${applicationId}/initiate`,
    undefined,
  );
}

export async function confirmApplicationPayment(
  applicationId: string,
  input: ConfirmPaymentInput,
): Promise<ApplicationPaymentDto> {
  return api.post(
    `/api/v1/student/payments/applications/${applicationId}/confirm`,
    input,
  );
}
