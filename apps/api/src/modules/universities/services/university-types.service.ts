import { ConflictError, NotFoundError } from "@/shared/errors";
import { UniversityTypePlatformAdminRepository } from "../repositories/university-types.repository";
import {
  CreateUniversityTypeInput,
  ListUniversityTypesQuery,
  UpdateUniversityTypeInput,
} from "../validators/university-types.validator";

export class UniversityTypePlatformAdminService {
  static async listAll(query: ListUniversityTypesQuery) {
    return UniversityTypePlatformAdminRepository.listAll({
      isActive: query.is_active,
    });
  }

  static async getById(id: string) {
    const type = await UniversityTypePlatformAdminRepository.findById(id);
    if (!type) throw new NotFoundError("University type not found");
    return type;
  }

  static async create(data: CreateUniversityTypeInput) {
    const existingByName =
      await UniversityTypePlatformAdminRepository.findByName(data.name);
    if (existingByName)
      throw new ConflictError("University type name already exists");

    const existingBySlug =
      await UniversityTypePlatformAdminRepository.findBySlug(data.slug);
    if (existingBySlug)
      throw new ConflictError("University type slug already exists");

    return UniversityTypePlatformAdminRepository.create({
      name: data.name,
      slug: data.slug,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    });
  }

  static async update(id: string, data: UpdateUniversityTypeInput) {
    const existing = await UniversityTypePlatformAdminRepository.findById(id);
    if (!existing) throw new NotFoundError("University type not found");

    if (data.name && data.name !== existing.name) {
      const existingByName =
        await UniversityTypePlatformAdminRepository.findByName(data.name);
      if (existingByName) {
        throw new ConflictError("University type name already exists");
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingBySlug =
        await UniversityTypePlatformAdminRepository.findBySlug(data.slug);
      if (existingBySlug) {
        throw new ConflictError("University type slug already exists");
      }
    }

    return UniversityTypePlatformAdminRepository.updateById(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async disable(id: string) {
    const existing = await UniversityTypePlatformAdminRepository.findById(id);
    if (!existing) throw new NotFoundError("University type not found");

    if (!existing.isActive) return existing;

    return UniversityTypePlatformAdminRepository.updateById(id, {
      isActive: false,
    });
  }

  static async delete(id: string) {
    const existing = await UniversityTypePlatformAdminRepository.findById(id);
    if (!existing) throw new NotFoundError("University type not found");

    try {
      await UniversityTypePlatformAdminRepository.deleteById(id);
    } catch (error: unknown) {
      const maybePrisma = error as { code?: string };
      if (maybePrisma.code === "P2003") {
        throw new ConflictError(
          "Cannot delete university type while universities are mapped to it",
        );
      }
      throw error;
    }
  }
}
