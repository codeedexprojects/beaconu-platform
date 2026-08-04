import { ConflictError, NotFoundError } from "@/shared/errors";
import { AttemptRepository } from "../repositories/attempt.repository";
import { SlotRepository } from "../repositories/slot.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { PaperRepository } from "../repositories/paper.repository";
import {
  computeTemplateDurationSecs,
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
  static async getForApplication(
    studentId: string,
    applicationId: string,
  ): Promise<AssessmentStartInfo> {
    const application =
      await AttemptRepository.findApplicationForAttempt(applicationId);
    if (!application || application.studentId !== studentId) {
      throw new NotFoundError("Application not found");
    }

    const templateId = application.admissionCycle.assessmentTemplateId;
    if (!templateId) {
      throw new ConflictError(
        "No assessment configured for this admission cycle",
      );
    }

    const template = await TemplateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundError("Assessment template not found");
    }

    const settings = template.settings as {
      negativeMarkingMode?: NegativeMarkingMode;
    };

    const slot = await SlotRepository.findCurrentActiveForTemplate(templateId);
    const now = new Date();
    const isWithinWindow = slot
      ? slot.status === "active" &&
        now >= slot.windowStart &&
        now <= slot.windowEnd
      : false;
    const hasWindowPassed = slot ? now > slot.windowEnd : false;

    const [normalPaper, trialPaper] = await Promise.all([
      PaperRepository.findActiveByTemplateAndType(template.id, "normal"),
      PaperRepository.findActiveByTemplateAndType(template.id, "trial"),
    ]);
    const totalDurationSecs = computeTemplateDurationSecs(
      template.templateSections,
    );
    const totalMarks = normalPaper
      ? computePaperTotalMarks(normalPaper.paperQuestions)
      : 0;

    const attempt = await AttemptRepository.findByStudentAndApplication(
      applicationId,
      studentId,
    );
    const myAttempt: AssessmentStartInfo["myAttempt"] = attempt
      ? { id: attempt.id, status: attempt.status as AttemptStatus }
      : null;

    return {
      slot: slot
        ? {
            id: slot.id,
            slotType: slot.slotType as SlotType,
            windowStart: slot.windowStart.toISOString(),
            windowEnd: slot.windowEnd.toISOString(),
            status: slot.status as SlotStatus,
          }
        : null,
      template: {
        id: template.id,
        name: template.name,
        totalQuestions: template.totalQuestions,
        totalMarks,
        totalDurationMins: Math.ceil(totalDurationSecs / 60),
        negativeMarkingMode: settings.negativeMarkingMode ?? "none",
        instructions:
          (template.instructions as unknown as
            | TemplateInstructionItem[]
            | null) ?? [],
        sections: template.templateSections.map((ts) => ({
          id: ts.sectionId,
          name: ts.section.name,
          description: ts.section.description,
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
