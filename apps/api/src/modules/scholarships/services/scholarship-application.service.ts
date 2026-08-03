import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { ScholarshipConfigRepository } from "../repositories/scholarship-config.repository";
import {
  ScholarshipApplicationRepository,
  type ScholarshipApplicationCreateData,
} from "../repositories/scholarship-application.repository";
import type {
  ReviewScholarshipApplicationInput,
  ScholarshipApplicationItem,
  ScholarshipSupportingDocument,
} from "@beaconu/types";

// Scholarship applications only make sense once a course is at least
// shortlisted (per the user's own admission-flow description: "after
// interview shortlist, the student can apply for scholarship") — earlier
// than that there's nothing to award a discount against yet. Same
// pipeline-stage set used elsewhere for "shortlisted or later". An
// Application can have several courses (added via Add Course), each at a
// different pipeline stage — ANY one of them reaching this set is enough,
// since the scholarship applies to the whole Application, not one course.
const SCHOLARSHIP_ELIGIBLE_STATUSES = new Set([
  "shortlisted",
  "offer_issued",
  "token_paid",
  "enrolled",
]);

type ApplicationRow = NonNullable<
  Awaited<ReturnType<typeof ScholarshipApplicationRepository.findById>>
>;

function mapApplication(row: ApplicationRow): ScholarshipApplicationItem {
  return {
    id: row.id,
    scholarshipConfigId: row.scholarshipConfigId,
    scholarshipName: row.scholarshipConfig.name,
    studentId: row.studentId,
    studentName: row.student.fullName,
    applicationId: row.applicationId,
    applicationNumber: row.application.applicationNumber,
    courseNames: row.application.applicationCourses.map((ac) => ac.course.name),
    reason: row.remarks ?? "",
    annualFamilyIncomeRange: row.annualFamilyIncomeRange,
    supportingDocuments:
      (row.supportingDocuments as unknown as
        | ScholarshipSupportingDocument[]
        | null) ?? [],
    discountAmount: row.discountAmount ? row.discountAmount.toString() : null,
    status: row.status as ScholarshipApplicationItem["status"],
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    reviewRemarks: row.reviewRemarks,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ScholarshipApplicationService {
  static async apply(
    studentId: string,
    data: Omit<ScholarshipApplicationCreateData, "studentId">,
  ) {
    const application =
      await ApplicationService.getForStudentWithCourseStatuses(
        data.applicationId,
        studentId,
      );
    const isEligible = application.courses.some((c) =>
      SCHOLARSHIP_ELIGIBLE_STATUSES.has(c.status),
    );
    if (!isEligible) {
      throw new ConflictError(
        "You can apply for a scholarship only after at least one course on this application has been shortlisted",
      );
    }

    const config = await ScholarshipConfigRepository.findById(
      data.scholarshipConfigId,
      application.collegeId,
    );
    if (!config || !config.isActive) {
      throw new NotFoundError("Scholarship not found");
    }

    const existing = await ScholarshipApplicationRepository.findExisting(
      data.scholarshipConfigId,
      studentId,
      data.applicationId,
    );
    if (existing) {
      throw new ConflictError(
        "You've already applied for this scholarship for this application",
      );
    }

    const row = await ScholarshipApplicationRepository.create({
      ...data,
      studentId,
    });
    return mapApplication(row);
  }

  static async listMine(studentId: string) {
    const rows =
      await ScholarshipApplicationRepository.listForStudent(studentId);
    return rows.map(mapApplication);
  }

  static async getMine(id: string, studentId: string) {
    const row = await ScholarshipApplicationRepository.findByIdForStudent(
      id,
      studentId,
    );
    if (!row) throw new NotFoundError("Scholarship application not found");
    return mapApplication(row);
  }

  static async listForCollege(collegeId: string, status?: string) {
    const rows = await ScholarshipApplicationRepository.listForCollege(
      collegeId,
      { status },
    );
    return rows.map(mapApplication);
  }

  static async review(
    collegeId: string,
    staffId: string,
    id: string,
    data: ReviewScholarshipApplicationInput,
  ) {
    const row = await ScholarshipApplicationRepository.findById(id);
    if (!row || row.scholarshipConfig.collegeId !== collegeId) {
      throw new NotFoundError("Scholarship application not found");
    }
    if (row.status !== "pending") {
      throw new ConflictError("This application has already been reviewed");
    }

    const updated = await ScholarshipApplicationRepository.review(id, {
      status: data.action === "approve" ? "approved" : "rejected",
      reviewedBy: staffId,
      discountAmount: data.discount_amount,
      reviewRemarks: data.review_remarks,
    });
    return mapApplication(updated);
  }
}
