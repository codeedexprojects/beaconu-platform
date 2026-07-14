import { prisma } from "@beaconu/db";
import type {
  CreateSlotBody,
  UpdateSlotBody,
} from "../validators/assessment.validator";

export class SlotRepository {
  static async create(
    collegeId: string,
    templateId: string,
    data: CreateSlotBody,
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
