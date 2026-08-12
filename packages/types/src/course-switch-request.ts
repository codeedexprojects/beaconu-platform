export type CourseSwitchRequestStatus = "pending" | "approved" | "rejected";

export interface CourseSwitchRequestItem {
  id: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  collegeId: string;
  enrollmentId: string;
  fromCourseName: string;
  fromCourseCode: string;
  toCourseId: string;
  toCourseName: string;
  toCourseCode: string;
  reason: string;
  supportingDocUrls: string[];
  status: CourseSwitchRequestStatus;
  processedBy: string | null;
  remarks: string | null;
  processedAt: string | null;
  newEnrollmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestCourseSwitchInput {
  to_course_id: string;
  reason: string;
  supporting_doc_urls?: string[];
}

export interface ReviewCourseSwitchInput {
  decision: "approve" | "reject";
  remarks?: string;
}

export interface CourseSwitchRequestListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CourseSwitchRequestListResponse {
  requests: CourseSwitchRequestItem[];
  meta: CourseSwitchRequestListMeta;
}
