import { ConflictError, NotFoundError } from "@/shared/errors";
import { DocumentTemplateRepository } from "../repositories/document-template.repository";
import type {
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
} from "../validators/documents.validator";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export class DocumentTemplateService {
  static async create(collegeId: string, data: CreateDocumentTemplateInput) {
    try {
      return await DocumentTemplateRepository.create(collegeId, data);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          "A document template with this name already exists for your college",
        );
      }
      throw error;
    }
  }

  private static async loadForCollege(id: string, collegeId: string) {
    const template = await DocumentTemplateRepository.findById(id);
    if (!template) throw new NotFoundError("Document template not found");
    if (template.collegeId !== collegeId) {
      throw new NotFoundError("Document template not found");
    }
    return template;
  }

  static async update(
    id: string,
    collegeId: string,
    data: UpdateDocumentTemplateInput,
  ) {
    await this.loadForCollege(id, collegeId);
    try {
      return await DocumentTemplateRepository.update(id, data);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          "A document template with this name already exists for your college",
        );
      }
      throw error;
    }
  }

  static async setActive(id: string, collegeId: string, isActive: boolean) {
    await this.loadForCollege(id, collegeId);
    return DocumentTemplateRepository.setActive(id, isActive);
  }
}
