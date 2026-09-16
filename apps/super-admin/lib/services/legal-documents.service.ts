import { api } from "@/lib/api";
import type {
  LegalDocument,
  LegalDocumentSlot,
  LegalDocumentStatus,
  LegalDocumentType,
  UpsertLegalDocumentInput,
} from "@beaconu/types";

const BASE = "/api/v1/admin/legal-documents";

export async function getLegalDocuments(): Promise<LegalDocumentSlot[]> {
  return api.get<LegalDocumentSlot[]>(BASE);
}

export async function saveLegalDocument(
  docType: LegalDocumentType,
  payload: UpsertLegalDocumentInput,
): Promise<LegalDocument> {
  return api.put<LegalDocument>(`${BASE}/${docType}`, payload);
}

export async function setLegalDocumentStatus(
  docType: LegalDocumentType,
  status: LegalDocumentStatus,
): Promise<LegalDocument> {
  return api.patch<LegalDocument>(`${BASE}/${docType}/status`, { status });
}
