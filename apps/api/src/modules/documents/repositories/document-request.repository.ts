import { randomUUID } from "crypto";
import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";
import type { CreateDocumentRequestInput } from "../validators/documents.validator";

export class DocumentRequestRepository {
  static async create(
    studentId: string,
    collegeId: string,
    data: CreateDocumentRequestInput,
  ) {
    const supportingDocuments: Prisma.InputJsonValue = (
      data.supporting_documents ?? []
    ).map((doc) => ({
      url: doc.url,
      name: doc.name ?? null,
      sizeBytes: doc.size_bytes ?? null,
    }));

    return prisma.documentRequest.create({
      data: {
        requestNumber: `DOC-${randomUUID().slice(0, 8).toUpperCase()}`,
        studentId,
        collegeId,
        documentName: data.document_name,
        description: data.description ?? null,
        deliveryMode: data.delivery_mode,
        supportingDocuments,
        status: "submitted",
      },
    });
  }

  static async findById(id: string) {
    return prisma.documentRequest.findUnique({ where: { id } });
  }

  static async updateStatus(
    id: string,
    status: "processing" | "awaiting_approval" | "approved",
    processedBy: string,
  ) {
    return prisma.documentRequest.update({
      where: { id },
      data: { status, processedBy },
    });
  }

  static async reject(
    id: string,
    processedBy: string,
    rejectionReason: string,
  ) {
    return prisma.documentRequest.update({
      where: { id },
      data: { status: "rejected", rejectionReason, processedBy },
    });
  }

  static async resubmit(
    id: string,
    data: {
      documentName?: string;
      description?: string;
      deliveryMode?: string;
    },
    historyEntry: Prisma.InputJsonValue,
    resubmissionCount: number,
    resubmissionHistory: Prisma.JsonValue[],
  ) {
    return prisma.documentRequest.update({
      where: { id },
      data: {
        ...(data.documentName !== undefined && {
          documentName: data.documentName,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.deliveryMode !== undefined && {
          deliveryMode: data.deliveryMode,
        }),
        status: "submitted",
        rejectionReason: null,
        processedBy: null,
        resubmissionCount,
        resubmissionHistory: [
          ...resubmissionHistory,
          historyEntry,
        ] as Prisma.InputJsonValue,
      },
    });
  }

  static async issue(
    id: string,
    processedBy: string,
    data: {
      documentUrl: string;
      fileName: string | null;
      fileSizeBytes: number | null;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.documentRequest.update({
        where: { id },
        data: {
          status: "issued",
          processedBy,
          issuedDocumentUrl: data.documentUrl,
          issuedAt: new Date(),
        },
      });

      const issued = await tx.issuedDocument.create({
        data: {
          documentRequestId: id,
          studentId: request.studentId,
          collegeId: request.collegeId,
          documentName: request.documentName,
          documentUrl: data.documentUrl,
          fileName: data.fileName,
          fileSizeBytes: data.fileSizeBytes,
          deliveryMode: request.deliveryMode,
          issuedBy: processedBy,
        },
      });

      return { request, issued };
    });
  }
}
