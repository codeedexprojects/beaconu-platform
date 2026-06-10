import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors";
import { getRazorpay, isRazorpayReady } from "@/shared/lib/razorpay";
import { getRedisClient } from "@/shared/lib/redis";
import { SessionRepository } from "../repositories/session.repository";
import { CounsellingRepository } from "../repositories/counselling.repository";
import {
  AddSlotInput,
  BookSessionInput,
  CancelSessionInput,
  CompleteSessionInput,
  CreatePaymentOrderInput,
  ListAvailableSlotsQueryInput,
  ListCounsellorsQueryInput,
  ListSessionsQueryInput,
  ListSlotsQueryInput,
  RescheduleSessionInput,
  UpdateMeetingInput,
  RateSessionInput,
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

function formatCounsellor(counsellor: any) {
  if (!counsellor) return counsellor;
  return {
    id: counsellor.id,
    counsellor_code: counsellor.counsellorCode ?? null,
    full_name: counsellor.fullName,
    avatar_url: counsellor.avatarUrl ?? null,
    counsellor_type: counsellor.counsellorType,
    phone_number: counsellor.phoneNumber,
    email: counsellor.email,
    status: counsellor.status,
    rating: Number(counsellor.rating ?? 0.0),
    known_languages: counsellor.knownLanguages,
    session_fee: Number(counsellor.sessionFee ?? 0.0),
    profile_metadata: counsellor.profileMetadata,
    last_login_at: counsellor.lastLoginAt,
    created_at: counsellor.createdAt,
    updated_at: counsellor.updatedAt,
  };
}

function formatStudent(student: any) {
  if (!student) return student;
  return {
    id: student.id,
    full_name: student.fullName,
    avatar_url: student.avatarUrl ?? null,
    email: student.email,
  };
}

function formatAvailability(availability: any) {
  if (!availability) return availability;
  return {
    id: availability.id,
    counsellor_id: availability.counsellorId,
    available_date: availability.availableDate,
    start_time: availability.startTime,
    end_time: availability.endTime,
    session_duration_mins: availability.sessionDurationMins,
    is_booked: availability.isBooked,
    session_fee: Number(availability.sessionFee ?? 0),
    created_at: availability.createdAt,
    updated_at: availability.updatedAt,
  };
}

function formatReschedule(reschedule: any) {
  if (!reschedule) return reschedule;
  return {
    id: reschedule.id,
    session_id: reschedule.sessionId,
    rescheduled_by: reschedule.rescheduledBy,
    from_date: reschedule.fromDate,
    from_time: reschedule.fromTime,
    to_availability_id: reschedule.toAvailabilityId,
    to_date: reschedule.toDate,
    to_time: reschedule.toTime,
    reason: reschedule.reason,
    created_at: reschedule.createdAt,
  };
}

function formatWallet(wallet: any) {
  if (!wallet) return wallet;
  return {
    id: wallet.id,
    counsellor_id: wallet.counsellorId,
    balance: Number(wallet.balance ?? 0),
    total_earned: Number(wallet.totalEarned ?? 0),
    total_withdrawn: Number(wallet.totalWithdrawn ?? 0),
    created_at: wallet.createdAt,
    updated_at: wallet.updatedAt,
    transactions: Array.isArray(wallet.transactions)
      ? wallet.transactions.map((txn: any) => ({
          id: txn.id,
          wallet_id: txn.walletId,
          counsellor_id: txn.counsellorId,
          type: txn.type,
          amount: Number(txn.amount ?? 0),
          description: txn.description,
          session_id: txn.sessionId,
          withdrawal_status: txn.withdrawalStatus,
          bank_details: txn.bankDetails,
          balance_after: Number(txn.balanceAfter ?? 0),
          created_at: txn.createdAt,
        }))
      : undefined,
  };
}

function formatSession(session: any) {
  if (!session) return session;
  return {
    id: session.id,
    status: session.status,
    session_mode: session.sessionMode,
    session_type: session.sessionType,
    scheduled_date: session.scheduledDate,
    start_time: session.startTime,
    end_time: session.endTime,
    booking_reason: session.bookingReason,
    session_fee: session.sessionFee ? Number(session.sessionFee) : null,
    payment_status: session.paymentStatus,
    transaction_id: session.transactionId,
    cancelled_by: session.cancelledBy,
    cancellation_reason: session.cancellationReason,
    cancelled_at: session.cancelledAt,
    completed_at: session.completedAt,
    session_notes: session.sessionNotes,
    rating: session.rating,
    rating_feedback: session.ratingFeedback,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
    student: formatStudent(session.student),
    availability: formatAvailability(session.availability),
    reschedules: Array.isArray(session.reschedules)
      ? session.reschedules.map(formatReschedule)
      : undefined,
    counsellor: session.counsellor
      ? formatCounsellor(session.counsellor)
      : undefined,
  };
}

function formatSlot(slot: any) {
  if (!slot) return slot;
  const fee =
    slot.sessionFee ?? slot.session_fee ?? slot.counsellor?.sessionFee ?? 0;
  return {
    id: slot.id,
    available_date: slot.availableDate,
    start_time: slot.startTime,
    end_time: slot.endTime,
    session_duration_mins: slot.sessionDurationMins,
    is_booked: slot.isBooked,
    session_fee: Number(fee),
    counsellor: slot.counsellor ? formatCounsellor(slot.counsellor) : undefined,
  };
}

function groupSlotsByDate(formattedSlots: any[]) {
  const map = new Map<string, any[]>();
  for (const slot of formattedSlots) {
    const dateObj =
      slot.available_date instanceof Date
        ? slot.available_date
        : new Date(slot.available_date);
    const dateKey = dateObj.toISOString().slice(0, 10);

    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push({
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      session_duration_mins: slot.session_duration_mins,
      session_fee: slot.session_fee,
      is_booked: slot.is_booked,
    });
  }

  return Array.from(map.entries()).map(([date, time_slots]) => ({
    date,
    counsellor: formattedSlots.find(
      (s) =>
        (s.available_date instanceof Date
          ? s.available_date
          : new Date(s.available_date)
        )
          .toISOString()
          .slice(0, 10) === date,
    )?.counsellor,
    time_slots,
  }));
}

export class SessionService {
  static async addSlot(counsellorId: string, input: AddSlotInput) {
    const counsellor = await CounsellingRepository.findById(counsellorId);

    const finalFee =
      input.session_fee !== undefined
        ? input.session_fee
        : Number(counsellor?.sessionFee ?? 0.0);

    const dates: string[] = [];
    if (input.available_dates && input.available_dates.length > 0) {
      dates.push(...input.available_dates);
    } else if (input.available_date) {
      dates.push(input.available_date);
    }

    const times: Array<{ start_time: string; end_time: string }> = [];
    if (input.time_slots && input.time_slots.length > 0) {
      times.push(...input.time_slots);
    } else if (input.start_time && input.end_time) {
      times.push({ start_time: input.start_time, end_time: input.end_time });
    }

    if (dates.length === 0) {
      throw new BadRequestError(
        "available_date or available_dates is required",
      );
    }
    if (times.length === 0) {
      throw new BadRequestError("time slots are required");
    }

    const slotsToCreate = dates.flatMap((dateStr) => {
      const availableDate = parseDateOnly(dateStr);
      return times.map((t) => {
        const startTime = parseTimeOnly(t.start_time);
        const endTime = parseTimeOnly(t.end_time);
        ensureStartBeforeEnd(startTime, endTime);
        return {
          counsellorId,
          availableDate,
          startTime,
          endTime,
          sessionDurationMins: input.session_duration_mins,
          sessionFee: finalFee,
        };
      });
    });

    try {
      const createdSlots = await SessionRepository.createSlots(slotsToCreate);
      const formatted = createdSlots.map(formatSlot);
      return groupSlotsByDate(formatted);
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

    const counsellor = await CounsellingRepository.findById(counsellorId);
    const fee = Number(counsellor?.sessionFee ?? 0.0);

    const slots = await SessionRepository.listSlotsByCounsellor(
      counsellorId,
      fromDate,
      {
        page: query.page,
        limit: query.limit,
      },
    );

    const formatted = slots.map((slot) =>
      formatSlot({ ...slot, sessionFee: slot.sessionFee ?? fee }),
    );
    return groupSlotsByDate(formatted);
  }

  static async listAvailableSlots(query: ListAvailableSlotsQueryInput) {
    const fromDate = query.from_date
      ? parseDateOnly(query.from_date)
      : undefined;
    const toDate = query.to_date ? parseDateOnly(query.to_date) : undefined;

    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestError("from_date cannot be after to_date");
    }

    const slots = await SessionRepository.listAvailableSlots(
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

    return groupSlotsByDate(slots.map(formatSlot));
  }

  static async listCounsellors(query: ListCounsellorsQueryInput) {
    const date = query.date ? parseDateOnly(query.date) : undefined;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const { counsellors, total } =
      await CounsellingRepository.findActiveWithSlots({
        date,
        counsellorType: query.counsellor_type,
        language: query.language,
        page,
        limit,
      });

    const data = counsellors.map(formatCounsellor);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasNext: page * limit < total,
      },
    };
  }

  /**
   * Resolve the authoritative fee for a slot — never trust client input.
   */
  private static async resolveSlotFee(slot: {
    sessionFee: unknown;
    counsellorId: string;
  }): Promise<number> {
    if (slot.sessionFee && Number(slot.sessionFee) > 0) {
      return Number(slot.sessionFee);
    }
    const counsellor = await CounsellingRepository.findById(slot.counsellorId);
    return Number(counsellor?.sessionFee ?? 0.0);
  }

  private static capturedPaymentKey(
    availabilityId: string,
    studentId: string,
  ): string {
    return `razorpay:captured:${availabilityId}:${studentId}`;
  }

  /**
   * Called by the Razorpay webhook on `payment.captured`.
   * Marks the order as paid so `bookSession` can confirm it without
   * the client passing payment details directly.
   */
  static async markPaymentCaptured(payment: {
    id: string;
    amount: number;
    notes?: { availability_id?: string; student_id?: string };
  }): Promise<void> {
    const availabilityId = payment.notes?.availability_id;
    const studentId = payment.notes?.student_id;
    if (!availabilityId || !studentId) return;

    const redis = getRedisClient();
    const idempotencyKey = `payment-processed:${payment.id}`;
    const isNew = await redis.set(idempotencyKey, "1", "EX", 86400, "NX");
    if (!isNew) return;

    await redis.set(
      this.capturedPaymentKey(availabilityId, studentId),
      JSON.stringify({ paymentId: payment.id, amount: payment.amount }),
      "EX",
      1800,
    );
  }

  /**
   * Reads and clears the "payment captured" marker for a slot/student
   * pair set by the Razorpay webhook.
   */
  private static async consumeCapturedPayment(
    availabilityId: string,
    studentId: string,
  ): Promise<{ paymentId: string; amount: number } | null> {
    const redis = getRedisClient();
    const key = this.capturedPaymentKey(availabilityId, studentId);
    const raw = await redis.get(key);
    if (!raw) return null;

    await redis.del(key);
    return JSON.parse(raw) as { paymentId: string; amount: number };
  }

  static async createPaymentOrder(
    studentId: string,
    input: CreatePaymentOrderInput,
  ) {
    const slot = await SessionRepository.findSlotById(input.availability_id);

    if (!slot) {
      throw new NotFoundError("Availability slot not found");
    }

    if (slot.isBooked) {
      throw new ConflictError("This slot is already booked");
    }

    const fee = await this.resolveSlotFee(slot);

    if (fee <= 0) {
      return { payment_required: false, fee: 0 };
    }

    if (!isRazorpayReady()) {
      throw new BadRequestError("Payment gateway is not configured");
    }

    const order = await getRazorpay().orders.create({
      amount: Math.round(fee * 100),
      currency: "INR",
      // Razorpay caps receipt at 40 chars — use the slot's last 8 chars + a timestamp.
      receipt: `CNS-${slot.id.slice(-8)}-${Date.now()}`,
      notes: {
        availability_id: slot.id,
        student_id: studentId,
      },
    });

    return {
      payment_required: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      fee,
    };
  }

  static async bookSession(studentId: string, input: BookSessionInput) {
    const slot = await SessionRepository.findSlotById(input.availability_id);

    if (!slot) {
      throw new NotFoundError("Availability slot not found");
    }

    if (slot.isBooked) {
      throw new ConflictError("This slot is already booked");
    }

    const finalFee = await this.resolveSlotFee(slot);
    let transactionId: string | undefined;

    if (finalFee > 0) {
      const paidPayment = await this.consumeCapturedPayment(slot.id, studentId);

      if (!paidPayment) {
        throw new BadRequestError(
          "Payment not completed for this slot. Please complete payment via Razorpay first.",
        );
      }

      if (paidPayment.amount !== Math.round(finalFee * 100)) {
        throw new BadRequestError("Payment amount mismatch");
      }

      transactionId = paidPayment.paymentId;
    }

    const session = await SessionRepository.bookSlotAndCreateSession({
      slot,
      studentId,
      sessionMode: input.session_mode,
      sessionType: input.session_type,
      bookingReason: input.booking_reason,
      finalFee,
      transactionId,
    });

    return formatSession(session);
  }

  static async listStudentSessions(
    studentId: string,
    query: ListSessionsQueryInput,
  ) {
    const date = query.date ? parseDateOnly(query.date) : undefined;

    const sessions = await SessionRepository.listSessionsByStudent(
      studentId,
      {
        date,
        status: query.status,
        search: query.search,
      },
      {
        page: query.page,
        limit: query.limit,
      },
    );
    return sessions.map(formatSession);
  }

  static async listStudentSessionsByStatus(
    studentId: string,
    status: "booked" | "completed",
    query: ListSessionsQueryInput,
  ) {
    const date = query.date ? parseDateOnly(query.date) : undefined;

    const sessions = await SessionRepository.listSessionsByStudent(
      studentId,
      {
        date,
        status,
        search: query.search,
      },
      {
        page: query.page,
        limit: query.limit,
      },
    );
    return sessions.map(formatSession);
  }

  static async listCounsellorSessions(
    counsellorId: string,
    query: ListSessionsQueryInput,
  ) {
    const date = query.date ? parseDateOnly(query.date) : undefined;

    const sessions = await SessionRepository.listSessionsByCounsellor(
      counsellorId,
      {
        date,
        status: query.status,
        search: query.search,
      },
      {
        page: query.page,
        limit: query.limit,
      },
    );
    return sessions.map(formatSession);
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
    return formatSession(session);
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

    const refundAmount =
      session.paymentStatus === "paid" && session.sessionFee
        ? Number(session.sessionFee)
        : 0;

    await SessionRepository.cancelSessionAndRefund({
      sessionId,
      availabilityId: session.availabilityId,
      counsellorId: session.counsellorId,
      cancelledBy: actor.userType,
      cancellationReason: input.cancellation_reason,
      refundAmount,
    });

    return formatSession(await SessionRepository.findSessionById(sessionId));
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

    const newSlot = await SessionRepository.findSlotById(
      input.new_availability_id,
    );

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

    await SessionRepository.rescheduleSessionTx({
      sessionId,
      oldAvailabilityId: session.availabilityId,
      newAvailabilityId: newSlot.id,
      newSlot,
      rescheduledBy: "student",
      fromDate: session.scheduledDate,
      fromTime: session.startTime,
      reason: input.reason,
    });

    return formatSession(await SessionRepository.findSessionById(sessionId));
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

    return formatSession(await SessionRepository.findSessionById(sessionId));
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

    // Note: Session fee is credited to the counsellor's wallet at the time of booking.
    // Hence, no additional credit is done upon session completion to avoid duplicate payments.

    return formatSession(await SessionRepository.findSessionById(sessionId));
  }

  static async getWallet(counsellorId: string) {
    await SessionRepository.findOrCreateWallet(counsellorId);
    const wallet = await SessionRepository.getWallet(counsellorId);
    return formatWallet(wallet);
  }

  static async rateSession(
    studentId: string,
    sessionId: string,
    input: RateSessionInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.studentId !== studentId) {
      throw new ForbiddenError("You can only rate your own sessions");
    }

    if (session.status !== "completed") {
      throw new BadRequestError("Only completed sessions can be rated");
    }

    if (session.rating !== null) {
      throw new BadRequestError("Session has already been rated");
    }

    return formatSession(
      await SessionRepository.rateSessionAndRecalculateCounsellorRating(
        sessionId,
        session.counsellorId,
        input.rating,
        input.rating_feedback,
      ),
    );
  }
}
