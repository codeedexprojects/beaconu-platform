import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { getRedisClient } from "@/shared/lib/redis";
import { BlinkService } from "@/modules/blink/services/blink.service";
import { PushService } from "@/modules/notifications/services/push.service";
import { CampusVisitsRepository } from "../repositories/campus-visits.repository";
import { CampusVisitAvailabilityRepository } from "../repositories/campus-visit-availability.repository";
import { CampusVisitSettingsRepository } from "../repositories/campus-visit-settings.repository";
import { CampusVisitDateOverrideRepository } from "../repositories/campus-visit-date-override.repository";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import type {
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
  CancelCampusVisitInput,
  ReassignCampusVisitInput,
} from "../validators/campus-visits.validator";

const RESCHEDULABLE_STATUSES = ["pending", "confirmed"];
const CANCELLABLE_STATUSES = ["pending", "confirmed", "arrived"];
const MIN_ADVANCE_HOURS = 2;
const REBROADCAST_AFTER_MS = 5 * 60 * 1000;

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

/** Resolves the visit time + that weekday's capacity once the date passes
 * every blocking check — recurring weekday off-days AND one-off date
 * holidays. The visit time itself is the college's single shared
 * CampusVisitSettings.visitStartTime, not per-weekday anymore — the
 * start/end pair is purely descriptive "working hours" shown to
 * students; the booking itself is recorded at the start time since
 * students never pick a time. */
