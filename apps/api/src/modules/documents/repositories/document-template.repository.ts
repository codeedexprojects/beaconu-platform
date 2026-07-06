import { prisma } from "@beaconu/db";
import type {
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
} from "../validators/documents.validator";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class DocumentTemplateRepository {
  static async create(collegeId: string, data: CreateDocumentTemplateInput) {
    return prisma.documentTemplate.create({
      data: {
        collegeId,
        name: data.name,
        slug: slugify(data.name),
        category: data.category,
        instructions: data.instructions ?? null,
        description: data.description ?? null,
        isStandard: false,
        sortOrder: data.sort_order,
      },
    });
  }

  static async findById(id: string) {
    return prisma.documentTemplate.findUnique({ where: { id } });
  }

  static async update(id: string, data: UpdateDocumentTemplateInput) {
    return prisma.documentTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
          slug: slugify(data.name),
        }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.instructions !== undefined && {
          instructions: data.instructions,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.sort_order !== undefined && { sortOrder: data.sort_order }),
      },
    });
  }

  static async setActive(id: string, isActive: boolean) {
    return prisma.documentTemplate.update({
      where: { id },
      data: { isActive },
    });
  }
}
