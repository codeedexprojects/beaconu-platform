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

export type PromptType = "text" | "audio";

export interface QuestionBlank {
  id: string;
  label?: string;
}

export interface QuestionContent {
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: QuestionOption[];
  promptType?: PromptType;
  blanks?: QuestionBlank[];
}

export interface BlankAnswer {
  blankId: string;
  optionId: string;
}

export interface AnswerKey {
  correctOptionIds?: string[];
  correctOrder?: string[];
  blankAnswers?: BlankAnswer[];
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
  timeLimitSecs: number;
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
  time_limit_secs?: number;
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
  time_limit_secs?: number;
  course_ids?: string[];
}

export interface QuestionListQuery {
  question_type_id?: string;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
  course_id?: string;
  page?: number;
  limit?: number;
}

export interface ToggleSectionInput {
  is_active: boolean;
}

export type TemplateStatus = "draft" | "active" | "archived";
export type NegativeMarkingMode = "none" | "fixed" | "proportional";

export interface TemplateInstructionItem {
  heading: string;
  description: string;
  /** Icon URL selected from the shared platform icon library (see IconItem). */
  icon?: string;
}

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
  status: TemplateStatus;
  negativeMarkingMode: NegativeMarkingMode;
  instructions: TemplateInstructionItem[];
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
  negative_marking_mode?: NegativeMarkingMode;
  instructions?: TemplateInstructionItem[];
  sections: TemplateSectionInput[];
}

export interface UpdateTemplateInput {
  name?: string;
  template_type?: string;
  negative_marking_mode?: NegativeMarkingMode;
  instructions?: TemplateInstructionItem[];
  sections?: TemplateSectionInput[];
}

export type PaperGenerationType = "auto" | "manual";
export type PaperStatus = "draft" | "approved" | "deleted";
export type PaperType = "trial" | "normal";

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
  name: string | null;
  generationType: PaperGenerationType;
  paperType: PaperType;
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
  paper_type?: PaperType;
  name?: string;
  course_id?: string;
  manual_selections?: ManualQuestionSelection[];
}

export type SlotType = "window" | "fixed";
export type SlotStatus = "active" | "inactive";

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
  // Only required for "window" — a "fixed" slot's end time is derived
  // server-side from window_start + the template's duration.
  window_end?: string;
  max_capacity?: number;
}

export interface UpdateSlotInput {
  slot_type?: SlotType;
  window_start?: string;
  window_end?: string;
  max_capacity?: number;
}

export interface ToggleSlotInput {
  is_active: boolean;
}

export interface AssessmentStartSectionSummary {
  id: string;
  name: string;
  questionCount: number;
  timeLimitMins: number;
}

export interface AssessmentStartInfo {
  /** null if the template (resolved from the student's admission cycle)
   * currently has no active slot scheduled — the Room screen should render
   * a "not currently scheduled" state, not an error, in that case. */
  slot: {
    id: string;
    slotType: SlotType;
    windowStart: string;
    windowEnd: string;
    status: SlotStatus;
  } | null;
  template: {
    id: string;
    name: string;
    totalQuestions: number;
    // Both computed as sums over the approved normal paper's questions
    // (0 if none approved yet) — not admin-declared fields, which no
    // longer exist on AssessmentTemplate. See Plan L.
    totalMarks: number;
    totalDurationSecs: number;
    negativeMarkingMode: NegativeMarkingMode;
    instructions: TemplateInstructionItem[];
    sections: AssessmentStartSectionSummary[];
  };
  isWithinWindow: boolean;
  hasWindowPassed: boolean;
  hasActiveTrialPaper: boolean;
  /** Always resolved now — application_id is a required input to the
   * start-info request. null if the student hasn't started an attempt yet. */
  myAttempt: { id: string; status: AttemptStatus } | null;
}

// ---------------------------------------------------------------------------
// Attempt + Evaluation
// ---------------------------------------------------------------------------

export type AttemptStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "auto_submitted"
  | "terminated"
  | "under_evaluation"
  | "evaluated"
  | "result_published";

export type AnswerEvaluationStatus = "pending" | "auto_scored" | "evaluated";
export type AntiCheatEventType = "tab_hidden" | "tab_visible";

/** Mirrors AnswerKey's shapes — one field populated per responseFormat. */
export interface AnswerResponse {
  selectedOptionIds?: string[];
  order?: string[];
  blankAnswers?: BlankAnswer[];
  text?: string;
}

