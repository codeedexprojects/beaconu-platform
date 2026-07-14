import { z } from "zod";

export const toggleSectionSchema = z.object({
  is_active: z.boolean(),
});

const questionOptionSchema = z.object({
  id: z.string().trim().min(1),
  text: z.string().trim().min(1),
});

const questionBlankSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().max(100).optional(),
});

const questionContentSchema = z.object({
  text: z.string().trim().max(2000).optional(),
  audioUrl: z.string().trim().url().optional(),
  imageUrl: z.string().trim().url().optional(),
  options: z.array(questionOptionSchema).optional(),
  promptType: z.enum(["text", "audio"]).optional(),
  blanks: z.array(questionBlankSchema).optional(),
});

const blankAnswerSchema = z.object({
  blankId: z.string().trim().min(1),
  optionId: z.string().trim().min(1),
});

const answerKeySchema = z.object({
  correctOptionIds: z.array(z.string().trim().min(1)).optional(),
  correctOrder: z.array(z.string().trim().min(1)).optional(),
  blankAnswers: z.array(blankAnswerSchema).optional(),
});

export const createQuestionSchema = z.object({
  question_type_id: z.string().trim().min(1, "Question type is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  title: z.string().trim().max(255).optional(),
  content: questionContentSchema,
  answer_key: answerKeySchema.optional(),
  marks: z.coerce.number().positive(),
  negative_marks: z.coerce.number().min(0).optional(),
  course_ids: z.array(z.string().trim().min(1)).optional(),
});

export const updateQuestionSchema = z.object({
  question_type_id: z.string().trim().min(1).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  title: z.string().trim().max(255).optional(),
  content: questionContentSchema.partial().optional(),
  answer_key: answerKeySchema.optional(),
  marks: z.coerce.number().positive().optional(),
  negative_marks: z.coerce.number().min(0).optional(),
  course_ids: z.array(z.string().trim().min(1)).optional(),
});

export const questionListQuerySchema = z.object({
  question_type_id: z.string().trim().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  course_id: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ToggleSectionBody = z.infer<typeof toggleSectionSchema>;
export type CreateQuestionBody = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionBody = z.infer<typeof updateQuestionSchema>;
export type QuestionListQueryParams = z.infer<typeof questionListQuerySchema>;

const templateInstructionSchema = z.object({
  heading: z.string().trim().min(1, "Heading is required").max(255),
  description: z.string().trim().min(1, "Description is required").max(2000),
});

const templateSectionSchema = z.object({
  section_id: z.string().trim().min(1),
  question_count: z.coerce.number().int().positive(),
  time_limit_mins: z.coerce.number().int().positive(),
  section_weightage: z.coerce.number().min(0).max(100).optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  template_type: z.string().trim().max(20).optional(),
  total_marks: z.coerce.number().positive(),
  total_duration_mins: z.coerce.number().int().positive(),
  negative_marking_mode: z.enum(["none", "fixed", "proportional"]).optional(),
  instructions: z.array(templateInstructionSchema).optional(),
  sections: z.array(templateSectionSchema).min(1),
});

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  template_type: z.string().trim().max(20).optional(),
  total_marks: z.coerce.number().positive().optional(),
  total_duration_mins: z.coerce.number().int().positive().optional(),
  negative_marking_mode: z.enum(["none", "fixed", "proportional"]).optional(),
  instructions: z.array(templateInstructionSchema).optional(),
  sections: z.array(templateSectionSchema).min(1).optional(),
});

export type CreateTemplateBody = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateBody = z.infer<typeof updateTemplateSchema>;

const manualQuestionSelectionSchema = z.object({
  question_id: z.string().trim().min(1),
  section_id: z.string().trim().min(1),
});

export const generatePaperSchema = z.object({
  generation_type: z.enum(["auto", "manual"]),
  name: z.string().trim().min(1).max(255).optional(),
  course_id: z.string().trim().min(1).optional(),
  manual_selections: z.array(manualQuestionSelectionSchema).optional(),
});

export type GeneratePaperBody = z.infer<typeof generatePaperSchema>;

export const renamePaperSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

export type RenamePaperBody = z.infer<typeof renamePaperSchema>;

export const createSlotSchema = z
  .object({
    slot_type: z.enum(["window", "fixed"]),
    window_start: z.coerce.date(),
    // Required for "window" (defines the latest start time); for "fixed"
    // it's derived server-side from window_start + the template's
    // totalDurationMins, since a fixed slot only ever has one start time.
    window_end: z.coerce.date().optional(),
    max_capacity: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce.number().int().positive().optional(),
    ),
  })
  .refine((data) => data.slot_type !== "window" || data.window_end, {
    message: "window_end is required for window slots",
    path: ["window_end"],
  });

export const updateSlotSchema = z.object({
  slot_type: z.enum(["window", "fixed"]).optional(),
  window_start: z.coerce.date().optional(),
  window_end: z.coerce.date().optional(),
  max_capacity: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
});

export type CreateSlotBody = z.infer<typeof createSlotSchema>;
export type UpdateSlotBody = z.infer<typeof updateSlotSchema>;

export const toggleSlotSchema = z.object({
  is_active: z.boolean(),
});

export type ToggleSlotBody = z.infer<typeof toggleSlotSchema>;
