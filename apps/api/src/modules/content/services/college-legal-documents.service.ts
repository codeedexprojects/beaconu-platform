import { NotFoundError } from "@/shared/errors";
import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_TYPES,
  type CollegeLegalDocument,
  type CollegeLegalDocumentSlot,
  type LegalDocumentType,
  type PublicLegalDocument,
} from "@beaconu/types";
import { CollegeLegalDocumentRepository } from "../repositories/college-legal-documents.repository";
import type {
  SetLegalDocumentStatusBody,
  UpsertLegalDocumentBody,
} from "../validators/legal-documents.validator";

type Row = Awaited<
  ReturnType<typeof CollegeLegalDocumentRepository.findByType>
>;

function toDto(row: NonNullable<Row>): CollegeLegalDocument {
  return {
    id: row.id,
    collegeId: row.collegeId,
    docType: row.docType as LegalDocumentType,
    title: row.title,
    content: row.content,
    documentUrl: row.documentUrl,
    version: row.version,
    status: row.status as CollegeLegalDocument["status"],
    effectiveFrom: row.effectiveFrom
      ? row.effectiveFrom.toISOString().slice(0, 10)
      : null,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedByStaffId: row.updatedByStaffId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPublicDto(row: NonNullable<Row>): PublicLegalDocument {
  const dto = toDto(row);
  return {
    docType: dto.docType,
    title: dto.title,
    content: dto.content,
    documentUrl: dto.documentUrl,
    version: dto.version,
    effectiveFrom: dto.effectiveFrom,
    publishedAt: dto.publishedAt,
    updatedAt: dto.updatedAt,
  };
}

export class CollegeLegalDocumentService {
  static async listForCollegeAdmin(
    collegeId: string,
  ): Promise<CollegeLegalDocumentSlot[]> {
    const rows =
      await CollegeLegalDocumentRepository.findAllForCollege(collegeId);
    return LEGAL_DOCUMENT_TYPES.map((docType) => {
      const row = rows.find((r) => r.docType === docType);
      return {
        docType,
        label: LEGAL_DOCUMENT_LABELS[docType],
        document: row ? toDto(row) : null,
      };
    });
  }

  static async getForCollegeAdmin(
    collegeId: string,
    docType: LegalDocumentType,
  ): Promise<CollegeLegalDocument> {
    const row = await CollegeLegalDocumentRepository.findByType(
      collegeId,
      docType,
    );
    if (!row) throw new NotFoundError("Document not created yet");
    return toDto(row);
  }

  static async upsert(
    collegeId: string,
    docType: LegalDocumentType,
    data: UpsertLegalDocumentBody,
    staffId: string,
  ): Promise<CollegeLegalDocument> {
    const existing = await CollegeLegalDocumentRepository.findByType(
      collegeId,
      docType,
    );
    const status = data.status ?? existing?.status ?? "draft";
    const contentChanged = existing ? existing.content !== data.content : true;

    const row = await CollegeLegalDocumentRepository.upsert(
      collegeId,
      docType,
      {
        title: data.title,
        content: data.content,
        documentUrl: data.document_url ?? null,
        effectiveFrom: data.effective_from
          ? new Date(data.effective_from)
          : null,
        status,
        publishedAt:
          status === "published" ? (existing?.publishedAt ?? new Date()) : null,
        version: existing ? existing.version + (contentChanged ? 1 : 0) : 1,
        updatedByStaffId: staffId,
      },
    );
    return toDto(row);
  }

  static async setStatus(
    collegeId: string,
    docType: LegalDocumentType,
    data: SetLegalDocumentStatusBody,
    staffId: string,
  ): Promise<CollegeLegalDocument> {
    const existing = await CollegeLegalDocumentRepository.findByType(
      collegeId,
      docType,
    );
    if (!existing) throw new NotFoundError("Document not created yet");

    const row = await CollegeLegalDocumentRepository.updateStatus(
      collegeId,
      docType,
      {
        status: data.status,
        publishedAt:
          data.status === "published"
            ? (existing.publishedAt ?? new Date())
            : null,
        updatedByStaff: { connect: { id: staffId } },
      },
    );
    return toDto(row);
  }

  static async listPublic(collegeId: string): Promise<PublicLegalDocument[]> {
    const rows =
      await CollegeLegalDocumentRepository.findPublishedForCollege(collegeId);
    return rows.map(toPublicDto);
  }

  static async getPublic(
    collegeId: string,
    docType: LegalDocumentType,
  ): Promise<PublicLegalDocument> {
    const row = await CollegeLegalDocumentRepository.findPublishedByType(
      collegeId,
      docType,
    );
    if (!row) throw new NotFoundError("Document not found");
    return toPublicDto(row);
  }
}
