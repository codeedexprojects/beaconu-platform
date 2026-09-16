import { api } from "@/lib/api";
import type {
  CollegeLegalDocument,
  CollegeLegalDocumentSlot,
  LegalDocumentStatus,
  LegalDocumentType,
  UpsertLegalDocumentInput,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/legal-documents";

export async function getLegalDocuments(): Promise<CollegeLegalDocumentSlot[]> {
  return api.get<CollegeLegalDocumentSlot[]>(BASE);
}

export async function saveLegalDocument(
  docType: LegalDocumentType,
  payload: UpsertLegalDocumentInput,
): Promise<CollegeLegalDocument> {
  return api.put<CollegeLegalDocument>(`${BASE}/${docType}`, payload);
}

export async function setLegalDocumentStatus(
  docType: LegalDocumentType,
  status: LegalDocumentStatus,
): Promise<CollegeLegalDocument> {
  return api.patch<CollegeLegalDocument>(`${BASE}/${docType}/status`, {
    status,
  });
}
