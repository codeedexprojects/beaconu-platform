import { NotFoundError } from "@/shared/errors";
import { SlotRepository } from "../repositories/slot.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { PaperRepository } from "../repositories/paper.repository";
import { AttemptRepository } from "../repositories/attempt.repository";
import {
  computePaperDurationSecs,
  computePaperTotalMarks,
} from "../lib/duration";
import type {
  AssessmentStartInfo,
  AttemptStatus,
  NegativeMarkingMode,
  SlotStatus,
  SlotType,
  TemplateInstructionItem,
} from "@beaconu/types";

export class AssessmentStartQuery {
  static async getBySlotId(
    collegeId: string,
    slotId: string,
    studentId?: string,
    applicationCourseId?: string,
  ): Promise<AssessmentStartInfo> {
    const slot = await SlotRepository.findById(slotId);
    if (!slot || slot.collegeId !== collegeId) {
      throw new NotFoundError("Assessment slot not found");
    }

    const template = await TemplateRepository.findById(slot.templateId);
    if (!template || template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment template not found");
    }

    const settings = template.settings as {
      negativeMarkingMode?: NegativeMarkingMode;
    };

    const now = new Date();
    const isWithinWindow =
      slot.status === "active" &&
      now >= slot.windowStart &&
      now <= slot.windowEnd;
    const hasWindowPassed = now > slot.windowEnd;

    const [normalPaper, trialPaper] = await Promise.all([
      PaperRepository.findActiveByTemplateAndType(template.id, "normal"),
      PaperRepository.findActiveByTemplateAndType(template.id, "trial"),
    ]);
    const totalDurationSecs = normalPaper
      ? computePaperDurationSecs(normalPaper.paperQuestions)
      : 0;
    const totalMarks = normalPaper
      ? computePaperTotalMarks(normalPaper.paperQuestions)
      : 0;

    let myAttempt: AssessmentStartInfo["myAttempt"] = null;
    if (studentId && applicationCourseId) {
      const attempt = await AttemptRepository.findByStudentAndApplicationCourse(
        applicationCourseId,
        studentId,
      );
      if (attempt) {
        myAttempt = { id: attempt.id, status: attempt.status as AttemptStatus };
      }
    }

    return {
      slot: {
        id: slot.id,
        slotType: slot.slotType as SlotType,
        windowStart: slot.windowStart.toISOString(),
        windowEnd: slot.windowEnd.toISOString(),
        status: slot.status as SlotStatus,
      },
      template: {
        id: template.id,
        name: template.name,
        totalQuestions: template.totalQuestions,
        totalMarks,
        totalDurationSecs,
        negativeMarkingMode: settings.negativeMarkingMode ?? "none",
        instructions:
          (template.instructions as unknown as
            | TemplateInstructionItem[]
            | null) ?? [],
        sections: template.templateSections.map((ts) => ({
          id: ts.sectionId,
          name: ts.section.name,
          questionCount: ts.questionCount,
          timeLimitMins: ts.timeLimitMins,
        })),
      },
      isWithinWindow,
      hasWindowPassed,
      hasActiveTrialPaper: trialPaper !== null,
      myAttempt,
    };
  }
}
