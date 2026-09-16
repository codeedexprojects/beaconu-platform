import { prisma, Prisma } from "@beaconu/db";

export class LegalDocumentRepository {
  static async findAll() {
    return prisma.legalDocument.findMany({ orderBy: { docType: "asc" } });
  }

  static async findByType(docType: string) {
    return prisma.legalDocument.findUnique({ where: { docType } });
  }

  static async findPublished() {
    return prisma.legalDocument.findMany({
      where: { status: "published" },
      orderBy: { docType: "asc" },
    });
  }

  static async findPublishedByType(docType: string) {
    return prisma.legalDocument.findFirst({
      where: { docType, status: "published" },
    });
  }

  static async upsert(
    docType: string,
    data: {
      title: string;
      content: string;
      documentUrl: string | null;
      effectiveFrom: Date | null;
      status: string;
      publishedAt: Date | null;
      version: number;
      updatedByAdminId: string;
    },
  ) {
    return prisma.legalDocument.upsert({
      where: { docType },
      create: { docType, ...data },
      update: data,
    });
  }

  static async updateStatus(
    docType: string,
    data: Prisma.LegalDocumentUpdateInput,
  ) {
    return prisma.legalDocument.update({ where: { docType }, data });
  }
}
