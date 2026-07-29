import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { IconsRepository } from "../repositories/icons.repository";
import type {
  CreateIconInput,
  ListIconsQuery,
  UpdateIconInput,
} from "../validators/icons.validator";

export class IconsService {
  static async listAll(query: ListIconsQuery) {
    const { rows, total } = await IconsRepository.listAll({
      isActive: query.is_active,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return {
      data: rows,
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }

  /** College-admin icon picker — active icons only, optionally
   * name-filtered, no pagination (small reference list). */
  static async listActiveForCollegeAdmin(search?: string) {
    return IconsRepository.listActive(search);
  }

  static async getById(id: string) {
    const icon = await IconsRepository.findById(id);
    if (!icon) throw new NotFoundError("Icon not found");
    return icon;
  }

  static async create(data: CreateIconInput) {
    const existing = await IconsRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError(`An icon named "${data.name}" already exists`);
    }
    return IconsRepository.create({ name: data.name, iconUrl: data.icon_url });
  }

  static async update(id: string, data: UpdateIconInput) {
    const existing = await IconsRepository.findById(id);
    if (!existing) throw new NotFoundError("Icon not found");

    if (data.name && data.name !== existing.name) {
      const conflict = await IconsRepository.findByName(data.name);
      if (conflict && conflict.id !== id) {
        throw new ConflictError(`An icon named "${data.name}" already exists`);
      }
    }

    return IconsRepository.update(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.icon_url !== undefined ? { iconUrl: data.icon_url } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await IconsRepository.findById(id);
    if (!existing) throw new NotFoundError("Icon not found");
    if (!existing.isActive) {
      throw new ForbiddenError("Icon is already inactive");
    }
    return IconsRepository.update(id, { isActive: false });
  }

  static async activate(id: string) {
    const existing = await IconsRepository.findById(id);
    if (!existing) throw new NotFoundError("Icon not found");
    if (existing.isActive) {
      throw new ForbiddenError("Icon is already active");
    }
    return IconsRepository.update(id, { isActive: true });
  }
}
