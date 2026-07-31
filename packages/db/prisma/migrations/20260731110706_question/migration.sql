/*
  Warnings:

  - Added the required column `answer_format` to the `question_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "question_types" ADD COLUMN     "answer_format" VARCHAR(30);

-- Backfill existing rows (added by the assessment-question-types
-- restructure) before enforcing NOT NULL below.
UPDATE "question_types" SET "answer_format" = CASE "response_format"
  WHEN 'single_choice' THEN 'singleOptionSelection'
  WHEN 'multi_choice' THEN 'multiOptionSelection'
  WHEN 'fill_blank_drag_drop' THEN 'slotFillSelection'
  WHEN 'fill_blank_dropdown' THEN 'slotFillSelection'
  WHEN 'text_response' THEN 'freeText'
  WHEN 'audio_response' THEN 'audioRecording'
  WHEN 'likert_scale' THEN 'freeText'
  WHEN 'ranking' THEN 'slotFillSelection'
  WHEN 'sequence' THEN 'slotFillSelection'
  ELSE 'freeText'
END
WHERE "answer_format" IS NULL;

ALTER TABLE "question_types" ALTER COLUMN "answer_format" SET NOT NULL;
