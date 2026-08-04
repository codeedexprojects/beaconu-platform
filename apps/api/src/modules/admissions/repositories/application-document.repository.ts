import { prisma } from "@beaconu/db";

const DOCUMENT_SELECT = {
  id: true,
  applicationId: true,
  documentType: true,
  documentCategory: true,
  fileUrl: true,
  fileName: true,
  fileSizeBytes: true,
  verificationStatus: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ApplicationDocumentRepository {
  static async findApplicationForStudent(
    applicationId: string,
    studentId: string,
  ) {
    return prisma.application.findFirst({
      where: { id: applicationId, studentId },
      select: {
        id: true,
        admissionCycleId: true,
        nationality: true,
        formStatus: true,
        feePaymentStatus: true,
      },
    });
  }

  static async findSelectedCourseAndQuotaIds(applicationId: string) {
    const rows = await prisma.applicationCourse.findMany({
      where: { applicationId, status: { not: "withdrawn" } },
      select: {
        courseId: true,
        courseQuotaSeat: { select: { collegeQuotaId: true } },
      },
    });
    return {
      courseIds: rows.map((r) => r.courseId),
      collegeQuotaIds: rows
        .map((r) => r.courseQuotaSeat?.collegeQuotaId)
        .filter((id): id is string => !!id),
    };
  }

  static async findApplicableConfigs(admissionCycleId: string) {
    return prisma.documentUploadConfig.findMany({
      where: { admissionCycleId, isActive: true },
      select: {
        documentType: true,
        documentCategory: true,
        documentLabel: true,
        isRequired: true,
        appliesToNationalities: true,
        acceptedMimeTypes: true,
        sortOrder: true,
        courses: { select: { courseId: true } },
        quotas: { select: { collegeQuotaId: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findUploadedByApplicationId(applicationId: string) {
    return prisma.applicationDocument.findMany({
      where: { applicationId },
      select: DOCUMENT_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  static async findByApplicationAndType(
    applicationId: string,
    documentType: string,
  ) {
    return prisma.applicationDocument.findFirst({
      where: { applicationId, documentType },
      select: { id: true },
    });
  }

  static async upsert(data: {
    applicationId: string;
    documentType: string;
    documentCategory: string;
    fileUrl: string;
    fileName: string | null;
    fileSizeBytes: number | null;
  }) {
    const existing =
      await ApplicationDocumentRepository.findByApplicationAndType(
        data.applicationId,
        data.documentType,
      );
    if (existing) {
      return prisma.applicationDocument.update({
        where: { id: existing.id },
        data: {
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSizeBytes: data.fileSizeBytes,
          verificationStatus: "pending",
          rejectionReason: null,
          verifiedBy: null,
          verifiedAt: null,
        },
        select: DOCUMENT_SELECT,
      });
    }
    return prisma.applicationDocument.create({
      data: {
        applicationId: data.applicationId,
        documentType: data.documentType,
        documentCategory: data.documentCategory,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
      },
      select: DOCUMENT_SELECT,
    });
  }
}
