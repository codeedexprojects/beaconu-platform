import { prisma } from "@beaconu/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { QuestionRepository } from "../repositories/question.repository";
import { SectionRepository } from "../repositories/section.repository";
import type {
  AnswerKey,
  CreateQuestionInput,
  QuestionContent,
  UpdateQuestionInput,
} from "@beaconu/types";

// word_highlight (highlightWords) is structurally identical to
// multi_choice — options + a set of correct option ids (the "wrong"
// words) — just a different UI widget (tap-to-toggle words in a passage
// vs a discrete options list), so it shares the same choice validation.
const CHOICE_FORMATS = ["single_choice", "multi_choice", "word_highlight"];
const ORDERED_FORMATS = ["ranking", "sequence"];
// audioDropdownFill/audioDragAndDropFill reuse the exact same
// responseFormat as their non-audio counterparts (fill_blank_dropdown/
// fill_blank_drag_drop) — the audio flag (hasAudio) is what distinguishes
// them, not a separate format value.
const FILL_BLANK_FORMATS = ["fill_blank_drag_drop", "fill_blank_dropdown"];

export class QuestionBankService {
  private static async loadSection(collegeId: string, sectionSlug: string) {
    const section = await SectionRepository.findByCollegeAndSlug(
      collegeId,
      sectionSlug,
    );
    if (!section) throw new NotFoundError("Assessment section not found");
    return section;
  }

  private static validateCourseMapping(
    isCoreSection: boolean,
    courseIds: string[] | undefined,
  ) {
    if (isCoreSection) {
      if (courseIds && courseIds.length > 0) {
        throw new ValidationError(
          "Questions in this section apply to all courses and cannot be mapped to specific courses",
        );
      }
      return;
    }

    if (!courseIds || courseIds.length === 0) {
      throw new ValidationError(
        "This section is course-specific — map this question to at least one course",
      );
    }
  }

  private static async validateQuestionType(
    collegeId: string,
    questionTypeId: string,
  ) {
    const questionType = await prisma.questionType.findFirst({
      where: { id: questionTypeId, collegeId },
    });
    if (!questionType) throw new NotFoundError("Question type not found");
    return questionType;
  }

  private static validateContentAndAnswerKey(
    questionType: {
      hasAudio: boolean;
      hasImage: boolean;
      responseFormat: string;
      autoScorable: boolean;
    },
    content: QuestionContent,
    answerKey: AnswerKey | undefined,
  ) {
    const promptType =
      content.promptType ?? (questionType.hasAudio ? "audio" : "text");
    if (promptType === "audio" && !content.audioUrl) {
      throw new ValidationError("Prompt type is audio — upload an audio file");
    }
    if (questionType.hasImage && !content.imageUrl) {
      throw new ValidationError("This question type requires an image upload");
    }

    const isChoice = CHOICE_FORMATS.includes(questionType.responseFormat);
    const isOrdered = ORDERED_FORMATS.includes(questionType.responseFormat);
    const isFillBlank = FILL_BLANK_FORMATS.includes(
      questionType.responseFormat,
    );

    if (isFillBlank) {
      if (!content.options || content.options.length < 1) {
        throw new ValidationError(
          "This question type requires at least 1 word bank option",
        );
      }
      if (!content.blanks || content.blanks.length < 1) {
        throw new ValidationError(
          "This question type requires at least 1 blank",
        );
      }

      if (questionType.autoScorable) {
        const optionIds = new Set(content.options.map((o) => o.id));
        const blankIds = new Set(content.blanks.map((b) => b.id));
        const blankAnswers = answerKey?.blankAnswers;

        if (!blankAnswers || blankAnswers.length !== content.blanks.length) {
          throw new ValidationError(
            "Provide exactly one correct answer per blank",
          );
        }
        const answeredBlankIds = new Set(blankAnswers.map((a) => a.blankId));
        if (answeredBlankIds.size !== blankAnswers.length) {
          throw new ValidationError("Each blank can only have one answer");
        }
        for (const answer of blankAnswers) {
          if (!blankIds.has(answer.blankId)) {
            throw new ValidationError(
              `Blank id "${answer.blankId}" does not match any provided blank`,
            );
          }
          if (!optionIds.has(answer.optionId)) {
            throw new ValidationError(
              `Option id "${answer.optionId}" does not match any provided option`,
            );
          }
        }
      }
      return;
    }

    if (isChoice || isOrdered) {
      if (!content.options || content.options.length < 2) {
        throw new ValidationError(
          "This question type requires at least 2 options",
        );
      }

      if (questionType.autoScorable) {
        const optionIds = new Set(content.options.map((o) => o.id));

        if (isChoice) {
          if (!answerKey?.correctOptionIds?.length) {
            throw new ValidationError(
              "This question type requires at least one correct option",
            );
          }
          for (const id of answerKey.correctOptionIds) {
            if (!optionIds.has(id)) {
              throw new ValidationError(
                `Correct option id "${id}" does not match any provided option`,
              );
            }
          }
        }

        if (isOrdered) {
          const correctOrder = answerKey?.correctOrder;
          if (
            !correctOrder ||
            correctOrder.length !== content.options.length ||
            !correctOrder.every((id) => optionIds.has(id)) ||
            new Set(correctOrder).size !== correctOrder.length
          ) {
            throw new ValidationError(
              "correct_order must be a permutation of the provided option ids",
            );
          }
        }
      }
      return;
    }

    if (!content.text && !content.audioUrl && !content.imageUrl) {
      throw new ValidationError(
        "Provide at least one of text, audio, or image for this question",
      );
    }
  }

