import { prisma } from "@beaconu/db";
import type {
  CreateSlotBody,
  UpdateSlotBody,
} from "../validators/assessment.validator";

export class SlotRepository {
  static async create(
    collegeId: string,
    templateId: string,
    data: Omit<CreateSlotBody, "window_end"> & { window_end: Date },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.assessmentSlot.updateMany({
        where: { templateId, status: "active" },
        data: { status: "inactive" },
      });

      return tx.assessmentSlot.create({
        data: {
          collegeId,
          templateId,
          slotType: data.slot_type,
          windowStart: data.window_start,
          windowEnd: data.window_end,
          maxCapacity: data.max_capacity ?? null,
        },
      });
    });
  }

  static async findById(id: string) {
    return prisma.assessmentSlot.findUnique({ where: { id } });
  }

  /** Slot is "just a timing wrapper around a template" — the student never
   * picks one directly, so this resolves whichever slot is currently
   * active for the template. `create()` above already auto-deactivates any
   * other active slot for the same template, so there's normally at most
   * one match; orderBy is just a tiebreaker if that convention ever drifts. */
  static async findCurrentActiveForTemplate(templateId: string) {
    return prisma.assessmentSlot.findFirst({
      where: { templateId, status: "active" },
      orderBy: { windowStart: "desc" },
    });
  }

  static async listByTemplate(collegeId: string, templateId: string) {
    return prisma.assessmentSlot.findMany({
      where: { collegeId, templateId },
      orderBy: { windowStart: "asc" },
    });
  }

  static async update(id: string, data: UpdateSlotBody) {
    return prisma.assessmentSlot.update({
      where: { id },
      data: {
        ...(data.slot_type !== undefined && { slotType: data.slot_type }),
        ...(data.window_start !== undefined && {
          windowStart: data.window_start,
        }),
        ...(data.window_end !== undefined && {
          windowEnd: data.window_end,
        }),
        ...(data.max_capacity !== undefined && {
          maxCapacity: data.max_capacity,
        }),
      },
    });
  }

  static async setActive(id: string, isActive: boolean) {
    return prisma.assessmentSlot.update({
      where: { id },
      data: { status: isActive ? "active" : "inactive" },
    });
  }

  static async deactivateOtherActive(templateId: string, excludeId: string) {
    return prisma.assessmentSlot.updateMany({
      where: { templateId, status: "active", id: { not: excludeId } },
      data: { status: "inactive" },
    });
  }
}
