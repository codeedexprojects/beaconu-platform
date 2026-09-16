/** Platform-wide policy pages. The set is fixed: super admins edit these
 * documents, they never create new types. */
export const LEGAL_DOCUMENT_TYPES = [
  "terms_and_conditions",
  "privacy_policy",
  "refund_and_return_policy",
  "cancellation_policy",
  "shipping_and_delivery_policy",
] as const;

export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];

export const LEGAL_DOCUMENT_LABELS: Record<LegalDocumentType, string> = {
  terms_and_conditions: "Terms & Conditions",
  privacy_policy: "Privacy Policy",
  refund_and_return_policy: "Refund & Return Policy",
  cancellation_policy: "Cancellation Policy",
  shipping_and_delivery_policy: "Shipping & Delivery Policy",
};

export type LegalDocumentStatus = "draft" | "published";

export interface LegalDocument {
  id: string;
  docType: LegalDocumentType;
  title: string;
  /** HTML, rendered as-is by the website and app. */
  content: string;
  documentUrl: string | null;
  /** Bumped on every content change, for "last updated" messaging. */
  version: number;
  status: LegalDocumentStatus;
  effectiveFrom: string | null;
  publishedAt: string | null;
  updatedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One row per fixed type, whether or not it has been written yet. */
export interface LegalDocumentSlot {
  docType: LegalDocumentType;
  label: string;
  document: LegalDocument | null;
}

export interface UpsertLegalDocumentInput {
  title: string;
  content: string;
  document_url?: string | null;
  effective_from?: string | null;
  status?: LegalDocumentStatus;
}

export interface PublicLegalDocument {
  docType: LegalDocumentType;
  title: string;
  content: string;
  documentUrl: string | null;
  version: number;
  effectiveFrom: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

/** Same fixed types, written per college by college staff. A college's
 * documents sit alongside the platform ones; students see both. */
export interface CollegeLegalDocument {
  id: string;
  collegeId: string;
  docType: LegalDocumentType;
  title: string;
  content: string;
  documentUrl: string | null;
  version: number;
  status: LegalDocumentStatus;
  effectiveFrom: string | null;
  publishedAt: string | null;
  updatedByStaffId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollegeLegalDocumentSlot {
  docType: LegalDocumentType;
  label: string;
  document: CollegeLegalDocument | null;
}
