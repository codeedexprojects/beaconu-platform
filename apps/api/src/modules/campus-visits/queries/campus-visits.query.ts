import { prisma } from "@beaconu/db";
import type {
  CampusVisit,
  CampusVisitCalendarDay,
  CampusVisitListItem,
  CampusVisitListResponse,
  PaginationMeta,
} from "@beaconu/types";
import type { CampusVisitListQuery } from "../validators/campus-visits.validator";
import { CampusVisitAvailabilityRepository } from "../repositories/campus-visit-availability.repository";
import { CampusVisitDateOverrideRepository } from "../repositories/campus-visit-date-override.repository";

function mapAmbassador(
  ambassador: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    campusCode: string | null;
  } | null,
) {
  if (!ambassador) return null;
  return {
    id: ambassador.id,
    fullName: ambassador.fullName,
    phoneNumber: ambassador.phoneNumber,
    avatarUrl: ambassador.avatarUrl,
    campusCode: ambassador.campusCode,
  };
}

function mapCollege(college: {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
}) {
  return {
    id: college.id,
    name: college.name,
    address: college.address,
    city: college.city,
    district: college.district,
    state: college.state,
    pinCode: college.pinCode,
  };
}

function mapToListItem(v: {
  id: string;
  collegeId: string;
  college: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    pinCode: string | null;
  };
  studentName: string;
  email: string | null;
  phoneNumber: string | null;
  ambassador: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    campusCode: string | null;
  } | null;
  proposedDate: Date;
  proposedTime: Date;
  status: string;
  reasonForVisit: string | null;
  additionalVisitorsCount: number;
  cancellationReason: string | null;
  createdAt: Date;
}): CampusVisitListItem {
  return {
    id: v.id,
    collegeId: v.collegeId,
    college: mapCollege(v.college),
    studentName: v.studentName,
    email: v.email,
    phoneNumber: v.phoneNumber,
    ambassador: mapAmbassador(v.ambassador),
    proposedDate: v.proposedDate.toISOString().split("T")[0],
    proposedTime: v.proposedTime.toISOString().split("T")[1].slice(0, 5),
    status: v.status as CampusVisitListItem["status"],
    reasonForVisit: v.reasonForVisit,
    additionalVisitorsCount: v.additionalVisitorsCount,
    cancellationReason: v.cancellationReason,
    createdAt: v.createdAt.toISOString(),
  };
}

const ambassadorInclude = {
  select: {
    id: true,
    fullName: true,
    phoneNumber: true,
    avatarUrl: true,
    campusCode: true,
  },
};

const collegeInclude = {
  select: {
    id: true,
    name: true,
    address: true,
    city: true,
    district: true,
    state: true,
    pinCode: true,
  },
};

