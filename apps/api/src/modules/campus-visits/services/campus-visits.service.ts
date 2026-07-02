import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { getRedisClient } from "@/shared/lib/redis";
import { BlinkService } from "@/modules/blink/services/blink.service";
import { PushService } from "@/modules/notifications/services/push.service";
import { CampusVisitsRepository } from "../repositories/campus-visits.repository";
import { CampusVisitAvailabilityRepository } from "../repositories/campus-visit-availability.repository";
import type {
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
  CancelCampusVisitInput,
  RejectCampusVisitInput,
  ReassignCampusVisitInput,
} from "../validators/campus-visits.validator";

const RESCHEDULABLE_STATUSES = ["pending", "confirmed"];
const CANCELLABLE_STATUSES = ["pending", "confirmed"];
const MIN_ADVANCE_HOURS = 2;

function weekdayOf(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

function formatDateStr(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function formatTime12h(value: Date): string {
  const h = value.getUTCHours();
  const m = value.getUTCMinutes();
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  const minute = m.toString().padStart(2, "0");
  return `${hour}:${minute} ${period}`;
}

function assertMinAdvanceNotice(dateStr: string, time: Date) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const visitUtcMs = Date.UTC(
    y!,
    m! - 1,
    d!,
    time.getUTCHours(),
    time.getUTCMinutes(),
  );
  const minAllowedMs = Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000;
  if (visitUtcMs < minAllowedMs) {
    throw new ConflictError(
      `Visits must be booked at least ${MIN_ADVANCE_HOURS} hours in advance`,
    );
  }
}

async function assertDateBookable(collegeId: string, date: string) {
  const availability =
    await CampusVisitAvailabilityRepository.findByCollegeAndWeekday(
      collegeId,
      weekdayOf(date),
    );
  if (!availability || availability.isOff || !availability.time) {
    throw new ConflictError(
      "Selected date is not available for campus visits. Please choose a different date.",
    );
  }
  assertMinAdvanceNotice(date, availability.time);
  return availability;
}

function mapBookingResponse(visit: {
  id: string;
  ambassador: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    campusCode: string | null;
  } | null;
  college: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    pinCode: string | null;
  };
}) {
  return {
    id: visit.id,
    ambassador: visit.ambassador
      ? {
          id: visit.ambassador.id,
          fullName: visit.ambassador.fullName,
          phoneNumber: visit.ambassador.phoneNumber,
          avatarUrl: visit.ambassador.avatarUrl,
          campusCode: visit.ambassador.campusCode,
        }
      : null,
    college: {
      id: visit.college.id,
      name: visit.college.name,
      address: visit.college.address,
      city: visit.college.city,
      district: visit.college.district,
      state: visit.college.state,
      pinCode: visit.college.pinCode,
    },
  };
}

