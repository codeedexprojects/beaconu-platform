import { prisma } from "@beaconu/db";
import type { CreateSubmissionRequestInput } from "../validators/documents.validator";

export class DocumentSubmissionRequestRepository {
  static async create(
    collegeId: string,
    requestedBy: string,
    data: CreateSubmissionRequestInput,
  ) {
    return prisma.documentSubmissionRequest.create({
      data: {
        collegeId,
        studentId: data.student_id,
        requestedBy,
        documentCategory: data.document_category,
        documentName: data.document_name,
        instructions: data.instructions ?? null,
        deadline: new Date(data.deadline + "T00:00:00Z"),
        status: "pending",
      },
    });
  }

  static async findById(id: string) {
    return prisma.documentSubmissionRequest.findUnique({ where: { id } });
  }

  static async submitDocument(
    id: string,
    data: {
      fileUrl: string;
      fileName: string | null;
      fileSizeBytes: number | null;
    },
  ) {
    return prisma.documentSubmissionRequest.update({
      where: { id },
      data: {
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
        submittedAt: new Date(),
        status: "under_review",
        rejectionReason: null,
      },
    });
  }

  static async review(
    id: string,
    reviewedBy: string,
    status: "verified" | "rejected",
    rejectionReason: string | null,
  ) {
    return prisma.documentSubmissionRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }
}
