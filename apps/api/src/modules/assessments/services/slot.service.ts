import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { SlotRepository } from "../repositories/slot.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { PaperRepository } from "../repositories/paper.repository";
import { computePaperDurationSecs } from "../lib/duration";
import type {
  CreateSlotBody,
  UpdateSlotBody,
} from "../validators/assessment.validator";

export class SlotService {
  private static validateWindow(start: Date, end: Date) {
    if (end.getTime() <= start.getTime()) {
      throw new ValidationError("window_end must be after window_start");
    }
  }

  private static computeFixedWindowEnd(
    windowStart: Date,
    durationSecs: number,
  ): Date {
    return new Date(windowStart.getTime() + durationSecs * 1000);
  }

  /** A fixed slot's end time must match how long the assessment actually
   * runs — the sum of the approved normal paper's questions' time_limit_secs
   * — not an admin-declared duration (removed; see docs/context.md's rule
   * that total assessment time is the sum of all question times). */
  private static async resolveFixedWindowEnd(templateId: string, start: Date) {
    const paper = await PaperRepository.findActiveByTemplateAndType(
      templateId,
      "normal",
    );
    if (!paper) {
      throw new ConflictError(
        "Approve a normal paper for this template before creating a fixed slot",
      );
    }
    return this.computeFixedWindowEnd(
      start,
      computePaperDurationSecs(paper.paperQuestions),
    );
  }

  static async create(
    collegeId: string,
    templateId: string,
    data: CreateSlotBody,
  ) {
    const template = await TemplateRepository.findById(templateId);
    if (!template || template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment template not found");
    }
    if (template.status !== "active") {
      throw new ConflictError("Activate the template before scheduling slots");
    }

    const windowEnd =
      data.slot_type === "fixed"
        ? await this.resolveFixedWindowEnd(templateId, data.window_start)
        : data.window_end!;

    this.validateWindow(data.window_start, windowEnd);

    return SlotRepository.create(collegeId, templateId, {
      ...data,
      window_end: windowEnd,
    });
  }

  static async listByTemplate(collegeId: string, templateId: string) {
    return SlotRepository.listByTemplate(collegeId, templateId);
  }

  private static async loadForCollege(id: string, collegeId: string) {
    const slot = await SlotRepository.findById(id);
    if (!slot || slot.collegeId !== collegeId) {
      throw new NotFoundError("Assessment slot not found");
    }
    return slot;
  }

  static async update(collegeId: string, id: string, data: UpdateSlotBody) {
    const existing = await this.loadForCollege(id, collegeId);

    const slotType = data.slot_type ?? existing.slotType;
    const start = data.window_start ?? existing.windowStart;

    let end = data.window_end ?? existing.windowEnd;
    if (
      slotType === "fixed" &&
      (data.window_start !== undefined || data.slot_type === "fixed")
    ) {
      end = await this.resolveFixedWindowEnd(existing.templateId, start);
    }

    if (
      data.window_start !== undefined ||
      data.window_end !== undefined ||
      end !== existing.windowEnd
    ) {
      this.validateWindow(start, end);
    }

    return SlotRepository.update(id, { ...data, window_end: end });
  }

  static async setActive(collegeId: string, id: string, isActive: boolean) {
    const slot = await this.loadForCollege(id, collegeId);
    if (isActive && slot.status === "active") {
      throw new ConflictError("Slot is already active");
    }
    if (!isActive && slot.status === "inactive") {
      throw new ConflictError("Slot is already inactive");
    }

    if (isActive) {
      // Only one active slot per template — activating this one
      // deactivates whichever slot currently holds that spot.
      await SlotRepository.deactivateOtherActive(slot.templateId, id);
    }

    return SlotRepository.setActive(id, isActive);
  }
}
