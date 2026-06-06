import { prisma } from "@beaconu/db";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors";
import { SessionRepository } from "../repositories/session.repository";
import {
  AddSlotInput,
  BookSessionInput,
  CancelSessionInput,
  CompleteSessionInput,
  ListAvailableSlotsQueryInput,
  ListSlotsQueryInput,
  RescheduleSessionInput,
  UpdateMeetingInput,
} from "../validators/sessions.validator";

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function parseTimeOnly(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

function ensureStartBeforeEnd(start: Date, end: Date): void {
  if (start >= end) {
    throw new BadRequestError("start_time must be before end_time");
  }
}

function ensureOwnsSession(
  session: { studentId: string; counsellorId: string },
  actor: { userType: "student" | "counsellor"; userId: string },
): void {
  if (actor.userType === "student" && session.studentId !== actor.userId) {
    throw new ForbiddenError("You can only access your own sessions");
  }

  if (
    actor.userType === "counsellor" &&
    session.counsellorId !== actor.userId
  ) {
    throw new ForbiddenError("You can only access your own sessions");
  }
}

export class SessionService {
  static async addSlot(counsellorId: string, input: AddSlotInput) {
    const startTime = parseTimeOnly(input.start_time);
    const endTime = parseTimeOnly(input.end_time);
    ensureStartBeforeEnd(startTime, endTime);

    try {
      return await SessionRepository.createSlot({
        counsellorId,
        availableDate: parseDateOnly(input.available_date),
        startTime,
        endTime,
        sessionDurationMins: input.session_duration_mins,
      });
    } catch (error) {
      const prismaCode =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: string }).code)
          : undefined;

      if (prismaCode === "P2002") {
        throw new ConflictError(
          "A slot with this date and time already exists",
        );
      }
      throw error;
    }
  }

  static async listMySlots(counsellorId: string, query: ListSlotsQueryInput) {
    const fromDate = query.from_date
      ? parseDateOnly(query.from_date)
      : undefined;

    return SessionRepository.listSlotsByCounsellor(counsellorId, fromDate, {
      page: query.page,
      limit: query.limit,
    });
  }

  static async listAvailableSlots(query: ListAvailableSlotsQueryInput) {
    const fromDate = query.from_date
      ? parseDateOnly(query.from_date)
      : undefined;
    const toDate = query.to_date ? parseDateOnly(query.to_date) : undefined;

    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestError("from_date cannot be after to_date");
    }

    return SessionRepository.listAvailableSlots(
      {
        counsellorId: query.counsellor_id,
        fromDate,
        toDate,
      },
      {
        page: query.page,
        limit: query.limit,
      },
    );
  }

  static async bookSession(studentId: string, input: BookSessionInput) {
    return prisma.$transaction(async (tx) => {
      const slot = await tx.counsellorAvailability.findUnique({
        where: { id: input.availability_id },
      });

      if (!slot) {
        throw new NotFoundError("Availability slot not found");
      }

      if (slot.isBooked) {
        throw new ConflictError("This slot is already booked");
      }

      const session = await tx.counsellingSession.create({
        data: {
          studentId,
          counsellorId: slot.counsellorId,
          availabilityId: slot.id,
          sessionMode: input.session_mode,
          sessionType: input.session_type,
          scheduledDate: slot.availableDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          bookingReason: input.booking_reason,
          sessionFee: input.session_fee,
        },
      });

      await tx.counsellorAvailability.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      return session;
    });
  }

  static async listStudentSessions(
    studentId: string,
    query: ListSlotsQueryInput,
  ) {
    return SessionRepository.listSessionsByStudent(studentId, {
      page: query.page,
      limit: query.limit,
    });
  }

  static async listCounsellorSessions(
    counsellorId: string,
    query: ListSlotsQueryInput,
  ) {
    return SessionRepository.listSessionsByCounsellor(counsellorId, {
      page: query.page,
      limit: query.limit,
    });
  }

  static async getSessionForActor(
    sessionId: string,
    actor: { userType: "student" | "counsellor"; userId: string },
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session not found");
    }

    ensureOwnsSession(session, actor);
    return session;
  }

  static async cancelSession(
    sessionId: string,
    actor: { userType: "student" | "counsellor"; userId: string },
    input: CancelSessionInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session not found");
    }

    ensureOwnsSession(session, actor);

    if (session.status === "cancelled") {
      throw new BadRequestError("Session is already cancelled");
    }

    if (session.status === "completed") {
      throw new BadRequestError("Completed sessions cannot be cancelled");
    }

    await prisma.$transaction(async (tx) => {
      await tx.counsellingSession.update({
        where: { id: sessionId },
        data: {
          status: "cancelled",
          cancelledBy: actor.userType,
          cancellationReason: input.cancellation_reason,
          cancelledAt: new Date(),
        },
      });

      await tx.counsellorAvailability.update({
        where: { id: session.availabilityId },
        data: { isBooked: false },
      });
    });

    return SessionRepository.findSessionById(sessionId);
  }

  static async rescheduleSession(
    studentId: string,
    sessionId: string,
    input: RescheduleSessionInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.studentId !== studentId) {
      throw new ForbiddenError("You can only reschedule your own sessions");
    }

    if (session.status === "completed") {
      throw new BadRequestError("Completed sessions cannot be rescheduled");
    }

    if (session.status === "cancelled") {
      throw new BadRequestError("Cancelled sessions cannot be rescheduled");
    }

    await prisma.$transaction(async (tx) => {
      const newSlot = await tx.counsellorAvailability.findUnique({
        where: { id: input.new_availability_id },
      });

      if (!newSlot) {
        throw new NotFoundError("New availability slot not found");
      }

      if (newSlot.counsellorId !== session.counsellorId) {
        throw new ConflictError(
          "Reschedule slot must belong to the same counsellor",
        );
      }

      if (newSlot.isBooked) {
        throw new ConflictError("Selected slot is already booked");
      }

      await tx.counsellorAvailability.update({
        where: { id: session.availabilityId },
        data: { isBooked: false },
      });

      await tx.counsellorAvailability.update({
        where: { id: newSlot.id },
        data: { isBooked: true },
      });

      await tx.counsellingSession.update({
        where: { id: sessionId },
        data: {
          availabilityId: newSlot.id,
          scheduledDate: newSlot.availableDate,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        },
      });

      await tx.sessionReschedule.create({
        data: {
          sessionId,
          rescheduledBy: "student",
          fromDate: session.scheduledDate,
          fromTime: session.startTime,
          toAvailabilityId: newSlot.id,
          toDate: newSlot.availableDate,
          toTime: newSlot.startTime,
          reason: input.reason,
        },
      });
    });

    return SessionRepository.findSessionById(sessionId);
  }

  static async updateMeeting(
    counsellorId: string,
    sessionId: string,
    input: UpdateMeetingInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.counsellorId !== counsellorId) {
      throw new ForbiddenError("You can only update your own sessions");
    }

    if (session.status === "cancelled") {
      throw new BadRequestError(
        "Cannot set meeting details for cancelled session",
      );
    }

    await SessionRepository.updateSession(sessionId, {
      ...(input.meeting_url !== undefined
        ? { meetingUrl: input.meeting_url }
        : {}),
      ...(input.meeting_id !== undefined
        ? { meetingId: input.meeting_id }
        : {}),
    });

    return SessionRepository.findSessionById(sessionId);
  }

  static async completeSession(
    counsellorId: string,
    sessionId: string,
    input: CompleteSessionInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.counsellorId !== counsellorId) {
      throw new ForbiddenError("You can only complete your own sessions");
    }

    if (session.status === "completed") {
      throw new BadRequestError("Session is already completed");
    }

    if (session.status === "cancelled") {
      throw new BadRequestError("Cancelled sessions cannot be completed");
    }

    await SessionRepository.updateSession(sessionId, {
      status: "completed",
      completedAt: new Date(),
      ...(input.session_notes !== undefined
        ? { sessionNotes: input.session_notes }
        : {}),
    });

    if (session.paymentStatus === "paid" && session.sessionFee) {
      await SessionRepository.findOrCreateWallet(counsellorId);
      await SessionRepository.creditWallet(
        counsellorId,
        Number(session.sessionFee),
        sessionId,
        "Session completion payout",
      );
    }

    return SessionRepository.findSessionById(sessionId);
  }

  static async getWallet(counsellorId: string) {
    await SessionRepository.findOrCreateWallet(counsellorId);
    return SessionRepository.getWallet(counsellorId);
  }
}
