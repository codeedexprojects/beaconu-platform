import { prisma } from "@beaconu/db";

const APPLICATION_SELECT = {
  id: true,
  scholarshipConfigId: true,
  scholarshipConfig: { select: { name: true, collegeId: true } },
  studentId: true,
  student: { select: { fullName: true } },
  applicationId: true,
  application: {
    select: {
      applicationNumber: true,
      applicationCourses: {
        where: { status: { not: "withdrawn" } },
        select: { course: { select: { name: true } } },
      },
    },
  },
  annualFamilyIncomeRange: true,
  supportingDocuments: true,
  remarks: true,
  discountAmount: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewRemarks: true,
  createdAt: true,
} as const;

export interface ScholarshipApplicationCreateData {
  scholarshipConfigId: string;
  studentId: string;
  applicationId: string;
  annualFamilyIncomeRange: string;
  supportingDocuments: { documentName: string; fileUrl: string }[];
  reason: string;
}

export class ScholarshipApplicationRepository {
  static async create(data: ScholarshipApplicationCreateData) {
    return prisma.scholarshipApplication.create({
      data: {
        scholarshipConfigId: data.scholarshipConfigId,
        studentId: data.studentId,
        applicationId: data.applicationId,
        annualFamilyIncomeRange: data.annualFamilyIncomeRange,
        supportingDocuments: data.supportingDocuments,
        remarks: data.reason,
      },
      select: APPLICATION_SELECT,
    });
  }

  static async findExisting(
    scholarshipConfigId: string,
    studentId: string,
    applicationId: string,
  ) {
    return prisma.scholarshipApplication.findUnique({
      where: {
        uq_scholarship_student_application: {
          scholarshipConfigId,
          studentId,
          applicationId,
        },
      },
      select: { id: true },
    });
  }

  static async findById(id: string) {
    return prisma.scholarshipApplication.findUnique({
      where: { id },
      select: APPLICATION_SELECT,
    });
  }

  static async findByIdForStudent(id: string, studentId: string) {
    return prisma.scholarshipApplication.findFirst({
      where: { id, studentId },
      select: APPLICATION_SELECT,
    });
  }

  static async listForStudent(studentId: string) {
    return prisma.scholarshipApplication.findMany({
      where: { studentId },
      select: APPLICATION_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string } = {},
  ) {
    return prisma.scholarshipApplication.findMany({
      where: {
        scholarshipConfig: { collegeId },
        ...(filters.status && { status: filters.status }),
      },
      select: APPLICATION_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async review(
    id: string,
    data: {
      status: "approved" | "rejected";
      reviewedBy: string;
      discountAmount?: number;
      reviewRemarks?: string;
    },
  ) {
    return prisma.scholarshipApplication.update({
      where: { id },
      data: {
        status: data.status,
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date(),
        ...(data.discountAmount !== undefined && {
          discountAmount: data.discountAmount,
        }),
        ...(data.reviewRemarks !== undefined && {
          reviewRemarks: data.reviewRemarks,
        }),
      },
      select: APPLICATION_SELECT,
    });
  }
}