async function assertDateBookable(
  collegeId: string,
  date: string,
): Promise<{ visitTime: Date; maxCapacity: number }> {
  const availability =
    await CampusVisitAvailabilityRepository.findByCollegeAndWeekday(
      collegeId,
      weekdayOf(date),
    );
  if (!availability || availability.isOff) {
    throw new ConflictError(
      "Selected date is not available for campus visits. Please choose a different date.",
    );
  }

  const override = await CampusVisitDateOverrideRepository.findByCollegeAndDate(
    collegeId,
    date,
  );
  if (override && override.isActive) {
    throw new ConflictError(
      "This date is marked as a holiday and isn't available for campus visits.",
    );
  }

  const settings = await CampusVisitSettingsRepository.findByCollege(collegeId);
  if (!settings) {
    throw new ConflictError(
      "This college hasn't configured a campus visit time yet.",
    );
  }

  assertMinAdvanceNotice(date, settings.visitStartTime);
  return {
    visitTime: settings.visitStartTime,
    maxCapacity: availability.maxCapacity,
  };
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
async function notifyAmbassadorsOfArrival(visit: {
  id: string;
  collegeId: string;
  studentName: string;
  proposedDate: Date;
  proposedTime: Date;
}): Promise<void> {
  try {
    const ambassadors = await CampusVisitsQuery.listAmbassadorsForCollege(
      visit.collegeId,
    );
    if (ambassadors.length === 0) return;

    await PushService.sendToUsers(
      ambassadors.map((a) => ({ userId: a.id, userType: "blink_ambassador" })),
      {
        title: "Student arrived for campus visit",
        body: `${visit.studentName} has arrived for their visit at ${formatTime12h(visit.proposedTime)}. First to accept gets it.`,
        data: { type: "campus_visit_arrived", visitId: visit.id },
      },
    );
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify ambassadors of campus visit arrival",
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

/** The one place in this codebase where an admin-typed free-text message
 * is sent verbatim as the push body — college-admin composes `message`
 * themselves (why they're cancelling), no fixed template. */
async function notifyStudentOfAdminCancellation(
  visit: { id: string; studentId: string },
  message: string,
): Promise<void> {
  try {
    await PushService.sendToUser(visit.studentId, "student", {
      title: "Your campus visit was cancelled",
      body: message,
      data: { type: "campus_visit_admin_cancelled", visitId: visit.id },
    });
  } catch (error) {
    logger.error(
      { err: error, visitId: visit.id },
      "Failed to notify student of admin campus visit cancellation",
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
        { ...data, studentId, proposedTime: availability.visitTime },
        tx,
      );
    });

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
        availability.visitTime,
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

  static async arrive(visitId: string, studentId: string) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.studentId !== studentId)
      throw new ForbiddenError("Not your visit");
    if (visit.status !== "pending") {
      throw new ForbiddenError(
        `Cannot mark arrival for a visit with status '${visit.status}'`,
      );
    }
    if (formatDateStr(new Date()) !== formatDateStr(visit.proposedDate)) {
      throw new ConflictError(
        "You can only mark arrival on the day of your visit",
      );
    }

    const { count } = await CampusVisitsRepository.markArrived(
      visitId,
      new Date(),
    );
    if (count === 0) {
      throw new ConflictError(
        `Cannot mark arrival for a visit with status '${visit.status}'`,
      );
    }

    const arrived = await CampusVisitsRepository.findById(visitId);
    await notifyAmbassadorsOfArrival(arrived!);
    return arrived;
  }

  static async accept(visitId: string, ambassadorId: string) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.status !== "arrived") {
      throw new ForbiddenError(
        `Cannot accept a visit with status '${visit.status}'`,
      );
    }

    await BlinkService.assertAmbassadorInCollege(ambassadorId, visit.collegeId);

    const { count } = await CampusVisitsRepository.claimByAmbassador(
      visitId,
      ambassadorId,
    );
    if (count === 0) {
      throw new ConflictError(
        "This visit has already been accepted by another ambassador",
      );
    }

    const confirmed = await CampusVisitsRepository.findById(visitId);
    await notifyStudentOfAcceptance(confirmed!);
    return confirmed;
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
      reassigned: byStatus.reassigned ?? 0,
    };
  }

  static async sendUpcomingVisitReminders(): Promise<number> {
    const redis = getRedisClient();
    const now = new Date();

    const visits = await CampusVisitsRepository.findUpcomingActiveVisits(now);

    const TOLERANCE_MS = 5 * 60 * 1000; // +/- 5 minutes, matched to the job's polling cadence
    const REMINDER_TIERS = [
      { key: "24h", targetMs: 24 * 60 * 60 * 1000, label: "24 hours" },
      { key: "1h", targetMs: 60 * 60 * 1000, label: "1 hour" },
    ] as const;

    let count = 0;

    for (const visit of visits) {
      const visitInstantMs = Date.UTC(
        visit.proposedDate.getUTCFullYear(),
        visit.proposedDate.getUTCMonth(),
        visit.proposedDate.getUTCDate(),
        visit.proposedTime.getUTCHours(),
        visit.proposedTime.getUTCMinutes(),
      );
      const msUntilVisit = visitInstantMs - now.getTime();

      for (const tier of REMINDER_TIERS) {
        if (Math.abs(msUntilVisit - tier.targetMs) > TOLERANCE_MS) continue;

        const redisKey = `campus-visit:reminder-${tier.key}-sent:${visit.id}`;
        const alreadySent = await redis.get(redisKey);
        if (alreadySent) continue;

        // Mark before sending — best effort, prevents double-fire even if push throws
        await redis.set(redisKey, "1", "EX", 48 * 60 * 60);

        const dateStr = formatDateStr(visit.proposedDate);
        const timeStr = formatTime12h(visit.proposedTime);

        const notifications = [
          PushService.sendToUser(visit.studentId, "student", {
            title: "Campus visit starting soon",
            body: `Your campus visit is in about ${tier.label}, at ${timeStr} on ${dateStr}`,
            data: {
              type: "campus_visit_reminder",
              visitId: visit.id,
              tier: tier.key,
            },
          }),
        ];
        if (visit.ambassadorId) {
          notifications.push(
            PushService.sendToUser(visit.ambassadorId, "blink_ambassador", {
              title: "Campus visit starting soon",
              body: `${visit.studentName}'s visit is in about ${tier.label}, at ${timeStr} on ${dateStr}`,
              data: {
                type: "campus_visit_reminder",
                visitId: visit.id,
                tier: tier.key,
              },
            }),
          );
        }

        await Promise.allSettled(notifications);
        count += 1;
      }
    }

    return count;
  }

  static async rebroadcastStaleArrivals(): Promise<number> {
    const redis = getRedisClient();
    const cutoff = new Date(Date.now() - REBROADCAST_AFTER_MS);

    const staleVisits =
      await CampusVisitsRepository.findStaleArrivedVisits(cutoff);

    let count = 0;
    for (const visit of staleVisits) {
      const redisKey = `campus-visit:rebroadcast-sent:${visit.id}`;
      const alreadySent = await redis.get(redisKey);
      if (alreadySent) continue;

      await redis.set(
        redisKey,
        "1",
        "EX",
        Math.floor(REBROADCAST_AFTER_MS / 1000),
      );

      await notifyAmbassadorsOfArrival(visit);
      count += 1;
    }

    return count;
  }

  static async getSettings(collegeId: string) {
    return CampusVisitSettingsRepository.findByCollege(collegeId);
  }

  static async upsertSettings(
    collegeId: string,
    startTime: string,
    endTime: string,
  ) {
    return CampusVisitSettingsRepository.upsert(collegeId, startTime, endTime);
  }

  static async getMonthCalendar(
    collegeId: string,
    year: number,
    month: number,
  ) {
    return CampusVisitsQuery.getMonthCalendar(collegeId, year, month);
  }

  static async addDateOverride(
    collegeId: string,
    staffId: string,
    date: string,
    reason: string | undefined,
  ) {
    return CampusVisitDateOverrideRepository.upsertActive(
      collegeId,
      date,
      reason ?? null,
      staffId,
    );
  }

  static async removeDateOverride(collegeId: string, overrideId: string) {
    const override = await CampusVisitDateOverrideRepository.findByIdForCollege(
      overrideId,
      collegeId,
    );
    if (!override) throw new NotFoundError("Date override not found");
    await CampusVisitDateOverrideRepository.softDeactivate(overrideId);
  }

  /** College-admin cancels one specific booking — the admin's own typed
   * `message` is sent verbatim to the student as the notification. */
  static async cancelByAdmin(
    collegeId: string,
    visitId: string,
    message: string,
  ) {
    const visit = await CampusVisitsRepository.findById(visitId);
    if (!visit || visit.collegeId !== collegeId) {
      throw new NotFoundError("Campus visit not found");
    }
    if (!CANCELLABLE_STATUSES.includes(visit.status)) {
      throw new ForbiddenError(
        `Cannot cancel a visit with status '${visit.status}'`,
      );
    }

    const cancelled = await CampusVisitsRepository.updateStatus(
      visitId,
      "cancelled",
      { cancellationReason: message },
    );
    await notifyStudentOfAdminCancellation(cancelled, message);
    await notifyAmbassadorOfCancellation(cancelled);
    return cancelled;
  }

  /** Same as cancelByAdmin, applied to every active booking on one date —
   * each student gets their own notification with the same message. */
  static async cancelAllForDate(
    collegeId: string,
    date: string,
    message: string,
  ) {
    const visits = await CampusVisitsRepository.findActiveForDate(
      collegeId,
      date,
    );

    let count = 0;
    for (const visit of visits) {
      const cancelled = await CampusVisitsRepository.updateStatus(
        visit.id,
        "cancelled",
        { cancellationReason: message },
      );
      await notifyStudentOfAdminCancellation(cancelled, message);
      await notifyAmbassadorOfCancellation(cancelled);
      count += 1;
    }
    return count;
  }
}