/** Best-effort push notifications for the campus-visit lifecycle — never throw. */
async function notifyAmbassadorOfBooking(visit: {
  id: string;
  ambassadorId: string | null;
  studentName: string;
  proposedDate: Date;
  proposedTime: Date;
}): Promise<void> {
  if (!visit.ambassadorId) return;
  try {
    await PushService.sendToUser(visit.ambassadorId, "blink_ambassador", {
      title: "New campus visit booked",
      body: `${visit.studentName} booked a visit on ${formatDateStr(visit.proposedDate)} at ${formatTime12h(visit.proposedTime)}`,
      data: { type: "campus_visit_booked", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify ambassador of new campus visit booking",
    );
  }
}

async function notifyStudentOfAcceptance(visit: {
  id: string;
  studentId: string;
  proposedDate: Date;
  proposedTime: Date;
}): Promise<void> {
  try {
    await PushService.sendToUser(visit.studentId, "student", {
      title: "Campus visit confirmed",
      body: `Your campus visit on ${formatDateStr(visit.proposedDate)} at ${formatTime12h(visit.proposedTime)} has been confirmed`,
      data: { type: "campus_visit_confirmed", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify student of campus visit confirmation",
    );
  }
}

async function notifyStudentOfRejection(
  visit: { id: string; studentId: string },
  reason: string,
): Promise<void> {
  try {
    await PushService.sendToUser(visit.studentId, "student", {
      title: "Campus visit declined",
      body: `Your campus visit request was declined: ${reason}`,
      data: { type: "campus_visit_rejected", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify student of campus visit rejection",
    );
  }
}

async function notifyAmbassadorOfReassignment(visit: {
  id: string;
  studentName: string;
  proposedDate: Date;
  proposedTime: Date;
  newAmbassadorId: string;
}): Promise<void> {
  try {
    await PushService.sendToUser(visit.newAmbassadorId, "blink_ambassador", {
      title: "Campus visit assigned to you",
      body: `${visit.studentName}'s visit on ${formatDateStr(visit.proposedDate)} at ${formatTime12h(visit.proposedTime)} has been reassigned to you`,
      data: { type: "campus_visit_reassigned", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify ambassador of campus visit reassignment",
    );
  }
}

async function notifyAmbassadorOfReschedule(visit: {
  id: string;
  ambassadorId: string | null;
  studentName: string;
  proposedDate: Date;
  proposedTime: Date;
}): Promise<void> {
  if (!visit.ambassadorId) return;
  try {
    await PushService.sendToUser(visit.ambassadorId, "blink_ambassador", {
      title: "Campus visit rescheduled",
      body: `${visit.studentName}'s visit was moved to ${formatDateStr(visit.proposedDate)} at ${formatTime12h(visit.proposedTime)}`,
      data: { type: "campus_visit_rescheduled", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify ambassador of campus visit reschedule",
    );
  }
}

async function notifyAmbassadorOfCancellation(visit: {
  id: string;
  ambassadorId: string | null;
  studentName: string;
  proposedDate: Date;
  proposedTime: Date;
}): Promise<void> {
  if (!visit.ambassadorId) return;
  try {
    await PushService.sendToUser(visit.ambassadorId, "blink_ambassador", {
      title: "Campus visit cancelled",
      body: `${visit.studentName} cancelled their visit scheduled for ${formatDateStr(visit.proposedDate)} at ${formatTime12h(visit.proposedTime)}`,
      data: { type: "campus_visit_cancelled", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify ambassador of campus visit cancellation",
    );
  }
}

export class CampusVisitsService {
  static async book(data: CreateCampusVisitInput, studentId: string) {
    const existing = await CampusVisitsRepository.findActiveVisitOnDate(
      studentId,
      data.proposed_date,
    );
    if (existing) {
      throw new ConflictError(
        "You already have a visit scheduled on this date. Please choose a different date.",
      );
    }

    if (data.ambassador_id) {
      await BlinkService.assertAmbassadorInCollege(
        data.ambassador_id,
        data.college_id,
      );
    }

    const availability = await assertDateBookable(
      data.college_id,
      data.proposed_date,
    );

    const visit = await prisma.$transaction(async (tx) => {
      await CampusVisitAvailabilityRepository.lockDateForBooking(
        data.college_id,
        data.proposed_date,
        tx,
      );
      const bookedCount =
        await CampusVisitAvailabilityRepository.countActiveBookingsForDate(
          data.college_id,
          data.proposed_date,
          tx,
        );
      if (bookedCount >= availability.maxCapacity) {
        throw new ConflictError(
          "This date is fully booked. Please choose a different date.",
        );
      }

      return CampusVisitsRepository.create(
        { ...data, studentId, proposedTime: availability.time! },
        tx,
      );
    });

    await notifyAmbassadorOfBooking(visit);
    return mapBookingResponse(visit);
  }

  static async reschedule(
    visitId: string,
    studentId: string,
    data: RescheduleCampusVisitInput,
  ) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.studentId !== studentId)
      throw new ForbiddenError("Not your visit");
    if (!RESCHEDULABLE_STATUSES.includes(visit.status)) {
      throw new ForbiddenError(
        `Cannot reschedule a visit with status '${visit.status}'`,
      );
    }

    const conflicting = await CampusVisitsRepository.findActiveVisitOnDate(
      visit.studentId,
      data.proposed_date,
      visitId,
    );
    if (conflicting) {
      throw new ConflictError(
        "You already have another visit scheduled on that date. Please choose a different date.",
      );
    }

    const availability = await assertDateBookable(
      visit.collegeId,
      data.proposed_date,
    );

    const rescheduled = await prisma.$transaction(async (tx) => {
      await CampusVisitAvailabilityRepository.lockDateForBooking(
        visit.collegeId,
        data.proposed_date,
        tx,
      );
      const bookedCount =
        await CampusVisitAvailabilityRepository.countActiveBookingsForDate(
          visit.collegeId,
          data.proposed_date,
          tx,
        );
      if (bookedCount >= availability.maxCapacity) {
        throw new ConflictError(
          "This date is fully booked. Please choose a different date.",
        );
      }

      return CampusVisitsRepository.reschedule(
        visitId,
        new Date(data.proposed_date),
        availability.time!,
        visit.proposedDate,
        visit.proposedTime,
        tx,
      );
    });

    await notifyAmbassadorOfReschedule(rescheduled);
    return rescheduled;
  }

  static async cancel(
    visitId: string,
    studentId: string,
    data: CancelCampusVisitInput,
  ) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.studentId !== studentId)
      throw new ForbiddenError("Not your visit");
    if (!CANCELLABLE_STATUSES.includes(visit.status)) {
      throw new ForbiddenError(
        `Cannot cancel a visit with status '${visit.status}'`,
      );
    }

    const cancelled = await CampusVisitsRepository.updateStatus(
      visitId,
      "cancelled",
      { cancellationReason: data.cancellation_reason },
    );
    await notifyAmbassadorOfCancellation(cancelled);
    return cancelled;
  }

  static async accept(visitId: string, ambassadorId: string) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.ambassadorId !== ambassadorId)
      throw new ForbiddenError("This visit is not assigned to you");
    if (visit.status !== "pending") {
      throw new ForbiddenError(
        `Cannot accept a visit with status '${visit.status}'`,
      );
    }

    const confirmed = await CampusVisitsRepository.updateStatus(
      visitId,
      "confirmed",
    );
    await notifyStudentOfAcceptance(confirmed);
    return confirmed;
  }

  static async reject(
    visitId: string,
    ambassadorId: string,
    data: RejectCampusVisitInput,
  ) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.ambassadorId !== ambassadorId)
      throw new ForbiddenError("This visit is not assigned to you");
    if (visit.status !== "pending") {
      throw new ForbiddenError(
        `Cannot reject a visit with status '${visit.status}'`,
      );
    }

    const rejected = await CampusVisitsRepository.updateStatus(
      visitId,
      "rejected",
      { rejectionReason: data.rejection_reason },
    );
    await notifyStudentOfRejection(rejected, data.rejection_reason);
    return rejected;
  }

  static async reassign(
    visitId: string,
    ambassadorId: string,
    data: ReassignCampusVisitInput,
  ) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.ambassadorId !== ambassadorId)
      throw new ForbiddenError("This visit is not assigned to you");
    if (visit.status !== "confirmed") {
      throw new ForbiddenError("Can only reassign confirmed visits");
    }
    if (data.ambassador_id === ambassadorId) {
      throw new ForbiddenError("Cannot reassign to yourself");
    }

    await BlinkService.assertAmbassadorInCollege(
      data.ambassador_id,
      visit.collegeId,
    );

    const reassigned = await CampusVisitsRepository.updateStatus(
      visitId,
      "reassigned",
      {
        reassignmentReason: data.reassignment_reason,
        ambassadorId: data.ambassador_id,
      },
    );
    await notifyAmbassadorOfReassignment({
      ...reassigned,
      newAmbassadorId: data.ambassador_id,
    });
    return reassigned;
  }

  static async getAmbassadorVisitStats(ambassadorId: string) {
    const rows = await CampusVisitsRepository.countByAmbassador(ambassadorId);
    const byStatus = Object.fromEntries(
      rows.map((row) => [row.status, row._count._all]),
    );

    return {
      total: rows.reduce((sum, row) => sum + row._count._all, 0),
      pending: byStatus.pending ?? 0,
      confirmed: byStatus.confirmed ?? 0,
      completed: byStatus.completed ?? 0,
      cancelled: byStatus.cancelled ?? 0,
      rejected: byStatus.rejected ?? 0,
      reassigned: byStatus.reassigned ?? 0,
    };
  }

  static async sendUpcomingVisitReminders(): Promise<number> {
    const redis = getRedisClient();
    const now = new Date();

    const visits = await CampusVisitsRepository.findUpcomingActiveVisits(now);

    let count = 0;
    const REMINDER_TARGET_MS = 60 * 60 * 1000; // 1 hour
    const TOLERANCE_MS = 5 * 60 * 1000; // +/- 5 minutes, matched to the job's polling cadence

    for (const visit of visits) {
      const visitInstantMs = Date.UTC(
        visit.proposedDate.getUTCFullYear(),
        visit.proposedDate.getUTCMonth(),
        visit.proposedDate.getUTCDate(),
        visit.proposedTime.getUTCHours(),
        visit.proposedTime.getUTCMinutes(),
      );
      const msUntilVisit = visitInstantMs - now.getTime();

      if (Math.abs(msUntilVisit - REMINDER_TARGET_MS) > TOLERANCE_MS) continue;

      const redisKey = `campus-visit:reminder-sent:${visit.id}`;
      const alreadySent = await redis.get(redisKey);
      if (alreadySent) continue;

      // Mark before sending — best effort, prevents double-fire even if push throws
      await redis.set(redisKey, "1", "EX", 24 * 60 * 60);

      const dateStr = formatDateStr(visit.proposedDate);
      const timeStr = formatTime12h(visit.proposedTime);

      const notifications = [
        PushService.sendToUser(visit.studentId, "student", {
          title: "Campus visit starting soon",
          body: `Your campus visit is in about 1 hour, at ${timeStr} on ${dateStr}`,
          data: { type: "campus_visit_reminder", visitId: visit.id },
        }),
      ];
      if (visit.ambassadorId) {
        notifications.push(
          PushService.sendToUser(visit.ambassadorId, "blink_ambassador", {
            title: "Campus visit starting soon",
            body: `${visit.studentName}'s visit is in about 1 hour, at ${timeStr} on ${dateStr}`,
            data: { type: "campus_visit_reminder", visitId: visit.id },
          }),
        );
      }

      await Promise.allSettled(notifications);
      count += 1;
    }

    return count;
  }
}
