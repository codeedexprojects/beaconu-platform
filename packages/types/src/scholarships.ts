export type ScholarshipDiscountType = "flat" | "percentage";
export type ScholarshipApplicationStatus = "pending" | "approved" | "rejected";

/** A scholarship "category" a college offers — college-admin defines the
 * name, discount, and which supporting documents it requires; students
 * apply against a specific one (optional, never required to proceed with
 * an application). */
export interface ScholarshipConfigItem {
  id: string;
  collegeId: string;
  name: string;
  scholarshipType: string;
  discountType: ScholarshipDiscountType;
  discountValue: string;
  /** Names of documents a student must attach when applying, e.g.
   * ["Income Certificate", "Caste Certificate"] — not files themselves,
   * just the checklist a student uploads against. */
  requiredDocuments: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScholarshipConfigInput {
  name: string;
  scholarship_type: string;
  discount_type: ScholarshipDiscountType;
  discount_value: number;
  required_documents: string[];
}

export type UpdateScholarshipConfigInput =
  Partial<CreateScholarshipConfigInput> & {
    is_active?: boolean;
  };

export interface ScholarshipSupportingDocument {
  documentName: string;
  fileUrl: string;
}

/** One student's request against one ScholarshipConfig, scoped to a whole
 * Application (not one specific course on it) — an Application can carry
 * several courses (via Add Course), each possibly at a different pipeline
 * stage, so the scholarship applies to all of them together. A student
 * with multiple separate Applications applies separately per Application. */
export interface ScholarshipApplicationItem {
  id: string;
  scholarshipConfigId: string;
  scholarshipName: string;
  studentId: string;
  studentName: string;
  applicationId: string;
  applicationNumber: string;
  /** Every non-withdrawn course on this application, not just the primary. */
  courseNames: string[];
  /** The student's own reason for applying — not an internal admin note
   * (see reviewRemarks for that). */
  reason: string;
  annualFamilyIncomeRange: string;
  supportingDocuments: ScholarshipSupportingDocument[];
  discountAmount: string | null;
  status: ScholarshipApplicationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewRemarks: string | null;
  createdAt: string;
}

export interface CreateScholarshipApplicationInput {
  scholarship_config_id: string;
  application_id: string;
  reason: string;
  annual_family_income_range: string;
  supporting_documents: ScholarshipSupportingDocument[];
}

export interface ReviewScholarshipApplicationInput {
  action: "approve" | "reject";
  /** Approve-only — defaults to the config's own discountValue if omitted,
   * lets the reviewer award a different amount for this specific student. */
  discount_amount?: number;
  review_remarks?: string;
}
