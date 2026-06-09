import { prisma } from "@beaconu/db";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface SessionFilters {
  date?: Date;
  status?: string;
  search?: string;
}

interface SlotFilters {
  counsellorId?: string;
  fromDate?: Date;
  toDate?: Date; // ← NEW: always cap how far ahead you query
}

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export class SessionRepository {
  // ── HELPERS ───────────────────────────────────────────────

  /** Convert page/limit → Prisma skip/take */
  private static paginate({ page = 1, limit = 20 }: PaginationOptions) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    return {
      skip: (p - 1) * l,
      take: l,
    };
  }

  // ── SLOTS ─────────────────────────────────────────────────

  static async createSlot(data: {
    counsellorId: string;
    availableDate: Date;
    startTime: Date;
    endTime: Date;
    sessionDurationMins: number;
    sessionFee?: number;
  }) {
    return prisma.counsellorAvailability.create({ data });
  }

  static async createSlots(
    slots: Array<{
      counsellorId: string;
      availableDate: Date;
      startTime: Date;
      endTime: Date;
      sessionDurationMins: number;
      sessionFee: number;
    }>,
  ) {
    return prisma.$transaction(
      slots.map((slot) => prisma.counsellorAvailability.create({ data: slot })),
    );
  }

  static async findSlotById(id: string) {
    return prisma.counsellorAvailability.findUnique({ where: { id } });
  }

  /**
   * All slots for a counsellor (paginated).
   * Default: page 1, 20 per page.
   */
  static async listSlotsByCounsellor(
    counsellorId: string,
    fromDate?: Date,
    pagination: PaginationOptions = {},
  ) {
    return prisma.counsellorAvailability.findMany({
      where: {
        counsellorId,
        ...(fromDate ? { availableDate: { gte: fromDate } } : {}),
      },
      orderBy: [{ availableDate: "asc" }, { startTime: "asc" }],
      ...this.paginate(pagination),
    });
  }

  /**
   * Available (unbooked) slots — always scoped to a date window
   * to avoid returning slots from years into the future.
   * Default window: today → +30 days.
   */
  static async listAvailableSlots(
    filters: SlotFilters,
    pagination: PaginationOptions = {},
  ) {
    const from = filters.fromDate ?? new Date();
    const to =
      filters.toDate ??
      (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
      })();

    return prisma.counsellorAvailability.findMany({
      where: {
        isBooked: false,
        availableDate: { gte: from, lte: to },
        ...(filters.counsellorId ? { counsellorId: filters.counsellorId } : {}),
      },
      include: {
        counsellor: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            counsellorType: true,
            rating: true,
            sessionFee: true,
            knownLanguages: true,
          },
        },
      },
      orderBy: [{ availableDate: "asc" }, { startTime: "asc" }],
      ...this.paginate(pagination),
    });
  }

  static async markSlotBooked(id: string, booked: boolean) {
    return prisma.counsellorAvailability.update({
      where: { id },
      data: { isBooked: booked },
    });
  }

  // ── SESSIONS ──────────────────────────────────────────────

  static async createSession(data: {
    studentId: string;
    counsellorId: string;
    availabilityId: string;
    sessionMode: string;
    sessionType: string;
    scheduledDate: Date;
    startTime: Date;
    endTime: Date;
    bookingReason?: string;
    sessionFee?: number;
  }) {
    return prisma.counsellingSession.create({ data });
  }

  static async findSessionById(id: string) {
    return prisma.counsellingSession.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        counsellor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            counsellorType: true,
            rating: true,
            sessionFee: true,
            knownLanguages: true,
          },
        },
        availability: true,
        reschedules: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  /** Paginated session list for a student (newest first). */
  static async listSessionsByStudent(
    studentId: string,
    filters: SessionFilters = {},
    pagination: PaginationOptions = {},
  ) {
    const search = filters.search?.trim();

    return prisma.counsellingSession.findMany({
      where: {
        studentId,
        ...(filters.date
          ? {
              scheduledDate: {
                gte: filters.date,
                lt: new Date(filters.date.getTime() + 24 * 60 * 60 * 1000),
              },
            }
          : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(search
          ? {
              OR: [
                { bookingReason: { contains: search, mode: "insensitive" } },
                { sessionType: { contains: search, mode: "insensitive" } },
                { sessionMode: { contains: search, mode: "insensitive" } },
                { status: { contains: search, mode: "insensitive" } },
                {
                  counsellor: {
                    OR: [
                      { fullName: { contains: search, mode: "insensitive" } },
                      { email: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        counsellor: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            counsellorType: true,
            rating: true,
            sessionFee: true,
            knownLanguages: true,
          },
        },
        availability: true,
      },
      orderBy: [{ scheduledDate: "desc" }, { startTime: "asc" }],
      ...this.paginate(pagination),
    });
  }

  /** Paginated session list for a counsellor (newest first). */
  static async listSessionsByCounsellor(
    counsellorId: string,
    filters: SessionFilters = {},
    pagination: PaginationOptions = {},
  ) {
    const search = filters.search?.trim();

    return prisma.counsellingSession.findMany({
      where: {
        counsellorId,
        ...(filters.date
          ? {
              scheduledDate: {
                gte: filters.date,
                lt: new Date(filters.date.getTime() + 24 * 60 * 60 * 1000),
              },
            }
          : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(search
          ? {
              OR: [
                { bookingReason: { contains: search, mode: "insensitive" } },
                { sessionType: { contains: search, mode: "insensitive" } },
                { sessionMode: { contains: search, mode: "insensitive" } },
                { status: { contains: search, mode: "insensitive" } },
                {
                  student: {
                    OR: [
                      { fullName: { contains: search, mode: "insensitive" } },
                      { email: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        student: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
        availability: true,
      },
      orderBy: [{ scheduledDate: "desc" }, { startTime: "asc" }],
      ...this.paginate(pagination),
    });
  }

  static async updateSession(
    id: string,
    data: Partial<{
      status: string;
      paymentStatus: string;
      transactionId: string;
      cancelledBy: string;
      cancellationReason: string;
      cancelledAt: Date;
      completedAt: Date;
      sessionNotes: string;
      meetingUrl: string;
      meetingId: string;
      availabilityId: string;
      scheduledDate: Date;
      startTime: Date;
      endTime: Date;
    }>,
  ) {
    return prisma.counsellingSession.update({ where: { id }, data });
  }

  // ── RESCHEDULE LOG ────────────────────────────────────────

  static async createReschedule(data: {
    sessionId: string;
    rescheduledBy: string;
    fromDate: Date;
    fromTime: Date;
    toAvailabilityId: string;
    toDate: Date;
    toTime: Date;
    reason?: string;
  }) {
    return prisma.sessionReschedule.create({ data });
  }

  // ── WALLET ────────────────────────────────────────────────

  static async findOrCreateWallet(counsellorId: string) {
    return prisma.counsellorWallet.upsert({
      where: { counsellorId },
      create: { counsellorId, balance: 0, totalEarned: 0, totalWithdrawn: 0 },
      update: {},
    });
  }

  /**
   * Credit the counsellor's wallet and record the transaction.
   * Uses a DB transaction so both writes succeed or fail together.
   * Re-fetches balance after update to avoid stale value in the log.
   */
  static async creditWallet(
    counsellorId: string,
    amount: number,
    sessionId: string,
    description: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Increment balance
      await tx.counsellorWallet.update({
        where: { counsellorId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
        },
      });

      // 2. Re-fetch to get the accurate post-update balance
      const wallet = await tx.counsellorWallet.findUniqueOrThrow({
        where: { counsellorId },
      });

      // 3. Record transaction
      await tx.counsellorWalletTransaction.create({
        data: {
          walletId: wallet.id,
          counsellorId,
          type: "credit",
          amount,
          description,
          sessionId,
          balanceAfter: wallet.balance,
          bankDetails: {},
        },
      });

      return wallet;
    });
  }

  /**
   * Debit the counsellor's wallet (e.g. refund to student).
   * Guards against going negative before touching the DB.
   */
  static async debitWallet(
    counsellorId: string,
    amount: number,
    sessionId: string,
    description: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Check balance first — never go negative
      const current = await tx.counsellorWallet.findUniqueOrThrow({
        where: { counsellorId },
      });

      if (Number(current.balance) < amount) {
        throw new Error(
          `Insufficient wallet balance. Available: ${current.balance}, Requested: ${amount}`,
        );
      }

      // 2. Decrement
      await tx.counsellorWallet.update({
        where: { counsellorId },
        data: { balance: { decrement: amount } },
      });

      // 3. Re-fetch accurate post-update balance
      const wallet = await tx.counsellorWallet.findUniqueOrThrow({
        where: { counsellorId },
      });

      // 4. Record transaction
      await tx.counsellorWalletTransaction.create({
        data: {
          walletId: wallet.id,
          counsellorId,
          type: "debit", // ← was "refund" — fixed
          amount,
          description,
          sessionId,
          balanceAfter: wallet.balance,
          bankDetails: {},
        },
      });

      return wallet;
    });
  }

  /**
   * Get wallet with the last 20 transactions.
   * Increase `take` or add cursor pagination if you need more.
   */
  static async getWallet(counsellorId: string) {
    return prisma.counsellorWallet.findUnique({
      where: { counsellorId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  }

  /**
   * Rates a counselling session and updates the counsellor's average rating.
   * Runs in a transaction to guarantee data consistency.
   */
  static async rateSessionAndRecalculateCounsellorRating(
    sessionId: string,
    counsellorId: string,
    rating: number,
    ratingFeedback?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Update the session rating
      const updatedSession = await tx.counsellingSession.update({
        where: { id: sessionId },
        data: {
          rating,
          ratingFeedback,
        },
      });

      // 2. Calculate the new average rating of the counsellor
      const aggregateResult = await tx.counsellingSession.aggregate({
        where: {
          counsellorId,
          rating: { not: null },
        },
        _avg: {
          rating: true,
        },
      });

      const average = aggregateResult._avg.rating ?? 0.0;

      // 3. Update the counsellor's rating field
      await tx.counsellor.update({
        where: { id: counsellorId },
        data: {
          rating: average,
        },
      });

      return updatedSession;
    });
  }
}
