import { NotFoundError } from "@/shared/errors";
import { SlotRepository } from "../repositories/slot.repository";
import { TemplateRepository } from "../repositories/template.repository";
import type {
  AssessmentStartInfo,
  NegativeMarkingMode,
  SlotStatus,
  SlotType,
  TemplateInstructionItem,
} from "@beaconu/types";

export class AssessmentStartQuery {
  static async getBySlotId(
    collegeId: string,
    slotId: string,
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
        totalMarks: Number(template.totalMarks),
        totalDurationMins: template.totalDurationMins,
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
    };
  }
}
