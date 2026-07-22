import { api } from "@/lib/api";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import type {
  AssessmentSectionItem,
  QuestionTypeItem,
  QuestionItem,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionListQuery,
  AssessmentTemplateItem,
  CreateTemplateInput,
  UpdateTemplateInput,
  AssessmentPaperItem,
  GeneratePaperInput,
  AssessmentSlotItem,
  CreateSlotInput,
  UpdateSlotInput,
  PaginationMeta,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/assessments";

export interface CoreSectionMeta {
  slug: string;
  name: string;
  description: string;
}

export const CORE_SECTIONS: CoreSectionMeta[] = [
  {
    slug: "verbal-communication",
    name: "Verbal Communication",
    description:
      "Audio Comprehension, Repeat Sentence, Read Aloud, Respond to a Situation, Describe Image.",
  },
  {
    slug: "aptitude-logical-reasoning",
    name: "Aptitude & Logical Reasoning",
    description: "MCQ, Data Interpretation, Sequence Questions.",
  },
  {
    slug: "listening-reading",
    name: "Listening & Reading",
    description:
      "Audio Comprehension, MCQ, True/False, Passage-Based Questions.",
  },
  {
    slug: "leadership-qualities",
    name: "Leadership Qualities",
    description: "Scenario-Based Writing (Text), Ranking Questions.",
  },
  {
    slug: "emotional-intelligence",
    name: "Emotional Intelligence",
    description: "Scenario-Based MCQ, Likert Scale, Situational Judgement.",
  },
];

export const CALCULATOR_SECTIONS: CoreSectionMeta[] = [
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator Section",
    description:
      "Engineering / Sciences / Technology — trigonometric, logarithmic, and exponential computations.",
  },
  {
    slug: "financial-calculator",
    name: "Financial Calculator Section",
    description:
      "Commerce / Finance / MBA / Economics — interest, amortisation, NPV, IRR, financial ratios.",
  },
  {
    slug: "basic-calculator",
    name: "Basic Calculator Section",
    description:
      "Arts / Humanities / General Programs — arithmetic, percentages, unit conversions.",
  },
];

export async function getAssessmentSections(): Promise<
  AssessmentSectionItem[]
> {
  return api.get(`${BASE}/sections`);
}

export async function toggleAssessmentSection(
  slug: string,
  isActive: boolean,
): Promise<AssessmentSectionItem> {
  return api.patch(`${BASE}/sections/${slug}/toggle`, {
    is_active: isActive,
  });
}

export async function getQuestionTypes(
  slug: string,
): Promise<QuestionTypeItem[]> {
  return api.get(`${BASE}/sections/${slug}/question-types`);
}

function toQueryString(filters: QuestionListQuery): string {
  const params = new URLSearchParams();
  if (filters.question_type_id)
    params.set("question_type_id", filters.question_type_id);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.status) params.set("status", filters.status);
  if (filters.course_id) params.set("course_id", filters.course_id);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getQuestions(
  slug: string,
  filters: QuestionListQuery = {},
): Promise<{ questions: QuestionItem[]; meta: PaginationMeta }> {
  return api.get(`${BASE}/sections/${slug}/questions${toQueryString(filters)}`);
}

export async function createQuestion(
  slug: string,
  data: CreateQuestionInput,
): Promise<QuestionItem> {
  return api.post(`${BASE}/sections/${slug}/questions`, data);
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput,
): Promise<QuestionItem> {
  return api.patch(`${BASE}/questions/${id}`, data);
}

export async function deleteQuestion(id: string): Promise<QuestionItem> {
  return api.delete(`${BASE}/questions/${id}`);
}

export async function uploadAssessmentMedia(
  slug: string,
  file: File,
): Promise<string> {
  return uploadCollegeAdminFile(file, `assessments/${slug}`);
}

export async function getAssessmentTemplates(): Promise<
  AssessmentTemplateItem[]
> {
  return api.get(`${BASE}/templates`);
}

export async function getAssessmentTemplate(
  id: string,
): Promise<AssessmentTemplateItem> {
  return api.get(`${BASE}/templates/${id}`);
}

export async function createAssessmentTemplate(
  data: CreateTemplateInput,
): Promise<AssessmentTemplateItem> {
  return api.post(`${BASE}/templates`, data);
}

export async function updateAssessmentTemplate(
  id: string,
  data: UpdateTemplateInput,
): Promise<AssessmentTemplateItem> {
  return api.patch(`${BASE}/templates/${id}`, data);
}

export async function activateAssessmentTemplate(
  id: string,
): Promise<AssessmentTemplateItem> {
  return api.patch(`${BASE}/templates/${id}/activate`, {});
}

export async function archiveAssessmentTemplate(
  id: string,
): Promise<AssessmentTemplateItem> {
  return api.patch(`${BASE}/templates/${id}/archive`, {});
}

export async function generateAssessmentPaper(
  templateId: string,
  data: GeneratePaperInput,
): Promise<AssessmentPaperItem> {
  return api.post(`${BASE}/templates/${templateId}/papers`, data);
}

export async function getAssessmentPapers(
  templateId: string,
): Promise<AssessmentPaperItem[]> {
  return api.get(`${BASE}/templates/${templateId}/papers`);
}

export async function getAssessmentPaper(
  id: string,
): Promise<AssessmentPaperItem> {
  return api.get(`${BASE}/papers/${id}`);
}

export async function approveAssessmentPaper(
  id: string,
): Promise<AssessmentPaperItem> {
  return api.patch(`${BASE}/papers/${id}/approve`, {});
}

export async function renameAssessmentPaper(
  id: string,
  name: string,
): Promise<AssessmentPaperItem> {
  return api.patch(`${BASE}/papers/${id}/rename`, { name });
}

export async function deleteAssessmentPaper(
  id: string,
): Promise<AssessmentPaperItem> {
  return api.delete(`${BASE}/papers/${id}`);
}

export async function getAssessmentSlots(
  templateId: string,
): Promise<AssessmentSlotItem[]> {
  return api.get(`${BASE}/templates/${templateId}/slots`);
}

export async function createAssessmentSlot(
  templateId: string,
  data: CreateSlotInput,
): Promise<AssessmentSlotItem> {
  return api.post(`${BASE}/templates/${templateId}/slots`, data);
}

export async function updateAssessmentSlot(
  id: string,
  data: UpdateSlotInput,
): Promise<AssessmentSlotItem> {
  return api.patch(`${BASE}/slots/${id}`, data);
}

export async function toggleAssessmentSlot(
  id: string,
  isActive: boolean,
): Promise<AssessmentSlotItem> {
  return api.patch(`${BASE}/slots/${id}/toggle`, { is_active: isActive });
}
