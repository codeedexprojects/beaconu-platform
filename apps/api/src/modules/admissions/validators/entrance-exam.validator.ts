import { z } from "zod";

const entranceExamRecordSchema = z.object({
  exam_name: z.string().trim().min(1, "Exam name is required").max(150),
  year_of_appearance: z
    .number()
    .int()
    .min(1950)
    .max(2100)
    .optional()
    .nullable(),
  roll_number: z.string().trim().max(50).optional().nullable(),
  score_or_percentile: z.string().trim().max(50).optional().nullable(),
  mark_card_url: z.string().trim().url().optional().nullable(),
});

const recommendationLetterSchema = z.object({
  document_url: z.string().trim().url("A file must be uploaded"),
});

export const entranceExamDetailsSchema = z
  .object({
    has_attempted_entrance_exam: z.boolean(),
    exams: z.array(entranceExamRecordSchema).optional().default([]),
    recommendation_letters: z
      .array(recommendationLetterSchema)
      .optional()
      .default([]),
  })
  .refine(
    (data) => !data.has_attempted_entrance_exam || data.exams.length > 0,
    {
      message: "At least one exam record is required",
      path: ["exams"],
    },
  );

export type EntranceExamDetailsInput = z.infer<
  typeof entranceExamDetailsSchema
>;
