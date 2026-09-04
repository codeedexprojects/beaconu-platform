import { prisma, Prisma } from "@beaconu/db";
import type {
  ApplicationDocumentVerificationHistoryEntry,
  DocumentVerificationDetail,
  DocumentVerificationListItem,
  DocumentVerificationListResponse,
} from "@beaconu/types";
import { NotFoundError } from "@/shared/errors";
import { ApplicationDocumentRepository } from "../repositories/application-document.repository";

interface DocumentQueueFilters {
  page: number;
  limit: number;
  search?: string;
}

const QUEUE_SELECT = {
  id: true,
  applicationNumber: true,
  studentId: true,
  profilePhotoUrl: true,
  submittedAt: true,
  student: { select: { fullName: true } },
  documents: {
    select: {
      verificationStatus: true,
      verifiedAt: true,
      verificationHistory: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.ApplicationSelect;

type QueueRow = Prisma.ApplicationGetPayload<{ select: typeof QUEUE_SELECT }>;

function hasHistory(row: unknown): boolean {
  return Array.isArray(row) && row.length > 0;
}

function mapToListItem(row: QueueRow): DocumentVerificationListItem {
  const docs = row.documents;
  const lastUpdate = docs.reduce<Date | null>((latest, d) => {
    return !latest || d.updatedAt > latest ? d.updatedAt : latest;
  }, null);
  return {
    applicationId: row.id,
    applicationNumber: row.applicationNumber,
    studentId: row.studentId,
    studentName: row.student.fullName,
    profilePhotoUrl: row.profilePhotoUrl,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    lastDocumentUpdateAt: lastUpdate ? lastUpdate.toISOString() : null,
    totalDocuments: docs.length,
    verifiedCount: docs.filter((d) => d.verificationStatus === "approved")
      .length,
    pendingCount: docs.filter((d) => d.verificationStatus === "pending").length,
    rejectedCount: docs.filter((d) => d.verificationStatus === "rejected")
      .length,
  };
}

/** "Under review" = every document is still pending AND has never been
 * touched (no verifier, no rejection history) — genuinely untouched.
 * "Partially verified" = not fully verified and not untouched, i.e. at
 * least one document has been approved or rejected but not every document
 * is approved yet. Once every document is approved, an application drops
 * out of both buckets (no third "fully verified" list in this pass). */
function isUnderReview(row: QueueRow): boolean {
  return row.documents.every(
    (d) =>
      d.verificationStatus === "pending" &&
      !d.verifiedAt &&
      !hasHistory(d.verificationHistory),
  );
}

function isFullyVerified(row: QueueRow): boolean {
  return row.documents.every((d) => d.verificationStatus === "approved");
}

async function findSubmittedWithDocuments(
  collegeId: string,
  search: string | undefined,
): Promise<QueueRow[]> {
  return prisma.application.findMany({
    where: {
      collegeId,
      formStatus: "submitted",
      documents: { some: {} },
      ...(search && {
        OR: [
          {
            applicationNumber: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            student: {
              fullName: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    },
    select: QUEUE_SELECT,
    orderBy: { submittedAt: "desc" },
  });
}

function paginate(
  rows: QueueRow[],
  page: number,
  limit: number,
): DocumentVerificationListResponse {
  const total = rows.length;
  const skip = (page - 1) * limit;
  const pageRows = rows.slice(skip, skip + limit);
  return {
    applications: pageRows.map(mapToListItem),
    meta: { total, page, limit, hasNext: skip + pageRows.length < total },
  };
}

export class ApplicationDocumentVerificationQuery {
  static async listUnderReview(
    collegeId: string,
    filters: DocumentQueueFilters,
  ): Promise<DocumentVerificationListResponse> {
    const rows = await findSubmittedWithDocuments(collegeId, filters.search);
    return paginate(rows.filter(isUnderReview), filters.page, filters.limit);
  }

  static async listPartiallyVerified(
    collegeId: string,
    filters: DocumentQueueFilters,
  ): Promise<DocumentVerificationListResponse> {
    const rows = await findSubmittedWithDocuments(collegeId, filters.search);
    const partial = rows.filter(
      (row) => !isUnderReview(row) && !isFullyVerified(row),
    );
    return paginate(partial, filters.page, filters.limit);
  }

  static async getDetail(
    collegeId: string,
    applicationId: string,
  ): Promise<DocumentVerificationDetail> {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, collegeId },
      select: {
        id: true,
        applicationNumber: true,
        studentId: true,
        profilePhotoUrl: true,
        submittedAt: true,
        student: {
          select: { fullName: true, email: true, phoneNumber: true },
        },
        applicationCourses: {
          where: { isPrimary: true, status: { not: "withdrawn" } },
          select: { course: { select: { name: true } } },
          take: 1,
        },
      },
    });
    if (!application) throw new NotFoundError("Application not found");

    const documents =
      await ApplicationDocumentRepository.findUploadedByApplicationId(
        applicationId,
      );

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      studentId: application.studentId,
      studentName: application.student.fullName,
      studentEmail: application.student.email,
      studentPhone: application.student.phoneNumber,
      profilePhotoUrl: application.profilePhotoUrl,
      primaryCourseName: application.applicationCourses[0]?.course.name ?? null,
      submittedAt: application.submittedAt
        ? application.submittedAt.toISOString()
        : null,
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        documentCategory: d.documentCategory,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        verificationStatus: d.verificationStatus,
        rejectionReason: d.rejectionReason,
        verifiedByName: d.verifier?.fullName ?? null,
        verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
        resubmissionCount: d.resubmissionCount,
        verificationHistory: Array.isArray(d.verificationHistory)
          ? (d.verificationHistory as unknown as ApplicationDocumentVerificationHistoryEntry[])
          : [],
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
    };
  }
}
