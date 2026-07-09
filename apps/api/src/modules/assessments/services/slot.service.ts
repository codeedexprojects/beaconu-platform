import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { SlotRepository } from "../repositories/slot.repository";
import { TemplateRepository } from "../repositories/template.repository";
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

    this.validateWindow(data.window_start, data.window_end);

    return SlotRepository.create(collegeId, templateId, data);
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

    const start = data.window_start ?? existing.windowStart;
    const end = data.window_end ?? existing.windowEnd;
    if (data.window_start !== undefined || data.window_end !== undefined) {
      this.validateWindow(start, end);
    }

    return SlotRepository.update(id, data);
  }

  static async cancel(collegeId: string, id: string) {
    const slot = await this.loadForCollege(id, collegeId);
    if (slot.status === "cancelled") {
      throw new ConflictError("Slot is already cancelled");
    }
    return SlotRepository.cancel(id);
  }
}