export interface AssessmentAttemptItem {
  id: string;
  // One attempt per Application (covers every course listed on it), not
  // per ApplicationCourse.
  applicationId: string;
  studentId: string;
  paperId: string;
  slotId: string;
  status: AttemptStatus;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSecs: number | null;
  totalScore: number | null;
  maxScore: number | null;
  sectionScores: Record<string, { score: number; max: number }>;
  createdAt: string;
}

export interface StudentAnswerItem {
  id: string;
  attemptId: string;
  questionId: string;
  sectionId: string;
  response: AnswerResponse | null;
  isFlagged: boolean;
  timeSpentSecs: number;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  evaluationStatus: AnswerEvaluationStatus;
  evaluationRemarks: string | null;
  answeredAt: string | null;
}

// slot_id was removed — the slot is auto-resolved server-side from the
// student's application (admission cycle -> assessment template -> current
// active slot for that template), not chosen by the client. application_id
// (not application_course_id) since one attempt now covers the whole
// Application, not a single course on it.
export interface StartAttemptInput {
  application_id: string;
}

export interface SubmitAnswerInput {
  // Optional — a student can flag a question "for review" without having
  // answered it yet. At least one of response/is_flagged/time_spent_secs
  // must be present (enforced by the validator).
  response?: AnswerResponse;
  is_flagged?: boolean;
  time_spent_secs?: number;
}

export interface AntiCheatEventInput {
  type: AntiCheatEventType;
}

export interface EvaluationQueueItem {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  status: AttemptStatus;
  completedAt: string | null;
  pendingCount: number;
  autoScoredCount: number;
  evaluatedCount: number;
  totalScore: number | null;
  maxScore: number | null;
}

export interface EvaluationAnswerDetail {
  id: string;
  questionId: string;
  sectionId: string;
  sectionName: string;
  questionOrder: number;
  content: QuestionContent;
  answerKey: AnswerKey | null;
  marks: number;
  response: AnswerResponse | null;
  isFlagged: boolean;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  evaluationStatus: AnswerEvaluationStatus;
  evaluationRemarks: string | null;
}

export interface EvaluationAttemptDetail {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  status: AttemptStatus;
  startedAt: string | null;
  completedAt: string | null;
  totalScore: number | null;
  maxScore: number | null;
  answers: EvaluationAnswerDetail[];
}

export interface ScoreOverrideInput {
  manual_score: number;
  remarks?: string;
}

export type AttemptSectionStatus = "not_started" | "in_progress" | "completed";

export interface AttemptSectionSummary {
  id: string;
  sectionId: string;
  name: string;
  description: string | null;
  questionCount: number;
  timeLimitMins: number;
  answeredCount: number;
  status: AttemptSectionStatus;
}

export interface AttemptQuestionMyAnswer {
  response: AnswerResponse | null;
  isFlagged: boolean;
  answeredAt: string | null;
}

export interface AttemptQuestionItem {
  id: string;
  questionId: string;
  questionOrder: number;
  questionTypeId: string;
  content: QuestionContent;
  marks: number;
  timeLimitSecs: number;
  myAnswer: AttemptQuestionMyAnswer | null;
}

export interface AttemptOverviewQuestion {
  questionOrder: number;
  questionId: string;
  isAnswered: boolean;
  isFlagged: boolean;
}

export interface AttemptOverview {
  sectionId: string;
  sectionName: string;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  questions: AttemptOverviewQuestion[];
}

// ---------------------------------------------------------------------------
// Trial papers (ephemeral — never persisted, never create an Attempt)
// ---------------------------------------------------------------------------

export interface TrialPaperQuestionItem {
  id: string;
  sectionId: string;
  sectionName: string;
  questionTypeId: string;
  content: QuestionContent;
  marks: number;
  scorable: boolean;
}

export interface TrialPaperItem {
  paperId: string;
  paperCode: string;
  templateId: string;
  questions: TrialPaperQuestionItem[];
}

export interface SubmitTrialInput {
  answers: { question_id: string; response: AnswerResponse }[];
}

export interface TrialResultQuestionScore {
  questionId: string;
  scorable: boolean;
  autoScore: number | null;
}

export interface TrialResult {
  totalScore: number;
  maxScore: number;
  sectionScores: Record<string, { score: number; max: number }>;
  perQuestion: TrialResultQuestionScore[];
}