  static async create(
    collegeId: string,
    sectionSlug: string,
    data: CreateQuestionInput,
  ) {
    const section = await this.loadSection(collegeId, sectionSlug);
    const questionType = await this.validateQuestionType(
      collegeId,
      data.question_type_id,
    );
    this.validateContentAndAnswerKey(
      questionType,
      data.content,
      data.answer_key,
    );
    this.validateCourseMapping(section.isCoreSection, data.course_ids);

    return QuestionRepository.create(collegeId, section.id, data);
  }

  static async update(
    collegeId: string,
    id: string,
    data: UpdateQuestionInput,
  ) {
    const existing = await QuestionRepository.findById(id);
    if (!existing || existing.collegeId !== collegeId) {
      throw new NotFoundError("Question not found");
    }

    const questionTypeId = data.question_type_id ?? existing.questionTypeId;
    const questionType = await this.validateQuestionType(
      collegeId,
      questionTypeId,
    );

    const mergedContent: QuestionContent = {
      ...(existing.content as QuestionContent),
      ...(data.content ?? {}),
    };
    const mergedAnswerKey: AnswerKey | undefined =
      data.answer_key ?? (existing.answerKey as AnswerKey | null) ?? undefined;
    this.validateContentAndAnswerKey(
      questionType,
      mergedContent,
      mergedAnswerKey,
    );

    const section = await SectionRepository.findById(existing.sectionId);
    const resolvedCourseIds =
      data.course_ids ?? existing.courseMappings.map((m) => m.courseId);
    this.validateCourseMapping(section!.isCoreSection, resolvedCourseIds);

    const created = await QuestionRepository.create(
      collegeId,
      existing.sectionId,
      {
        question_type_id: questionTypeId,
        difficulty:
          data.difficulty ??
          (existing.difficulty as CreateQuestionInput["difficulty"]),
        title: data.title ?? existing.title ?? undefined,
        content: mergedContent,
        answer_key: mergedAnswerKey,
        marks: data.marks ?? Number(existing.marks),
        negative_marks: data.negative_marks ?? Number(existing.negativeMarks),
        time_limit_secs: data.time_limit_secs ?? existing.timeLimitSecs,
        course_ids: resolvedCourseIds,
      },
      existing.id,
      existing.version + 1,
    );

    await QuestionRepository.archive(existing.id);
    return created;
  }

  static async remove(collegeId: string, id: string) {
    const existing = await QuestionRepository.findById(id);
    if (!existing || existing.collegeId !== collegeId) {
      throw new NotFoundError("Question not found");
    }
    return QuestionRepository.softDeactivate(id);
  }
}
