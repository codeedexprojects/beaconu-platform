import { prisma } from "@beaconu/db";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PaginationOptions {
  page?: number;
  limit?: number;
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
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  // ── SLOTS ─────────────────────────────────────────────────

  static async createSlot(data: {
    counsellorId: string;
    availableDate: Date;
    startTime: Date;
    endTime: Date;
    sessionDurationMins: number;
  }) {
    return prisma.counsellorAvailability.create({ data });
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
        counsellor: { select: { id: true, fullName: true, email: true } },
        availability: true,
        reschedules: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  /** Paginated session list for a student (newest first). */
  static async listSessionsByStudent(
    studentId: string,
    pagination: PaginationOptions = {},
  ) {
    return prisma.counsellingSession.findMany({
      where: { studentId },
      include: {
        counsellor: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            counsellorType: true,
          },
        },
        availability: true,
      },
      orderBy: { scheduledDate: "desc" },
      ...this.paginate(pagination),
    });
  }

  /** Paginated session list for a counsellor (newest first). */
  static async listSessionsByCounsellor(
    counsellorId: string,
    pagination: PaginationOptions = {},
  ) {
    return prisma.counsellingSession.findMany({
      where: { counsellorId },
      include: {
        student: { select: { id: true, fullName: true, avatarUrl: true } },
        availability: true,
      },
      orderBy: { scheduledDate: "desc" },
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
}
