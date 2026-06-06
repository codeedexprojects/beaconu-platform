import { prisma } from "@beaconu/db";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from "@/shared/errors";
import { EventRepository } from "../repositories/event.repository";
import { EventRegistrationRepository } from "../repositories/event-registration.repository";
import {
  CreateEventInput,
  UpdateEventInput,
  UpdateEventStatusInput,
  UploadRecordingInput,
  ListEventsQueryInput,
  RegisterEventInput,
} from "../validators/event.validator";
import { PaginationHelper } from "@/shared/responses/pagination";

// ─── Formatter ────────────────────────────────────────────────

function formatEvent(event: any) {
  if (!event) return event;
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description ?? null,
    cover_image_url: event.coverImageUrl ?? null,
    category: event.category,
    speaker_name: event.speakerName ?? null,
    speaker_title: event.speakerTitle ?? null,
    organizer: event.organizer ?? null,
    event_date: event.eventDate,
    start_time: event.startTime ?? null,
    end_time: event.endTime ?? null,
    duration: event.duration ?? null,
    event_mode: event.eventMode,
    venue: event.venue ?? null,
    online_link: event.onlineLink ?? null,
    is_free: event.isFree,
    ticket_price: Number(event.ticketPrice ?? 0),
    total_seats: event.totalSeats ?? null,
    registered_count: event.registeredCount ?? 0,
    has_recording: event.hasRecording ?? false,
    recording_url: event.recordingUrl ?? null,
    is_youtube_video: isYouTubeUrl(event.recordingUrl),
    recording_duration: event.recordingDuration ?? null,
    recorded_at: event.recordedAt ?? null,
    college_id: event.collegeId ?? null,
    status: event.status,
    created_by_type: event.createdByType ?? null,
    created_by_id: event.createdById ?? null,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

function formatEventListItem(event: any) {
  if (!event) return event;
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    cover_image_url: event.coverImageUrl ?? null,
    category: event.category,
    speaker_name: event.speakerName ?? null,
    speaker_title: event.speakerTitle ?? null,
    organizer: event.organizer ?? null,
    event_date: event.eventDate,
    start_time: event.startTime ?? null,
    end_time: event.endTime ?? null,
    duration: event.duration ?? null,
    event_mode: event.eventMode,
    venue: event.venue ?? null,
    is_free: event.isFree,
    ticket_price: Number(event.ticketPrice ?? 0),
    total_seats: event.totalSeats ?? null,
    registered_count: event.registeredCount ?? 0,
    is_joined: false,
    status: event.status,
    created_at: event.createdAt,
  };
}

function formatRegistration(reg: any, paidAmount?: number | null) {
  return {
    id: reg.id,
    event_id: reg.eventId,
    student_id: reg.studentId,
    payment_status: reg.paymentStatus,
    transaction_id: reg.transactionId ?? null,
    paid_amount: paidAmount ?? null,
    is_joined: reg.status === "registered",
    status: reg.status,
    registered_at: reg.registeredAt,
    cancelled_at: reg.cancelledAt ?? null,
    ...(reg.event
      ? {
          event: {
            ...formatEventListItem(reg.event),
            is_joined: reg.status === "registered",
          },
        }
      : {}),
    ...(reg.student
      ? {
          student_name: reg.student.fullName ?? null,
          student_email: reg.student.email ?? null,
        }
      : {}),
  };
}

function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes("youtube.com") || host.includes("youtu.be");
  } catch {
    return false;
  }
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80) +
    "-" +
    Date.now().toString(36)
  );
}

// ─── Service ──────────────────────────────────────────────────

export class EventService {
  // ── Admin: Create ────────────────────────────────────────

  static async create(
    data: CreateEventInput,
    createdByType: string,
    createdById: string,
  ) {
    const slug = generateSlug(data.title);

    const event = await EventRepository.create({
      title: data.title,
      slug,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      category: data.category,
      speakerName: data.speaker_name,
      speakerTitle: data.speaker_title,
      organizer: data.organizer,
      eventDate: new Date(data.event_date),
      startTime: data.start_time
        ? new Date(`1970-01-01T${data.start_time}:00Z`)
        : undefined,
      endTime: data.end_time
        ? new Date(`1970-01-01T${data.end_time}:00Z`)
        : undefined,
      duration: data.duration,
      eventMode: data.event_mode,
      venue: data.venue,
      onlineLink: data.online_link,
      isFree: data.is_free ?? true,
      ticketPrice: data.ticket_price ?? 0,
      totalSeats: data.total_seats,
      collegeId: data.college_id,
      ...(data.status ? { status: data.status } : {}),
      ...(data.has_recording !== undefined
        ? { hasRecording: data.has_recording }
        : {}),
      ...(data.recording_url ? { recordingUrl: data.recording_url } : {}),
      ...(data.recording_duration
        ? { recordingDuration: data.recording_duration }
        : {}),
      ...(data.recorded_at ? { recordedAt: new Date(data.recorded_at) } : {}),
      createdByType,
      createdById,
    });

    return formatEvent(event);
  }

  // ── Admin: Update ────────────────────────────────────────

