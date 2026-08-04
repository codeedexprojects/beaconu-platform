import { prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  collegeId: true,
  admissionCycleId: true,
  documentType: true,
  documentCategory: true,
  documentLabel: true,
  isRequired: true,
  appliesToNationalities: true,
  acceptedMimeTypes: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  courses: {
    select: { course: { select: { id: true, name: true, code: true } } },
  },
  quotas: {
    select: {
      collegeQuota: {
        select: { id: true, name: true, slug: true, bucketType: true },
      },
    },
  },
} as const;

export class DocumentUploadConfigRepository {
  static async findCycleInCollege(admissionCycleId: string, collegeId: string) {
    return prisma.admissionCycle.findFirst({
      where: { id: admissionCycleId, collegeId },
      select: { id: true },
    });
  }

  static async findActiveCycleCourseIds(
    admissionCycleId: string,
    courseIds: string[],
  ) {
    const rows = await prisma.admissionCycleCourse.findMany({
      where: { admissionCycleId, courseId: { in: courseIds }, isActive: true },
      select: { courseId: true },
    });
    return new Set(rows.map((r) => r.courseId));
  }

  static async findActiveCollegeQuotaIds(
    collegeId: string,
    quotaIds: string[],
  ) {
    const rows = await prisma.collegeQuota.findMany({
      where: { collegeId, id: { in: quotaIds }, isActive: true },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  static async findByCycleId(admissionCycleId: string) {
    return prisma.documentUploadConfig.findMany({
      where: { admissionCycleId },
      select: SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findById(admissionCycleId: string, id: string) {
    return prisma.documentUploadConfig.findFirst({
      where: { id, admissionCycleId },
      select: SELECT,
    });
  }

  static async create(data: {
    collegeId: string;
    admissionCycleId: string;
    documentType: string;
    documentCategory: string;
    documentLabel: string;
    isRequired: boolean;
    appliesToNationalities?: string[];
    acceptedMimeTypes?: string[];
    sortOrder: number;
    courseIds: string[];
    quotaIds: string[];
  }) {
    const created = await prisma.documentUploadConfig.create({
      data: {
        collegeId: data.collegeId,
        admissionCycleId: data.admissionCycleId,
        documentType: data.documentType,
        documentCategory: data.documentCategory,
        documentLabel: data.documentLabel,
        isRequired: data.isRequired,
        appliesToNationalities: data.appliesToNationalities ?? undefined,
        acceptedMimeTypes: data.acceptedMimeTypes ?? undefined,
        sortOrder: data.sortOrder,
        courses: {
          createMany: {
            data: data.courseIds.map((courseId) => ({ courseId })),
          },
        },
        quotas: {
          createMany: {
            data: data.quotaIds.map((collegeQuotaId) => ({ collegeQuotaId })),
          },
        },
      },
      select: { id: true },
    });
    return prisma.documentUploadConfig.findUniqueOrThrow({
      where: { id: created.id },
      select: SELECT,
    });
  }

  static async update(
    admissionCycleId: string,
    id: string,
    data: {
      documentType?: string;
      documentCategory?: string;
      documentLabel?: string;
      isRequired?: boolean;
      appliesToNationalities?: string[] | null;
      acceptedMimeTypes?: string[] | null;
      sortOrder?: number;
      isActive?: boolean;
      courseIds?: string[];
      quotaIds?: string[];
    },
  ) {
    const existing = await prisma.documentUploadConfig.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    const fields = {
      ...(data.documentType !== undefined && {
        documentType: data.documentType,
      }),
      ...(data.documentCategory !== undefined && {
        documentCategory: data.documentCategory,
      }),
      ...(data.documentLabel !== undefined && {
        documentLabel: data.documentLabel,
      }),
      ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
      ...(data.appliesToNationalities !== undefined && {
        appliesToNationalities: data.appliesToNationalities ?? undefined,
      }),
      ...(data.acceptedMimeTypes !== undefined && {
        acceptedMimeTypes: data.acceptedMimeTypes ?? undefined,
      }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    if (data.courseIds || data.quotaIds) {
      await prisma.$transaction(async (tx) => {
        if (data.courseIds) {
          await tx.documentUploadConfigCourse.deleteMany({
            where: { documentUploadConfigId: id },
          });
          if (data.courseIds.length > 0) {
            await tx.documentUploadConfigCourse.createMany({
              data: data.courseIds.map((courseId) => ({
                documentUploadConfigId: id,
                courseId,
              })),
            });
          }
        }
        if (data.quotaIds) {
          await tx.documentUploadConfigQuota.deleteMany({
            where: { documentUploadConfigId: id },
          });
          if (data.quotaIds.length > 0) {
            await tx.documentUploadConfigQuota.createMany({
              data: data.quotaIds.map((collegeQuotaId) => ({
                documentUploadConfigId: id,
                collegeQuotaId,
              })),
            });
          }
        }
        if (Object.keys(fields).length > 0) {
          await tx.documentUploadConfig.update({ where: { id }, data: fields });
        }
      });
    } else if (Object.keys(fields).length > 0) {
      await prisma.documentUploadConfig.update({ where: { id }, data: fields });
    }

    return prisma.documentUploadConfig.findUniqueOrThrow({
      where: { id },
      select: SELECT,
    });
  }

  static async softDeleteById(admissionCycleId: string, id: string) {
    const existing = await prisma.documentUploadConfig.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.documentUploadConfig.update({
      where: { id },
      data: { isActive: false },
      select: SELECT,
    });
  }
}
