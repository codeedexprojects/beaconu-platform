import { prisma } from "@beaconu/db";
import type { PaginationMeta } from "@beaconu/types";

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function mapSubmissionRequest(row: {
  id: string;
  collegeId: string;
  studentId: string;
  documentCategory: string;
  documentName: string;
  instructions: string | null;
  deadline: Date;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  submittedAt: Date | null;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  statusHistory: unknown;
  createdAt: Date;
  student?: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  college?: { id: string; name: string; logoUrl: string | null };
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    studentId: row.studentId,
    documentCategory: row.documentCategory as
      | "academic"
      | "identification"
      | "financial"
      | "medical"
      | "administrative"
      | "other",
    documentName: row.documentName,
    instructions: row.instructions,
    deadline: toDateStr(row.deadline),
    status: row.status as "pending" | "under_review" | "verified" | "rejected",
    fileUrl: row.fileUrl,
    fileName: row.fileName,
    fileSizeBytes: row.fileSizeBytes,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    rejectionReason: row.rejectionReason,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    statusHistory: Array.isArray(row.statusHistory) ? row.statusHistory : [],
    createdAt: row.createdAt.toISOString(),
    student: row.student ?? null,
    college: row.college ?? null,
  };
}

function deriveDisplayStatus(
  status: string,
  deliveryMode: string,
  resubmissionCount: number,
): string {
  if (status === "submitted" && resubmissionCount > 0) return "resubmitted";
  if (status === "processing") return "under_review";
  if (status === "issued") {
    return deliveryMode === "digital"
      ? "ready_for_download"
      : "ready_to_collect";
  }
  return status;
}

function mapDocumentRequest(row: {
  id: string;
  requestNumber: string;
  collegeId: string;
  studentId: string;
  documentName: string;
  description: string | null;
  deliveryMode: string;
  status: string;
  rejectionReason: string | null;
  resubmissionCount: number;
  resubmissionHistory: unknown;
  supportingDocuments: unknown;
  statusHistory: unknown;
  pickupInstructions: string | null;
  officeContactPhone: string | null;
  issuedDocumentUrl: string | null;
  issuedAt: Date | null;
  createdAt: Date;
  student?: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  college?: { id: string; name: string; logoUrl: string | null };
}) {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    collegeId: row.collegeId,
    studentId: row.studentId,
    documentName: row.documentName,
    description: row.description,
    deliveryMode: row.deliveryMode as "digital" | "pickup" | "courier",
    status: row.status as
      | "submitted"
      | "processing"
      | "awaiting_approval"
      | "approved"
      | "rejected"
      | "issued"
      | "collected",
    displayStatus: deriveDisplayStatus(
      row.status,
      row.deliveryMode,
      row.resubmissionCount,
    ),
    rejectionReason: row.rejectionReason,
    resubmissionCount: row.resubmissionCount,
    resubmissionHistory: Array.isArray(row.resubmissionHistory)
      ? row.resubmissionHistory
      : [],
    supportingDocuments: Array.isArray(row.supportingDocuments)
      ? row.supportingDocuments
      : [],
    statusHistory: Array.isArray(row.statusHistory) ? row.statusHistory : [],
    pickupInstructions: row.pickupInstructions,
    officeContactPhone: row.officeContactPhone,
    issuedDocumentUrl: row.issuedDocumentUrl,
    issuedAt: row.issuedAt ? row.issuedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    student: row.student ?? null,
    college: row.college ?? null,
  };
}

function mapDocumentTemplate(row: {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  category: string;
  instructions: string | null;
  description: string | null;
  isStandard: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    name: row.name,
    slug: row.slug,
    category: row.category as
      | "academic"
      | "identification"
      | "financial"
      | "medical"
      | "administrative"
      | "other",
    instructions: row.instructions,
    description: row.description,
    isStandard: row.isStandard,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DocumentsQuery {
  static async listSubmissionRequestsForStudent(
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
                documentName: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                documentCategory: {
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
      prisma.documentSubmissionRequest.count({ where }),
      prisma.documentSubmissionRequest.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: {
          college: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { requests: rows.map(mapSubmissionRequest), meta };
  }

  static async listSubmissionRequestsForCollege(
    collegeId: string,
    filters: {
      status?: string;
      studentId?: string;
      page: number;
      limit: number;
    },
  ) {
    const where = {
      collegeId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.studentId ? { studentId: filters.studentId } : {}),
    };
    const skip = (filters.page - 1) * filters.limit;

    const [total, rows] = await Promise.all([
      prisma.documentSubmissionRequest.count({ where }),
      prisma.documentSubmissionRequest.findMany({
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
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { requests: rows.map(mapSubmissionRequest), meta };
  }

  static async listDocumentRequestsForStudent(
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
                documentName: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                requestNumber: {
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
      prisma.documentRequest.count({ where }),
      prisma.documentRequest.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: {
          college: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { requests: rows.map(mapDocumentRequest), meta };
  }

  static async getDocumentRequestForStudent(id: string, studentId: string) {
    const row = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        college: { select: { id: true, name: true, logoUrl: true } },
      },
    });
    if (!row || row.studentId !== studentId) return null;
    return mapDocumentRequest(row);
  }

  static async listDocumentRequestsForCollege(
    collegeId: string,
    filters: {
      status?: string;
      studentId?: string;
      page: number;
      limit: number;
    },
  ) {
    const where = {
      collegeId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.studentId ? { studentId: filters.studentId } : {}),
    };
    const skip = (filters.page - 1) * filters.limit;

    const [total, rows] = await Promise.all([
      prisma.documentRequest.count({ where }),
      prisma.documentRequest.findMany({
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
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { requests: rows.map(mapDocumentRequest), meta };
  }

  static async listTemplatesForCollege(
    collegeId: string,
    includeInactive: boolean,
  ) {
    const rows = await prisma.documentTemplate.findMany({
      where: {
        collegeId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(mapDocumentTemplate);
  }
}