  static async update(id: string, data: UpdateEventInput) {
    const existing = await EventRepository.findById(id);
    if (!existing) throw new NotFoundError("Event not found");

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.cover_image_url !== undefined)
      updateData.coverImageUrl = data.cover_image_url;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.speaker_name !== undefined)
      updateData.speakerName = data.speaker_name;
    if (data.speaker_title !== undefined)
      updateData.speakerTitle = data.speaker_title;
    if (data.organizer !== undefined) updateData.organizer = data.organizer;
    if (data.event_date !== undefined)
      updateData.eventDate = new Date(data.event_date);
    if (data.start_time !== undefined)
      updateData.startTime = data.start_time
        ? new Date(`1970-01-01T${data.start_time}:00Z`)
        : null;
    if (data.end_time !== undefined)
      updateData.endTime = data.end_time
        ? new Date(`1970-01-01T${data.end_time}:00Z`)
        : null;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.event_mode !== undefined) updateData.eventMode = data.event_mode;
    if (data.venue !== undefined) updateData.venue = data.venue;
    if (data.online_link !== undefined)
      updateData.onlineLink = data.online_link;
    if (data.is_free !== undefined) updateData.isFree = data.is_free;
    if (data.ticket_price !== undefined)
      updateData.ticketPrice = data.ticket_price;
    if (data.total_seats !== undefined)
      updateData.totalSeats = data.total_seats;

    const updated = await EventRepository.updateById(id, updateData);
    return formatEvent(updated);
  }

  // ── Admin: Update Status ─────────────────────────────────

  static async updateStatus(id: string, data: UpdateEventStatusInput) {
    const existing = await EventRepository.findById(id);
    if (!existing) throw new NotFoundError("Event not found");

    const updated = await EventRepository.updateById(id, {
      status: data.status,
    });
    return formatEvent(updated);
  }

  // ── Admin: Soft Delete (Archive) ─────────────────────────

  static async softDelete(id: string) {
    const existing = await EventRepository.findById(id);
    if (!existing) throw new NotFoundError("Event not found");

    const archived = await EventRepository.softDeleteById(id);
    return formatEvent(archived);
  }

  // ── Admin: Upload Recording ──────────────────────────────

  static async uploadRecording(id: string, data: UploadRecordingInput) {
    const existing = await EventRepository.findById(id);
    if (!existing) throw new NotFoundError("Event not found");
    if (existing.status !== "completed") {
      throw new BadRequestError(
        "Recording can be uploaded only for completed events",
      );
    }

    const youtubeUrl = isYouTubeUrl(data.recording_url);
    if (data.is_youtube_video === true && !youtubeUrl) {
      throw new BadRequestError(
        "recording_url must be a YouTube URL when is_youtube_video is true",
      );
    }
    if (data.is_youtube_video === false && youtubeUrl) {
      throw new BadRequestError(
        "recording_url cannot be a YouTube URL when is_youtube_video is false",
      );
    }

    const updated = await EventRepository.updateById(id, {
      hasRecording: true,
      recordingUrl: data.recording_url,
      recordingDuration: data.recording_duration,
      recordedAt: data.recorded_at ? new Date(data.recorded_at) : new Date(),
    });

    return formatEvent(updated);
  }

  // ── Admin: List All ──────────────────────────────────────

  static async listAll(query: ListEventsQueryInput) {
    const { events, total } = await EventRepository.findAll(
      {
        status: query.status,
        category: query.category,
        eventMode: query.event_mode,
        isFree: query.is_free,
        hasRecording: query.has_recording,
        search: query.search,
        fromDate: query.from_date,
      },
      query.page,
      query.limit,
    );

    return {
      events: events.map(formatEventListItem),
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }

  // ── Admin: Get Detail ────────────────────────────────────

  static async getById(id: string) {
    const event = await EventRepository.findById(id);
    if (!event) throw new NotFoundError("Event not found");
    return formatEvent(event);
  }

  // ── Admin: List Event Registrations ──────────────────────

  static async listEventRegistrations(
    eventId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const event = await EventRepository.findById(eventId);
    if (!event) throw new NotFoundError("Event not found");

    const { registrations, total } =
      await EventRegistrationRepository.findByEventId(eventId, page, limit);
    const { joinedCount, leftCount } =
      await EventRegistrationRepository.countByEventAndStatus(eventId);

    return {
      registrations: registrations.map(formatRegistration),
      summary: {
        joined_count: joinedCount,
        left_count: leftCount,
      },
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  // ── Student: List Upcoming ───────────────────────────────

  static async listUpcoming(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    filters: {
      category?: string;
      eventMode?: string;
      isFree?: boolean;
      search?: string;
    } = {},
  ) {
    const { events, total } = await EventRepository.findUpcoming(
      page,
      limit,
      filters,
    );

    const joinedEventIds =
      await EventRegistrationRepository.findRegisteredEventIds(
        studentId,
        events.map((event) => event.id),
      );
    const joinedSet = new Set(joinedEventIds);

    return {
      events: events.map((event) => ({
        ...formatEventListItem(event),
        is_joined: joinedSet.has(event.id),
      })),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  // ── Student: Get Detail By Slug ──────────────────────────

  static async getBySlug(slug: string, studentId: string) {
    const event = await EventRepository.findBySlug(slug);
    if (!event) throw new NotFoundError("Event not found");
    if (event.status !== "published" && event.status !== "completed") {
      throw new NotFoundError("Event not found");
    }
    const registration =
      await EventRegistrationRepository.findByEventAndStudent(
        event.id,
        studentId,
      );
    return {
      ...formatEvent(event),
      is_joined: registration?.status === "registered",
    };
  }

  static async getPublicById(id: string, studentId: string) {
    const event = await EventRepository.findById(id);
    if (!event) throw new NotFoundError("Event not found");
    if (event.status !== "published" && event.status !== "completed") {
      throw new NotFoundError("Event not found");
    }
    const registration =
      await EventRegistrationRepository.findByEventAndStudent(
        event.id,
        studentId,
      );
    return {
      ...formatEvent(event),
      is_joined: registration?.status === "registered",
    };
  }

  // ── Student: Register ────────────────────────────────────

  static async register(
    eventId: string,
    studentId: string,
    payload: RegisterEventInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      });
      if (!student) {
        throw new ForbiddenError(
          "You do not have permission to access this resource",
        );
      }

      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          status: true,
          totalSeats: true,
          registeredCount: true,
          isFree: true,
          ticketPrice: true,
        },
      });

      if (!event) throw new NotFoundError("Event not found");
      if (event.status !== "published")
        throw new BadRequestError("Event is not open for registration");

      if (
        event.totalSeats !== null &&
        event.registeredCount >= event.totalSeats
      ) {
        throw new ConflictError("Event is fully booked");
      }

      const existing = await EventRegistrationRepository.findByEventAndStudent(
        eventId,
        studentId,
      );
      if (existing && existing.status === "registered") {
        throw new ConflictError("Already registered for this event");
      }

      const paidAmount = Number(payload.paid_amount ?? 0);
      const ticketPrice = Number(event.ticketPrice ?? 0);

      const paymentStatus = event.isFree
        ? "not_applicable"
        : paidAmount >= ticketPrice
          ? "paid"
          : "pending";

      if (existing && existing.status === "cancelled") {
        const rejoined = await EventRegistrationRepository.updateById(
          existing.id,
          {
            status: "registered",
            cancelledAt: null,
            paymentStatus,
            ...(payload.transaction_id
              ? { transactionId: payload.transaction_id }
              : { transactionId: null }),
          },
          tx,
        );

        await EventRepository.incrementRegisteredCount(eventId, tx);
        return formatRegistration(rejoined, paidAmount);
      }

      const registration = await EventRegistrationRepository.create(
        {
          event: { connect: { id: eventId } },
          student: { connect: { id: studentId } },
          paymentStatus,
          ...(payload.transaction_id
            ? { transactionId: payload.transaction_id }
            : {}),
          status: "registered",
        },
        tx,
      );

      await EventRepository.incrementRegisteredCount(eventId, tx);

      return formatRegistration(registration, paidAmount);
    });
  }

  // ── Student: Cancel Registration ─────────────────────────

  static async cancelRegistration(eventId: string, studentId: string) {
    return prisma.$transaction(async (tx) => {
      const registration =
        await EventRegistrationRepository.findByEventAndStudent(
          eventId,
          studentId,
        );
      if (!registration) throw new NotFoundError("Registration not found");
      if (registration.status === "cancelled")
        throw new ConflictError("Registration already cancelled");

      const cancelled = await EventRegistrationRepository.cancelRegistration(
        registration.id,
        tx,
      );

      await EventRepository.decrementRegisteredCount(eventId, tx);

      return formatRegistration(cancelled);
    });
  }

  // ── Student: My Registered Events ────────────────────────

  static async listMyRegistrations(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ) {
    const { registrations, total } =
      await EventRegistrationRepository.findByStudentId(
        studentId,
        { status, search },
        page,
        limit,
      );

    return {
      registrations: registrations.map(formatRegistration),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  // ── Student: My Event Recordings ─────────────────────────

  static async listMyRecordings(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const { registrations, total } =
      await EventRegistrationRepository.findRegisteredEventsWithRecordings(
        studentId,
        page,
        limit,
        search,
      );

    return {
      recordings: registrations.map((reg: any) => ({
        registration_id: reg.id,
        event_id: reg.eventId,
        event_title: reg.event?.title,
        event_slug: reg.event?.slug,
        cover_image_url: reg.event?.coverImageUrl ?? null,
        category: reg.event?.category,
        speaker_name: reg.event?.speakerName ?? null,
        speaker_title: reg.event?.speakerTitle ?? null,
        organizer: reg.event?.organizer ?? null,
        event_date: reg.event?.eventDate,
        is_joined: reg.status === "registered",
        is_youtube_video: isYouTubeUrl(reg.event?.recordingUrl ?? null),
        recording_url: reg.event?.recordingUrl,
        recording_duration: reg.event?.recordingDuration ?? null,
        recorded_at: reg.event?.recordedAt ?? null,
        registered_at: reg.registeredAt,
      })),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }
}
