import { ConflictError, NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { AntiRaggingRepository } from "../repositories/anti-ragging.repository";
import type {
  CreateComplaintInput,
  ResolveComplaintInput,
} from "../validators/anti-ragging.validator";

function historyEntry(status: string, changedBy: string | null) {
  return { status, changedAt: new Date().toISOString(), changedBy };
}

function appendHistory(existing: unknown, entry: Record<string, unknown>) {
  return [...(Array.isArray(existing) ? existing : []), entry];
}

async function notifyStudentOfStatusChange(
  complaint: { id: string; studentId: string; subject: string },
  status: "acknowledged" | "investigating" | "resolved",
): Promise<void> {
  const titles: Record<typeof status, string> = {
    acknowledged: "Report acknowledged",
    investigating: "Investigation started",
    resolved: "Report resolved",
  };
  const bodies: Record<typeof status, string> = {
    acknowledged: `Your report "${complaint.subject}" has been acknowledged by the college`,
    investigating: `An investigation has begun for your report "${complaint.subject}"`,
    resolved: `Your report "${complaint.subject}" has been resolved`,
  };
  try {
    await PushService.sendToUser(complaint.studentId, "student", {
      title: titles[status],
      body: bodies[status],
      data: { type: `anti_ragging_${status}`, complaintId: complaint.id },
    });
  } catch (error) {
    logger.error(
      { err: error, complaintId: complaint.id },
      "Failed to notify student of anti-ragging status change",
    );
  }
}

export class AntiRaggingService {
  static async create(
    studentId: string,
    collegeId: string,
    data: CreateComplaintInput,
  ) {
    return AntiRaggingRepository.create(studentId, collegeId, data, [
      historyEntry("submitted", null),
    ]);
  }

  private static async loadForCollege(id: string, collegeId: string) {
    const complaint = await AntiRaggingRepository.findById(id);
    if (!complaint) throw new NotFoundError("Complaint not found");
    if (complaint.collegeId !== collegeId) {
      throw new NotFoundError("Complaint not found");
    }
    return complaint;
  }

  static async acknowledge(id: string, collegeId: string, staffId: string) {
    const complaint = await this.loadForCollege(id, collegeId);
    if (complaint.status !== "submitted") {
      throw new ConflictError(
        `Cannot acknowledge a complaint with status '${complaint.status}'`,
      );
    }
    const updated = await AntiRaggingRepository.updateStatus(
      id,
      "acknowledged",
      staffId,
      appendHistory(
        complaint.statusHistory,
        historyEntry("acknowledged", staffId),
      ),
    );
    await notifyStudentOfStatusChange(updated, "acknowledged");
    return updated;
  }

  static async startInvestigation(
    id: string,
    collegeId: string,
    staffId: string,
  ) {
    const complaint = await this.loadForCollege(id, collegeId);
    if (complaint.status !== "acknowledged") {
      throw new ConflictError(
        `Cannot start investigation on a complaint with status '${complaint.status}'`,
      );
    }
    const updated = await AntiRaggingRepository.updateStatus(
      id,
      "investigating",
      staffId,
      appendHistory(
        complaint.statusHistory,
        historyEntry("investigating", staffId),
      ),
    );
    await notifyStudentOfStatusChange(updated, "investigating");
    return updated;
  }

  static async resolve(
    id: string,
    collegeId: string,
    staffId: string,
    data: ResolveComplaintInput,
  ) {
    const complaint = await this.loadForCollege(id, collegeId);
    if (complaint.status !== "investigating") {
      throw new ConflictError(
        `Cannot resolve a complaint with status '${complaint.status}'`,
      );
    }
    const updated = await AntiRaggingRepository.resolve(
      id,
      staffId,
      data.resolution,
      appendHistory(complaint.statusHistory, historyEntry("resolved", staffId)),
    );
    await notifyStudentOfStatusChange(updated, "resolved");
    return updated;
  }
}
