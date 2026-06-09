import { prisma } from "@beaconu/db";

const COUNSELLOR_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  counsellorType: true,
  status: true,
  rating: true,
  knownLanguages: true,
  sessionFee: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export class CounsellingRepository {
  static async findById(id: string) {
    return prisma.counsellor.findUnique({
      where: { id },
      select: COUNSELLOR_SELECT,
    });
  }

  static async findAll(
    filters: { counsellorType?: string; status?: string } = {},
  ) {
    return prisma.counsellor.findMany({
      where: {
        ...(filters.counsellorType
          ? { counsellorType: filters.counsellorType }
          : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      select: COUNSELLOR_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findActiveWithSlots(filters: {
    date?: Date;
    counsellorType?: string;
    page: number;
    limit: number;
  }) {
    const skip = (filters.page - 1) * filters.limit;

    const availabilityWhere = {
      isBooked: false,
      ...(filters.date ? { availableDate: filters.date } : {}),
    };

    const where = {
      status: "active",
      ...(filters.counsellorType
        ? { counsellorType: filters.counsellorType }
        : {}),
      ...(filters.date ? { availability: { some: availabilityWhere } } : {}),
    };

    const [counsellors, total] = await Promise.all([
      prisma.counsellor.findMany({
        where,
        select: {
          ...COUNSELLOR_SELECT,
          availability: {
            where: availabilityWhere,
            select: {
              id: true,
              availableDate: true,
              startTime: true,
              endTime: true,
              sessionDurationMins: true,
              sessionFee: true,
              isBooked: true,
            },
            orderBy: [{ availableDate: "asc" }, { startTime: "asc" }],
          },
        },
        orderBy: { rating: "desc" },
        skip,
        take: filters.limit,
      }),
      prisma.counsellor.count({ where }),
    ]);

    return { counsellors, total };
  }

  static async updateById(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      counsellorType?: string;
      knownLanguages?: string;
      sessionFee?: number;
    },
  ) {
    return prisma.counsellor.update({
      where: { id },
      data,
      select: COUNSELLOR_SELECT,
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.counsellor.update({
      where: { id },
      data: { status },
      select: COUNSELLOR_SELECT,
    });
  }
}
