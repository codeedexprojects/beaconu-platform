import { NotFoundError } from "@/shared/errors";
import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_TYPES,
  type LegalDocument,
  type LegalDocumentSlot,
  type LegalDocumentType,
  type PublicLegalDocument,
} from "@beaconu/types";
import { LegalDocumentRepository } from "../repositories/legal-documents.repository";
import type {
  SetLegalDocumentStatusBody,
  UpsertLegalDocumentBody,
} from "../validators/legal-documents.validator";

type Row = Awaited<ReturnType<typeof LegalDocumentRepository.findByType>>;

function toDto(row: NonNullable<Row>): LegalDocument {
  return {
    id: row.id,
    docType: row.docType as LegalDocumentType,
    title: row.title,
    content: row.content,
    documentUrl: row.documentUrl,
    version: row.version,
    status: row.status as LegalDocument["status"],
    effectiveFrom: row.effectiveFrom
      ? row.effectiveFrom.toISOString().slice(0, 10)
      : null,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedByAdminId: row.updatedByAdminId,
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

export class LegalDocumentService {
  /** Every fixed type, with its document or null — so the admin screen can
   * list the ones still to be written. */
  static async listForAdmin(): Promise<LegalDocumentSlot[]> {
    const rows = await LegalDocumentRepository.findAll();
    return LEGAL_DOCUMENT_TYPES.map((docType) => {
      const row = rows.find((r) => r.docType === docType);
      return {
        docType,
        label: LEGAL_DOCUMENT_LABELS[docType],
        document: row ? toDto(row) : null,
      };
    });
  }

  static async getForAdmin(docType: LegalDocumentType): Promise<LegalDocument> {
    const row = await LegalDocumentRepository.findByType(docType);
    if (!row) throw new NotFoundError("Document not created yet");
    return toDto(row);
  }

  static async upsert(
    docType: LegalDocumentType,
    data: UpsertLegalDocumentBody,
    adminId: string,
  ): Promise<LegalDocument> {
    const existing = await LegalDocumentRepository.findByType(docType);
    const status = data.status ?? existing?.status ?? "draft";
    // Version tracks content changes only, so a publish/unpublish or a title
    // fix doesn't make students think the terms themselves changed.
    const contentChanged = existing ? existing.content !== data.content : true;

    const row = await LegalDocumentRepository.upsert(docType, {
      title: data.title,
      content: data.content,
      documentUrl: data.document_url ?? null,
      effectiveFrom: data.effective_from ? new Date(data.effective_from) : null,
      status,
      publishedAt:
        status === "published" ? (existing?.publishedAt ?? new Date()) : null,
      version: existing ? existing.version + (contentChanged ? 1 : 0) : 1,
      updatedByAdminId: adminId,
    });
    return toDto(row);
  }

  static async setStatus(
    docType: LegalDocumentType,
    data: SetLegalDocumentStatusBody,
    adminId: string,
  ): Promise<LegalDocument> {
    const existing = await LegalDocumentRepository.findByType(docType);
    if (!existing) throw new NotFoundError("Document not created yet");

    const row = await LegalDocumentRepository.updateStatus(docType, {
      status: data.status,
      publishedAt:
        data.status === "published"
          ? (existing.publishedAt ?? new Date())
          : null,
      updatedByAdmin: { connect: { id: adminId } },
    });
    return toDto(row);
  }

  static async listPublic(): Promise<PublicLegalDocument[]> {
    const rows = await LegalDocumentRepository.findPublished();
    return rows.map(toPublicDto);
  }

  static async getPublic(
    docType: LegalDocumentType,
  ): Promise<PublicLegalDocument> {
    const row = await LegalDocumentRepository.findPublishedByType(docType);
    if (!row) throw new NotFoundError("Document not found");
    return toPublicDto(row);
  }
}
