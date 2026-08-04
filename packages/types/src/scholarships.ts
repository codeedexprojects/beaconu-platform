export type ScholarshipDiscountType = "flat" | "percentage";
export type ScholarshipApplicationStatus = "pending" | "approved" | "rejected";

export interface ScholarshipConfigItem {
  id: string;
  collegeId: string;
  name: string;
  scholarshipType: string;
  discountType: ScholarshipDiscountType;
  discountValue: string;
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

export interface ScholarshipApplicationItem {
  id: string;
  scholarshipConfigId: string;
  scholarshipName: string;
  studentId: string;
  studentName: string;
  applicationId: string;
  applicationNumber: string;
  courseNames: string[];
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
  discount_amount?: number;
  review_remarks?: string;
}
