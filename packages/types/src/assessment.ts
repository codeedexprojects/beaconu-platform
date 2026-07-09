export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "active" | "inactive" | "archived";

export interface AssessmentSectionItem {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isCoreSection: boolean;
  isActive: boolean;
}

export interface QuestionTypeItem {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  category: string;
  responseFormat: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  autoScorable: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionContent {
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: QuestionOption[];
}

export interface AnswerKey {
  correctOptionIds?: string[];
  correctOrder?: string[];
}

export interface QuestionItem {
  id: string;
  sectionId: string;
  questionTypeId: string;
  difficulty: QuestionDifficulty;
  title: string | null;
  content: QuestionContent;
  answerKey: AnswerKey | null;
  marks: number;
  negativeMarks: number;
  version: number;
  status: QuestionStatus;
  courseIds: string[];
  createdAt: string;
}

export interface CreateQuestionInput {
  question_type_id: string;
  difficulty: QuestionDifficulty;
  title?: string;
  content: QuestionContent;
  answer_key?: AnswerKey;
  marks: number;
  negative_marks?: number;
  course_ids?: string[];
}

export interface UpdateQuestionInput {
  question_type_id?: string;
  difficulty?: QuestionDifficulty;
  title?: string;
  content?: QuestionContent;
  answer_key?: AnswerKey;
  marks?: number;
  negative_marks?: number;
  course_ids?: string[];
}

export interface QuestionListQuery {
  question_type_id?: string;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
  course_id?: string;
}

export interface ToggleSectionInput {
  is_active: boolean;
}

export type TemplateStatus = "draft" | "active" | "archived";
export type NegativeMarkingMode = "none" | "fixed" | "proportional";

export interface TemplateSectionItem {
  id: string;
  sectionId: string;
  sectionName: string;
  questionCount: number;
  timeLimitMins: number;
  sectionWeightage: number | null;
  sortOrder: number;
}

export interface AssessmentTemplateItem {
  id: string;
  collegeId: string;
  name: string;
  templateType: string;
  totalQuestions: number;
  totalMarks: number;
  totalDurationMins: number;
  status: TemplateStatus;
  negativeMarkingMode: NegativeMarkingMode;
  sections: TemplateSectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSectionInput {
  section_id: string;
  question_count: number;
  time_limit_mins: number;
  section_weightage?: number;
  sort_order?: number;
}

export interface CreateTemplateInput {
  name: string;
  template_type?: string;
  total_marks: number;
  total_duration_mins: number;
  negative_marking_mode?: NegativeMarkingMode;
  sections: TemplateSectionInput[];
}

export interface UpdateTemplateInput {
  name?: string;
  template_type?: string;
  total_marks?: number;
  total_duration_mins?: number;
  negative_marking_mode?: NegativeMarkingMode;
  sections?: TemplateSectionInput[];
}

export type PaperGenerationType = "auto" | "manual";
export type PaperStatus = "draft" | "approved" | "deleted";

export interface PaperQuestionItem {
  id: string;
  questionId: string;
  sectionId: string;
  sectionName: string;
  questionOrder: number;
  question: QuestionItem;
}

export interface AssessmentPaperItem {
  id: string;
  templateId: string;
  paperCode: string;
  generationType: PaperGenerationType;
  status: PaperStatus;
  generatedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  questions: PaperQuestionItem[];
  createdAt: string;
}

export interface ManualQuestionSelection {
  question_id: string;
  section_id: string;
}

export interface GeneratePaperInput {
  generation_type: PaperGenerationType;
  course_id?: string;
  manual_selections?: ManualQuestionSelection[];
}

export type SlotType = "window" | "fixed";
export type SlotStatus = "active" | "cancelled";

export interface AssessmentSlotItem {
  id: string;
  collegeId: string;
  templateId: string;
  slotType: SlotType;
  windowStart: string;
  windowEnd: string;
  maxCapacity: number | null;
  status: SlotStatus;
  createdAt: string;
}

export interface CreateSlotInput {
  slot_type: SlotType;
  window_start: string;
  window_end: string;
  max_capacity?: number;
}

export interface UpdateSlotInput {
  slot_type?: SlotType;
  window_start?: string;
  window_end?: string;
  max_capacity?: number;
}
