import { api } from "@/lib/api";
import type {
  AnswerResponse,
  AntiCheatEventType,
  AssessmentAttemptItem,
  AssessmentStartInfo,
  AttemptOverview,
  AttemptSectionQuestionPage,
  AttemptSectionSummary,
  SubmitTrialInput,
  TrialPaperItem,
  TrialResult,
} from "@beaconu/types";

interface SaveAnswerInput {
  response?: AnswerResponse;
  is_flagged?: boolean;
  time_spent_secs?: number;
}

export interface SavedAnswerDto {
  id: string;
  attemptId: string;
  questionId: string;
  sectionId: string;
  response: AnswerResponse | null;
  isFlagged: boolean;
  timeSpentSecs: number | null;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  evaluationStatus: string;
  evaluationRemarks: string | null;
  answeredAt: string | null;
}

export async function getAssessmentStart(
  applicationId: string,
): Promise<AssessmentStartInfo> {
  return api.get(
    `/api/v1/student/assessments/start?application_id=${applicationId}`,
  );
}

export async function getTrialPaper(
  templateId: string,
): Promise<TrialPaperItem> {
  return api.get(`/api/v1/student/assessments/templates/${templateId}/trial`);
}

export async function submitTrial(
  templateId: string,
  input: SubmitTrialInput,
): Promise<TrialResult> {
  return api.post(
    `/api/v1/student/assessments/templates/${templateId}/trial/submit`,
    input,
  );
}

export async function startAttempt(
  applicationId: string,
): Promise<AssessmentAttemptItem> {
  return api.post("/api/v1/student/assessments/attempts", {
    application_id: applicationId,
  });
}

export async function getMyAttempt(
  attemptId: string,
): Promise<AssessmentAttemptItem> {
  return api.get(`/api/v1/student/assessments/attempts/${attemptId}`);
}

export async function getAttemptSections(
  attemptId: string,
): Promise<AttemptSectionSummary[]> {
  return api.get(`/api/v1/student/assessments/attempts/${attemptId}/sections`);
}

export async function getSectionQuestion(
  attemptId: string,
  sectionId: string,
  questionOrder: number,
): Promise<AttemptSectionQuestionPage> {
  return api.get(
    `/api/v1/student/assessments/attempts/${attemptId}/sections/${sectionId}/questions?question_order=${questionOrder}`,
  );
}

export async function getAttemptOverview(
  attemptId: string,
  sectionId: string,
): Promise<AttemptOverview> {
  return api.get(
    `/api/v1/student/assessments/attempts/${attemptId}/overview?section_id=${sectionId}`,
  );
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  input: SaveAnswerInput,
): Promise<SavedAnswerDto> {
  return api.patch(
    `/api/v1/student/assessments/attempts/${attemptId}/answers/${questionId}`,
    input,
  );
}

export async function recordAntiCheatEvent(
  attemptId: string,
  type: AntiCheatEventType,
): Promise<void> {
  await api.post(
    `/api/v1/student/assessments/attempts/${attemptId}/anti-cheat-events`,
    { type },
  );
}

export async function submitAttempt(
  attemptId: string,
): Promise<AssessmentAttemptItem> {
  return api.post(
    `/api/v1/student/assessments/attempts/${attemptId}/submit`,
    {},
  );
}

interface AudioUploadPresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

interface AudioUploadVerifyResponse {
  verified: boolean;
  permanentUrl: string;
  viewUrl: string;
}

export async function uploadAssessmentAudioFile(file: Blob): Promise<{
  url: string;
}> {
  const mimeType = file.type || "audio/wav";
  const presigned = await api.post<AudioUploadPresignResponse>(
    "/api/v1/student/uploads/audio/presign",
    { mimeType, fileSizeBytes: file.size },
  );

  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload audio to storage (HTTP ${uploadResponse.status})`,
    );
  }

  const verified = await api.post<AudioUploadVerifyResponse>(
    "/api/v1/student/uploads/audio/verify",
    { key: presigned.key },
  );

  return { url: verified.permanentUrl };
}