export class CampusVisitsQuery {
  static async listByStudent(
    studentId: string,
    filters: CampusVisitListQuery,
  ): Promise<CampusVisitListResponse> {
    const { status, date, college_id, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      studentId,
      ...(status ? { status } : {}),
      ...(date ? { proposedDate: new Date(date) } : {}),
      ...(college_id ? { collegeId: college_id } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.campusVisit.count({ where }),
      prisma.campusVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { proposedDate: "asc" },
        include: { ambassador: ambassadorInclude, college: collegeInclude },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };

    return { visits: rows.map(mapToListItem), meta };
  }

  static async listByAmbassador(
    ambassadorId: string,
    collegeId: string,
    filters: CampusVisitListQuery,
  ): Promise<CampusVisitListResponse> {
    const { status, date, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(date ? { proposedDate: new Date(date) } : {}),
      OR: [
        { ambassadorId },
        { status: "arrived", ambassadorId: null, collegeId },
      ],
    };

    const [total, rows] = await Promise.all([
      prisma.campusVisit.count({ where }),
      prisma.campusVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { proposedDate: "asc" },
        include: { ambassador: ambassadorInclude, college: collegeInclude },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };

    return { visits: rows.map(mapToListItem), meta };
  }

  static async listByCollege(
    collegeId: string,
    filters: CampusVisitListQuery,
  ): Promise<CampusVisitListResponse> {
    const { status, date, ambassador_id, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      collegeId,
      ...(status ? { status } : {}),
      ...(date ? { proposedDate: new Date(date) } : {}),
      ...(ambassador_id ? { ambassadorId: ambassador_id } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.campusVisit.count({ where }),
      prisma.campusVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { proposedDate: "asc" },
        include: { ambassador: ambassadorInclude, college: collegeInclude },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };

    return { visits: rows.map(mapToListItem), meta };
  }

  /** One composed read for the whole month calendar — every date gets its
   * weekday-off/holiday state, active booking count vs. capacity, and its
   * actual visits embedded directly (bounded by capacity, realistically
   * small per day) so clicking a calendar cell needs no extra round-trip. */
  static async getMonthCalendar(
    collegeId: string,
    year: number,
    month: number,
  ): Promise<CampusVisitCalendarDay[]> {
    const pad = (n: number) => String(n).padStart(2, "0");
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const startDate = `${year}-${pad(month)}-01`;
    const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

    const [visits, availabilityRows, overrides] = await Promise.all([
      prisma.campusVisit.findMany({
        where: {
          collegeId,
          proposedDate: {
            gte: new Date(startDate + "T00:00:00Z"),
            lte: new Date(endDate + "T00:00:00Z"),
          },
        },
        include: { ambassador: ambassadorInclude, college: collegeInclude },
        orderBy: { proposedDate: "asc" },
      }),
      CampusVisitAvailabilityRepository.listByCollege(collegeId),
      CampusVisitDateOverrideRepository.listForCollegeInRange(
        collegeId,
        startDate,
        endDate,
      ),
    ]);

    const availabilityByWeekday = new Map(
      availabilityRows.map((a) => [a.weekday, a]),
    );
    const overrideByDate = new Map(
      overrides.map((o) => [o.date.toISOString().split("T")[0], o]),
    );
    const visitsByDate = new Map<string, typeof visits>();
    for (const v of visits) {
      const dateStr = v.proposedDate.toISOString().split("T")[0]!;
      const bucket = visitsByDate.get(dateStr) ?? [];
      bucket.push(v);
      visitsByDate.set(dateStr, bucket);
    }

    const days: CampusVisitCalendarDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month)}-${pad(d)}`;
      const weekday = new Date(dateStr + "T00:00:00Z").getUTCDay();
      const availability = availabilityByWeekday.get(weekday);
      const override = overrideByDate.get(dateStr);
      const dayVisits = visitsByDate.get(dateStr) ?? [];
      const activeCount = dayVisits.filter(
        (v) => v.status !== "cancelled",
      ).length;

      days.push({
        date: dateStr,
        isWeekdayOff: !availability || availability.isOff,
        isHoliday: !!override,
        holidayReason: override?.reason ?? null,
        holidayOverrideId: override?.id ?? null,
        bookingCount: activeCount,
        capacity: availability?.maxCapacity ?? 0,
        visits: dayVisits.map(mapToListItem),
      });
    }
    return days;
  }

  static async getDetail(id: string): Promise<CampusVisit | null> {
    const v = await prisma.campusVisit.findUnique({
      where: { id },
      include: { ambassador: ambassadorInclude },
    });
    if (!v) return null;

    return {
      id: v.id,
      collegeId: v.collegeId,
      studentId: v.studentId,
      ambassador: mapAmbassador(v.ambassador),
      studentName: v.studentName,
      email: v.email,
      phoneNumber: v.phoneNumber,
      courseInterest: v.courseInterest,
      additionalVisitorsCount: v.additionalVisitorsCount,
      guests: v.guests as CampusVisit["guests"],
      reasonForVisit: v.reasonForVisit,
      proposedDate: v.proposedDate.toISOString().split("T")[0],
      proposedTime: v.proposedTime.toISOString().split("T")[1].slice(0, 5),
      status: v.status as CampusVisit["status"],
      cancellationReason: v.cancellationReason,
      reassignmentReason: v.reassignmentReason,
      previousProposedDate: v.previousProposedDate
        ? v.previousProposedDate.toISOString().split("T")[0]
        : null,
      previousProposedTime: v.previousProposedTime
        ? v.previousProposedTime.toISOString().split("T")[1].slice(0, 5)
        : null,
      rescheduledAt: v.rescheduledAt ? v.rescheduledAt.toISOString() : null,
      arrivedAt: v.arrivedAt ? v.arrivedAt.toISOString() : null,
      visitNotes: v.visitNotes,
      visitRating: v.visitRating,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }

  static async getCollegeStats(collegeId: string) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [today, pending, arrived, confirmed] = await Promise.all([
      prisma.campusVisit.count({
        where: { collegeId, proposedDate: todayStart },
      }),
      prisma.campusVisit.count({
        where: { collegeId, status: "pending" },
      }),
      prisma.campusVisit.count({
        where: { collegeId, status: "arrived" },
      }),
      prisma.campusVisit.count({
        where: { collegeId, status: "confirmed" },
      }),
    ]);

    return { today, pending, arrived, confirmed };
  }

  static async listAmbassadorsForCollege(collegeId: string) {
    return prisma.blinkUser.findMany({
      where: {
        collegeId,
        status: "active",
        blinkRole: { slug: "campus_ambassador" },
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        campusCode: true,
        ambassadorType: true,
      },
      orderBy: { fullName: "asc" },
    });
  }
}
