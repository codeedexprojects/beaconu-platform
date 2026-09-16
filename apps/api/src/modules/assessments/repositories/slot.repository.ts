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

  /** The slot a student would sit right now: the one whose window is open,
   * else the next one to open, else the most recent past one (so the start
   * screen can say the window has closed). */
  static async findCurrentActiveForTemplate(templateId: string) {
    const now = new Date();
    const open = await prisma.assessmentSlot.findFirst({
      where: {
        templateId,
        status: "active",
        windowStart: { lte: now },
        windowEnd: { gte: now },
      },
      orderBy: { windowStart: "desc" },
    });
    if (open) return open;

    const upcoming = await prisma.assessmentSlot.findFirst({
      where: { templateId, status: "active", windowStart: { gt: now } },
      orderBy: { windowStart: "asc" },
    });
    if (upcoming) return upcoming;

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
