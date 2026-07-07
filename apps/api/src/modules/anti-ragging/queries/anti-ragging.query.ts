import { prisma } from "@beaconu/db";
import type { PaginationMeta } from "@beaconu/types";

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function toTimeStr(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().split("T")[1]!.slice(0, 5);
}

function mapComplaint(row: {
  id: string;
  complaintNumber: string;
  collegeId: string;
  studentId: string;
  incidentType: string;
  subject: string;
  individualsInvolved: unknown;
  incidentDate: Date;
  incidentTime: Date | null;
  description: string;
  isAnonymous: boolean;
  attachments: unknown;
  status: string;
  statusHistory: unknown;
  assignedTo: string | null;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  student?: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  assignee?: { id: string; fullName: string } | null;
}) {
  return {
    id: row.id,
    complaintNumber: row.complaintNumber,
    collegeId: row.collegeId,
    studentId: row.studentId,
    incidentType: row.incidentType as
      | "verbal"
      | "physical"
      | "mental"
      | "cyber",
    subject: row.subject,
    individualsInvolved: Array.isArray(row.individualsInvolved)
      ? row.individualsInvolved
      : [],
    incidentDate: toDateStr(row.incidentDate),
    incidentTime: toTimeStr(row.incidentTime),
    description: row.description,
    isAnonymous: row.isAnonymous,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    status: row.status as
      | "submitted"
      | "acknowledged"
      | "investigating"
      | "resolved",
    statusHistory: Array.isArray(row.statusHistory) ? row.statusHistory : [],
    assignedTo: row.assignedTo,
    resolution: row.resolution,
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    student: row.student ?? null,
    assignee: row.assignee ?? null,
  };
}

function mapComplaintSummary(row: {
  id: string;
  complaintNumber: string;
  subject: string;
  incidentDate: Date;
  status: string;
}) {
  return {
    id: row.id,
    complaintNumber: row.complaintNumber,
    subject: row.subject,
    incidentDate: toDateStr(row.incidentDate),
    status: row.status as
      | "submitted"
      | "acknowledged"
      | "investigating"
      | "resolved",
  };
}

export class AntiRaggingQuery {
  static async listForStudent(
    studentId: string,
    filters: { status?: string; search?: string; page: number; limit: number },
  ) {
    const where = {
      studentId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                subject: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                complaintNumber: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };
    const skip = (filters.page - 1) * filters.limit;

    const [total, rows] = await Promise.all([
      prisma.antiRaggingComplaint.count({ where }),
      prisma.antiRaggingComplaint.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          complaintNumber: true,
          subject: true,
          incidentDate: true,
          status: true,
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { complaints: rows.map(mapComplaintSummary), meta };
  }

  static async getForStudent(id: string, studentId: string) {
    const row = await prisma.antiRaggingComplaint.findUnique({
      where: { id },
    });
    if (!row || row.studentId !== studentId) return null;
    return mapComplaint(row);
  }

  static async listForCollege(
    collegeId: string,
    filters: {
      status?: string;
      incident_type?: string;
      search?: string;
      page: number;
      limit: number;
    },
  ) {
    const where = {
      collegeId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.incident_type ? { incidentType: filters.incident_type } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                subject: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                complaintNumber: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };
    const skip = (filters.page - 1) * filters.limit;

    const [total, rows] = await Promise.all([
      prisma.antiRaggingComplaint.count({ where }),
      prisma.antiRaggingComplaint.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          assignee: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { complaints: rows.map(mapComplaint), meta };
  }

  static async getForCollege(id: string, collegeId: string) {
    const row = await prisma.antiRaggingComplaint.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, phoneNumber: true },
        },
        assignee: { select: { id: true, fullName: true } },
      },
    });
    if (!row || row.collegeId !== collegeId) return null;
    return mapComplaint(row);
  }
}
