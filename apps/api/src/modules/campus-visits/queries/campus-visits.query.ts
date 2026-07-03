import { prisma } from "@beaconu/db";
import type {
  CampusVisit,
  CampusVisitListItem,
  CampusVisitListResponse,
  PaginationMeta,
} from "@beaconu/types";
import type { CampusVisitListQuery } from "../validators/campus-visits.validator";

function mapAmbassador(
  ambassador: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    campusCode: string | null;
  } | null,
) {
  if (!ambassador) return null;
  return {
    id: ambassador.id,
    fullName: ambassador.fullName,
    avatarUrl: ambassador.avatarUrl,
    campusCode: ambassador.campusCode,
  };
}

function mapToListItem(v: {
  id: string;
  collegeId: string;
  studentName: string;
  email: string | null;
  phoneNumber: string | null;
  ambassador: {
    id: string;
    fullName: string;
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
  select: { id: true, fullName: true, avatarUrl: true, campusCode: true },
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
        include: { ambassador: ambassadorInclude },
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
    filters: CampusVisitListQuery,
  ): Promise<CampusVisitListResponse> {
    const { status, date, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ambassadorId,
      ...(status ? { status } : {}),
      ...(date ? { proposedDate: new Date(date) } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.campusVisit.count({ where }),
      prisma.campusVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { proposedDate: "asc" },
        include: { ambassador: ambassadorInclude },
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
        include: { ambassador: ambassadorInclude },
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
      rejectionReason: v.rejectionReason,
      reassignmentReason: v.reassignmentReason,
      previousProposedDate: v.previousProposedDate
        ? v.previousProposedDate.toISOString().split("T")[0]
        : null,
      previousProposedTime: v.previousProposedTime
        ? v.previousProposedTime.toISOString().split("T")[1].slice(0, 5)
        : null,
      rescheduledAt: v.rescheduledAt ? v.rescheduledAt.toISOString() : null,
      visitNotes: v.visitNotes,
      visitRating: v.visitRating,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }

  static async getCollegeStats(collegeId: string) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [today, pending, confirmed] = await Promise.all([
      prisma.campusVisit.count({
        where: { collegeId, proposedDate: todayStart },
      }),
      prisma.campusVisit.count({
        where: { collegeId, status: "pending" },
      }),
      prisma.campusVisit.count({
        where: { collegeId, status: "confirmed" },
      }),
    ]);

    return { today, pending, confirmed };
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
