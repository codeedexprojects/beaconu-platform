import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { getRazorpay, isRazorpayReady } from "@/shared/lib/razorpay";
import { getRedisClient } from "@/shared/lib/redis";
import { logger } from "@/shared/lib/logger";
import {
  createMeetEvent,
  deleteMeetEvent,
  isGoogleMeetReady,
  updateMeetEventTime,
} from "@/shared/lib/google-meet";
import { PushService } from "@/modules/notifications/services/push.service";
import { SessionRepository } from "../repositories/session.repository";
import { CounsellingRepository } from "../repositories/counselling.repository";
import {
  AddSlotInput,
  BookSessionInput,
  CancelSessionInput,
  CompleteSessionInput,
  CreatePaymentOrderInput,
  ListAvailableSlotsQueryInput,
  ListCounsellorRatingsQueryInput,
  ListCounsellorsQueryInput,
  ListSessionsQueryInput,
  ListSlotsQueryInput,
  ListWalletTransactionsQueryInput,
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

/** Formats a `@db.Time` value (stored as a Date) as "HH:MM". */
function formatTimeOnly(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(11, 16);
}

function formatTime12h(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  const minute = m.toString().padStart(2, "0");
  return `${hour}:${minute} ${period}`;
}

/**
 * Combines a `@db.Date` value and a `@db.Time` value into a timezone-naive
 * ISO datetime (no "Z"/offset) so Google Calendar interprets it using the
 * `timeZone` field (Asia/Kolkata) rather than as UTC.
 */
function toISODateTime(date: Date, time: Date): string {
  const datePart = date.toISOString().slice(0, 10);
  const timePart = time.toISOString().slice(11, 19);
  return `${datePart}T${timePart}`;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Resolves a `@db.Date` + `@db.Time` pair (stored as raw IST wall-clock
 * values) to the actual UTC instant it represents, so it can be compared
 * against `new Date()`.
 */
function istWallTimeToInstant(date: Date, time: Date): Date {
  const naiveISO = toISODateTime(date, time);
  return new Date(new Date(`${naiveISO}.000Z`).getTime() - IST_OFFSET_MS);
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

/**
 * `expertise`/`education` are normally explicit arrays in `profile_metadata`,
 * but counsellors approved before those fields existed only have a
 * comma-separated `specialization` string / a single `qualification`
 * string — fall back to deriving arrays from those.
 */
function deriveExpertise(metadata: Record<string, unknown>): string[] {
  if (Array.isArray(metadata.expertise)) return metadata.expertise;
  if (typeof metadata.specialization === "string") {
    return metadata.specialization
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function deriveEducation(metadata: Record<string, unknown>): string[] {
  if (Array.isArray(metadata.education)) return metadata.education;
  if (
    typeof metadata.qualification === "string" &&
    metadata.qualification.trim()
  ) {
    return [metadata.qualification.trim()];
  }
  return [];
}

function formatCounsellor(counsellor: any) {
  if (!counsellor) return counsellor;
  const metadata = counsellor.profileMetadata ?? {};
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
    about: metadata.about ?? null,
    expertise: deriveExpertise(metadata),
    education: deriveEducation(metadata),
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
    start_time: formatTimeOnly(availability.startTime),
    end_time: formatTimeOnly(availability.endTime),
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
    from_time: formatTimeOnly(reschedule.fromTime),
    to_availability_id: reschedule.toAvailabilityId,
    to_date: reschedule.toDate,
    to_time: formatTimeOnly(reschedule.toTime),
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
          student_name: txn.session?.student?.fullName ?? null,
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
    start_time: formatTimeOnly(session.startTime),
    end_time: formatTimeOnly(session.endTime),
    booking_reason: session.bookingReason,
    meeting_url: session.meetingUrl,
    meeting_id: session.meetingId,
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
    start_time: formatTimeOnly(slot.startTime),
    end_time: formatTimeOnly(slot.endTime),
    session_duration_mins: slot.sessionDurationMins,
    is_booked: slot.isBooked,
    session_fee: Number(fee),
    meeting_url: slot.meetingUrl ?? null,
    meeting_id: slot.meetingId ?? null,
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
      meeting_url: slot.meeting_url,
      meeting_id: slot.meeting_id,
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

  /**
   * Full counsellor detail view for the platform admin panel:
   * profile, slot/session stats, wallet, and recent slot/session lists.
   */
  static async getCounsellorDetailForAdmin(counsellorId: string) {
    const counsellor = await CounsellingRepository.findById(counsellorId);
    if (!counsellor) throw new NotFoundError("Counsellor not found");

    const fee = Number(counsellor.sessionFee ?? 0.0);

    const [
      slotStats,
      sessionStats,
      wallet,
      availableSlots,
      bookedSlots,
      sessions,
    ] = await Promise.all([
      SessionRepository.getSlotStats(counsellorId),
      SessionRepository.getSessionStats(counsellorId),
      SessionRepository.getWallet(counsellorId),
      SessionRepository.listSlotsByCounsellor(
        counsellorId,
        undefined,
        { limit: 50 },
        false,
      ),
      SessionRepository.listSlotsByCounsellor(
        counsellorId,
        undefined,
        { limit: 50 },
        true,
      ),
      SessionRepository.listSessionsByCounsellor(
        counsellorId,
        {},
        { limit: 20 },
      ).then((r) => r.sessions),
    ]);

    return {
      counsellor: formatCounsellor(counsellor),
      stats: {
        slots: slotStats,
        sessions: {
          total: sessionStats.total,
          booked: sessionStats.booked,
          completed: sessionStats.completed,
          cancelled: sessionStats.cancelled,
        },
        payments: {
          paid_sessions_count: sessionStats.paidSessionsCount,
          total_payment_received: sessionStats.totalPaymentReceived,
        },
      },
      wallet: formatWallet(wallet),
      slots: {
        available: availableSlots.map((slot) =>
          formatSlot({ ...slot, sessionFee: slot.sessionFee ?? fee }),
        ),
        booked: bookedSlots.map((slot) =>
          formatSlot({ ...slot, sessionFee: slot.sessionFee ?? fee }),
        ),
      },
      recent_sessions: sessions.map((session) => ({
        id: session.id,
        status: session.status,
        session_mode: session.sessionMode,
        session_type: session.sessionType,
        scheduled_date: session.scheduledDate,
        start_time: session.startTime,
        end_time: session.endTime,
        session_fee: session.sessionFee ? Number(session.sessionFee) : null,
        payment_status: session.paymentStatus,
        transaction_id: session.transactionId,
        student: formatStudent(session.student),
      })),
    };
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

  static async listKnownLanguages(): Promise<string[]> {
    const rows = await CounsellingRepository.findAllKnownLanguages();
    const languages = new Map<string, string>();
    for (const row of rows) {
      for (const lang of row.split(",")) {
        const trimmed = lang.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!languages.has(key)) languages.set(key, trimmed);
      }
    }
    return Array.from(languages.values()).sort((a, b) => a.localeCompare(b));
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
   * Full counsellor profile for the student-facing detail page — includes
   * about/expertise/education from profile metadata.
   */
  static async getCounsellorDetail(counsellorId: string) {
    const counsellor = await CounsellingRepository.findById(counsellorId);
    if (!counsellor || counsellor.status !== "active") {
      throw new NotFoundError("Counsellor not found");
    }
    return formatCounsellor(counsellor);
  }

  /**
   * Aggregate rating plus a paginated list of session reviews/feedback for
   * a counsellor.
   */
  static async getCounsellorRatings(
    counsellorId: string,
    query: ListCounsellorRatingsQueryInput,
  ) {
    const counsellor = await CounsellingRepository.findById(counsellorId);
    if (!counsellor || counsellor.status !== "active") {
      throw new NotFoundError("Counsellor not found");
    }

    const { sessions, total } = await SessionRepository.listRatingsByCounsellor(
      counsellorId,
      { page: query.page, limit: query.limit },
    );

    return {
      rating: Number(counsellor.rating ?? 0.0),
      rating_count: total,
      data: sessions.map((session) => ({
        session_id: session.id,
        rating: session.rating,
        rating_feedback: session.ratingFeedback,
        scheduled_date: session.scheduledDate,
        rated_at: session.updatedAt,
        student_name: session.student.fullName,
        student_avatar_url: session.student.avatarUrl,
      })),
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
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

    if (isGoogleMeetReady()) {
      await this.createMeetLinkForSession(session);
    }

    await this.notifyCounsellorOfBooking(session);

    return formatSession(session);
  }

  /**
   * Best-effort: push-notifies the counsellor that a student booked a
   * session. Never throws — booking must succeed even if the push fails.
   */
  private static async notifyCounsellorOfBooking(session: {
    id: string;
    counsellorId: string;
    scheduledDate: Date;
    startTime: Date;
    sessionMode: string;
  }): Promise<void> {
    try {
      const fullSession = await SessionRepository.findSessionById(session.id);
      const studentName = fullSession?.student?.fullName ?? "A student";
      const dateStr = session.scheduledDate.toISOString().slice(0, 10);
      const timeStr = formatTime12h(session.startTime);

      await PushService.sendToUser(session.counsellorId, "counsellor", {
        title: "New session booked",
        body: `${studentName} booked a ${session.sessionMode.replace("_", " ")} session on ${dateStr} at ${timeStr}`,
        data: {
          type: "session_booked",
          sessionId: session.id,
        },
      });
    } catch (error) {
      logger.error(
        { err: error, sessionId: session.id },
        "Failed to notify counsellor of new booking",
      );
    }
  }

  /**
   * Best-effort: creates the Google Calendar/Meet event for a freshly
   * booked session and attaches the link to it. Mutates `session` in place
   * so the caller's response reflects the link without a refetch. Never
   * throws — booking must succeed even if Calendar/Meet is unavailable.
   */
  private static async createMeetLinkForSession(session: {
    id: string;
    counsellorId: string;
    scheduledDate: Date;
    startTime: Date;
    endTime: Date;
    meetingUrl: string | null;
    meetingId: string | null;
  }): Promise<void> {
    try {
      const [counsellor, fullSession] = await Promise.all([
        CounsellingRepository.findById(session.counsellorId),
        SessionRepository.findSessionById(session.id),
      ]);

      const attendeeEmails = [
        counsellor?.email,
        fullSession?.student?.email,
      ].filter((email): email is string => !!email);

      const meetEvent = await createMeetEvent({
        summary: `Counselling session with ${counsellor?.fullName ?? "Counsellor"}`,
        startDateTime: toISODateTime(session.scheduledDate, session.startTime),
        endDateTime: toISODateTime(session.scheduledDate, session.endTime),
        attendeeEmails,
      });

      if (!meetEvent) return;

      await SessionRepository.updateSession(session.id, {
        meetingUrl: meetEvent.meetingUrl,
        ...(meetEvent.meetingId ? { meetingId: meetEvent.meetingId } : {}),
        googleEventId: meetEvent.eventId,
      });

      session.meetingUrl = meetEvent.meetingUrl;
      session.meetingId = meetEvent.meetingId;
    } catch (error) {
      logger.error(
        { err: error, sessionId: session.id },
        "Failed to create Google Meet link for session",
      );
    }
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
    const fromDate = query.from_date
      ? parseDateOnly(query.from_date)
      : undefined;
    const toDate = query.to_date ? parseDateOnly(query.to_date) : undefined;

    const { sessions, total } =
      await SessionRepository.listSessionsByCounsellor(
        counsellorId,
        {
          date,
          fromDate,
          toDate,
          status: query.status,
          search: query.search,
        },
        {
          page: query.page,
          limit: query.limit,
        },
      );
    return {
      data: sessions.map(formatSession),
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }

  static async getSessionForActor(
    sessionId: string,
    actor: { userType: "student" | "counsellor"; userId: string },
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session");
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
      throw new NotFoundError("Session");
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

    if (session.googleEventId) {
      await deleteMeetEvent(session.googleEventId);
    }

    if (actor.userType === "student") {
      await this.notifyCounsellorOfCancellation(session);
    }

    return formatSession(await SessionRepository.findSessionById(sessionId));
  }

  /**
   * Best-effort: notifies the counsellor when a student cancels a booked session.
   */
  private static async notifyCounsellorOfCancellation(session: {
    id: string;
    counsellorId: string;
    scheduledDate: Date;
    startTime: Date;
    student: { fullName: string } | null;
  }): Promise<void> {
    try {
      const studentName = session.student?.fullName ?? "A student";
      const dateStr = session.scheduledDate.toISOString().slice(0, 10);
      const timeStr = formatTime12h(session.startTime);

      await PushService.sendToUser(session.counsellorId, "counsellor", {
        title: "Session cancelled",
        body: `${studentName} cancelled their session on ${dateStr} at ${timeStr}`,
        data: { type: "session_cancelled", sessionId: session.id },
      });
    } catch (error) {
      logger.error(
        { err: error, sessionId: session.id },
        "Failed to notify counsellor of session cancellation",
      );
    }
  }

  static async rescheduleSession(
    actor: { userType: "student" | "counsellor"; userId: string },
    sessionId: string,
    input: RescheduleSessionInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundError("Session");
    }

    ensureOwnsSession(session, actor);

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

    if (
      istWallTimeToInstant(newSlot.availableDate, newSlot.startTime) <=
      new Date()
    ) {
      throw new BadRequestError("Cannot reschedule to a slot in the past");
    }

    await SessionRepository.rescheduleSessionTx({
      sessionId,
      oldAvailabilityId: session.availabilityId,
      newAvailabilityId: newSlot.id,
      newSlot,
      rescheduledBy: actor.userType,
      fromDate: session.scheduledDate,
      fromTime: session.startTime,
      reason: input.reason,
    });

    if (session.googleEventId) {
      await updateMeetEventTime(
        session.googleEventId,
        toISODateTime(newSlot.availableDate, newSlot.startTime),
        toISODateTime(newSlot.availableDate, newSlot.endTime),
      );
    }

    if (actor.userType === "counsellor") {
      await this.notifyStudentOfReschedule(session, newSlot);
    }

    return formatSession(await SessionRepository.findSessionById(sessionId));
  }

  /**
   * Best-effort: notifies the student when a counsellor reschedules their session.
   */
  private static async notifyStudentOfReschedule(
    session: {
      id: string;
      studentId: string;
      counsellor: { fullName: string } | null;
    },
    newSlot: { availableDate: Date; startTime: Date },
  ): Promise<void> {
    try {
      const counsellorName = session.counsellor?.fullName ?? "Your counsellor";
      const dateStr = newSlot.availableDate.toISOString().slice(0, 10);
      const timeStr = formatTime12h(newSlot.startTime);

      await PushService.sendToUser(session.studentId, "student", {
        title: "Session rescheduled",
        body: `${counsellorName} rescheduled your session to ${dateStr} at ${timeStr}`,
        data: { type: "session_rescheduled", sessionId: session.id },
      });
    } catch (error) {
      logger.error(
        { err: error, sessionId: session.id },
        "Failed to notify student of session reschedule",
      );
    }
  }

  static async updateMeeting(
    counsellorId: string,
    sessionId: string,
    input: UpdateMeetingInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session");
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
      throw new NotFoundError("Session");
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

  /**
   * Auto-completes "booked" sessions whose end time has passed. Run
   * periodically by the `session-auto-complete` job — counsellors who
   * forget to mark a session complete shouldn't block the student from
   * rating it.
   */
  static async autoCompletePastSessions(): Promise<number> {
    const now = new Date();
    const todayIST = new Date(now.getTime() + IST_OFFSET_MS);
    const todayDateOnly = parseDateOnly(todayIST.toISOString().slice(0, 10));

    const candidates =
      await SessionRepository.findBookedSessionsOnOrBefore(todayDateOnly);

    const dueIds = candidates
      .filter(
        (session) =>
          istWallTimeToInstant(session.scheduledDate, session.endTime) <= now,
      )
      .map((session) => session.id);

    const { count } = await SessionRepository.markSessionsCompleted(dueIds);
    return count;
  }

  static async getWallet(
    counsellorId: string,
    query: ListWalletTransactionsQueryInput,
  ) {
    await SessionRepository.findOrCreateWallet(counsellorId);

    const date = query.date ? parseDateOnly(query.date) : undefined;
    const fromDate = query.from_date
      ? parseDateOnly(query.from_date)
      : undefined;
    const toDate = query.to_date ? parseDateOnly(query.to_date) : undefined;

    const wallet = await SessionRepository.getWallet(
      counsellorId,
      { date, fromDate, toDate, type: query.type },
      { page: query.page, limit: query.limit },
    );
    if (!wallet) return null;

    return {
      ...formatWallet(wallet),
      transactions_meta: PaginationHelper.createMeta(
        wallet.transactionsTotal,
        query.page,
        query.limit,
      ),
    };
  }

  static async rateSession(
    studentId: string,
    sessionId: string,
    input: RateSessionInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session");
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

  /**
   * Scans today's booked sessions and sends a 10-minute reminder push to
   * both the counsellor and the student for sessions starting in 9–11 min.
   * Redis deduplicates so each session only gets one reminder regardless of
   * how many times the job fires in that window.
   * Returns the number of sessions reminded.
   */
  /** Removes past unbooked slots so they don't inflate stats or waste storage. */
  static async cleanupExpiredSlots(): Promise<number> {
    const now = new Date();
    const todayIST = new Date(now.getTime() + IST_OFFSET_MS);
    const todayDateOnly = parseDateOnly(todayIST.toISOString().slice(0, 10));
    const { count } =
      await SessionRepository.deleteExpiredUnbookedSlots(todayDateOnly);
    return count;
  }

  static async sendSessionReminders(): Promise<number> {
    const now = new Date();
    const redis = getRedisClient();

    const sessions = await SessionRepository.findBookedSessionsToday(now);

    let count = 0;
    for (const session of sessions) {
      const startInstant = istWallTimeToInstant(
        session.scheduledDate,
        session.startTime,
      );
      const msUntilStart = startInstant.getTime() - now.getTime();
      const NINE_MIN = 9 * 60 * 1000;
      const ELEVEN_MIN = 11 * 60 * 1000;

      if (msUntilStart < NINE_MIN || msUntilStart > ELEVEN_MIN) continue;

      const redisKey = `counselling:reminder-sent:${session.id}`;
      const alreadySent = await redis.get(redisKey);
      if (alreadySent) continue;

      // Mark before sending — best effort, prevents double-fire even if push throws
      await redis.set(redisKey, "1", "EX", 24 * 60 * 60);

      const timeStr = formatTime12h(session.startTime);
      const counsellorName = session.counsellor?.fullName ?? "your counsellor";
      const studentName = session.student?.fullName ?? "your student";

      await Promise.allSettled([
        PushService.sendToUser(session.counsellorId, "counsellor", {
          title: "Session starting soon",
          body: `Your session with ${studentName} starts in 10 minutes at ${timeStr}`,
          data: { type: "session_reminder", sessionId: session.id },
        }),
        PushService.sendToUser(session.studentId, "student", {
          title: "Session starting soon",
          body: `Your session with ${counsellorName} starts in 10 minutes at ${timeStr}`,
          data: { type: "session_reminder", sessionId: session.id },
        }),
      ]);

      count++;
    }

    return count;
  }
}
