import { prisma, Prisma } from "@beaconu/db";

export class CollegeLegalDocumentRepository {
  static async findAllForCollege(collegeId: string) {
    return prisma.collegeLegalDocument.findMany({
      where: { collegeId },
      orderBy: { docType: "asc" },
    });
  }

  static async findByType(collegeId: string, docType: string) {
    return prisma.collegeLegalDocument.findUnique({
      where: { uq_college_legal_doc: { collegeId, docType } },
    });
  }

  static async findPublishedForCollege(collegeId: string) {
    return prisma.collegeLegalDocument.findMany({
      where: { collegeId, status: "published" },
      orderBy: { docType: "asc" },
    });
  }

  static async findPublishedByType(collegeId: string, docType: string) {
    return prisma.collegeLegalDocument.findFirst({
      where: { collegeId, docType, status: "published" },
    });
  }

  static async upsert(
    collegeId: string,
    docType: string,
    data: {
      title: string;
      content: string;
      documentUrl: string | null;
      effectiveFrom: Date | null;
      status: string;
      publishedAt: Date | null;
      version: number;
      updatedByStaffId: string;
    },
  ) {
    return prisma.collegeLegalDocument.upsert({
      where: { uq_college_legal_doc: { collegeId, docType } },
      create: { collegeId, docType, ...data },
      update: data,
    });
  }

  static async updateStatus(
    collegeId: string,
    docType: string,
    data: Prisma.CollegeLegalDocumentUpdateInput,
  ) {
    return prisma.collegeLegalDocument.update({
      where: { uq_college_legal_doc: { collegeId, docType } },
      data,
    });
  }
}
