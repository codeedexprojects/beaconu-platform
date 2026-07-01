import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { CampusVisitsRepository } from "../repositories/campus-visits.repository";
import type {
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
  CancelCampusVisitInput,
  RejectCampusVisitInput,
  ReassignCampusVisitInput,
} from "../validators/campus-visits.validator";

const RESCHEDULABLE_STATUSES = ["pending", "confirmed"];
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export class CampusVisitsService {
  static async book(data: CreateCampusVisitInput, studentId: string) {
    return CampusVisitsRepository.create({ ...data, studentId });
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

    const newDate = new Date(data.proposed_date);
    const newTime = new Date(`1970-01-01T${data.proposed_time}:00Z`);

    return CampusVisitsRepository.reschedule(
      visitId,
      newDate,
      newTime,
      visit.proposedDate,
      visit.proposedTime,
    );
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

    return CampusVisitsRepository.updateStatus(visitId, "reassigned", {
      reassignmentReason: data.reassignment_reason,
      ambassadorId: data.ambassador_id,
    });
  }
}
