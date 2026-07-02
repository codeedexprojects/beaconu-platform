import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { BlinkService } from "@/modules/blink/services/blink.service";
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

    return prisma.$transaction(async (tx) => {
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

    return prisma.$transaction(async (tx) => {
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

    return CampusVisitsRepository.updateStatus(visitId, "cancelled", {
      cancellationReason: data.cancellation_reason,
    });
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

    return CampusVisitsRepository.updateStatus(visitId, "confirmed");
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

    return CampusVisitsRepository.updateStatus(visitId, "rejected", {
      rejectionReason: data.rejection_reason,
    });
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

    return CampusVisitsRepository.updateStatus(visitId, "reassigned", {
      reassignmentReason: data.reassignment_reason,
      ambassadorId: data.ambassador_id,
    });
  }
}
