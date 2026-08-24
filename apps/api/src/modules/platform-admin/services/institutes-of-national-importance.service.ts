import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { toSlug } from "@/shared/utils/slug.utils";
import { PaginationHelper } from "@/shared/responses/pagination";
import { InstitutesOfNationalImportanceRepository } from "../repositories/institutes-of-national-importance.repository";
import type {
  CreateInstituteOfNationalImportanceInput,
  ListInstitutesOfNationalImportanceQuery,
  UpdateInstituteOfNationalImportanceInput,
} from "../validators/institutes-of-national-importance.validator";

async function ensureUniqueSlug(base: string): Promise<string> {
  const existing =
    await InstitutesOfNationalImportanceRepository.findBySlug(base);
  if (!existing) return base;

  let counter = 2;
  while (true) {
    const candidate = `${base}-${counter}`;
    const taken =
      await InstitutesOfNationalImportanceRepository.findBySlug(candidate);
    if (!taken) return candidate;
    counter++;
  }
}

type InstituteRow = NonNullable<
  Awaited<ReturnType<typeof InstitutesOfNationalImportanceRepository.findById>>
>;

function toDto(row: InstituteRow) {
  return row;
}

export class InstitutesOfNationalImportanceService {
  static async listAll(query: ListInstitutesOfNationalImportanceQuery) {
    const { rows, total } =
      await InstitutesOfNationalImportanceRepository.listAll({
        isActive: query.is_active,
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
    const data = await Promise.all(rows.map(toDto));
    return {
      data,
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }

  static async getById(id: string) {
    const row = await InstitutesOfNationalImportanceRepository.findById(id);
    if (!row)
      throw new NotFoundError("Institute of National Importance not found");
    return toDto(row);
  }

  static async create(data: CreateInstituteOfNationalImportanceInput) {
    const existing = await InstitutesOfNationalImportanceRepository.findByName(
      data.name,
    );
    if (existing) {
      throw new ConflictError(
        `An institute named "${data.name}" already exists`,
      );
    }

    const slug = await ensureUniqueSlug(toSlug(data.name));

    const created = await InstitutesOfNationalImportanceRepository.create({
      name: data.name,
      slug,
      iconUrl: data.icon_url ?? null,
      collegesCount: data.colleges_count,
      sortOrder: data.sort_order,
    });
    return toDto(created);
  }

  static async update(
    id: string,
    data: UpdateInstituteOfNationalImportanceInput,
  ) {
    const existing =
      await InstitutesOfNationalImportanceRepository.findById(id);
    if (!existing)
      throw new NotFoundError("Institute of National Importance not found");

    const nextName = data.name ?? existing.name;
    let slug: string | undefined;
    if (data.name !== undefined && data.name !== existing.name) {
      const conflict =
        await InstitutesOfNationalImportanceRepository.findByName(nextName);
      if (conflict && conflict.id !== id) {
        throw new ConflictError(
          `An institute named "${nextName}" already exists`,
        );
      }
      slug = await ensureUniqueSlug(toSlug(nextName));
    }

    const updated = await InstitutesOfNationalImportanceRepository.update(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(data.icon_url !== undefined ? { iconUrl: data.icon_url } : {}),
      ...(data.colleges_count !== undefined
        ? { collegesCount: data.colleges_count }
        : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
    return toDto(updated);
  }

  static async deactivate(id: string) {
    const existing =
      await InstitutesOfNationalImportanceRepository.findById(id);
    if (!existing)
      throw new NotFoundError("Institute of National Importance not found");
    if (!existing.isActive) {
      throw new ForbiddenError("Institute is already inactive");
    }
    const updated = await InstitutesOfNationalImportanceRepository.update(id, {
      isActive: false,
    });
    return toDto(updated);
  }

  static async activate(id: string) {
    const existing =
      await InstitutesOfNationalImportanceRepository.findById(id);
    if (!existing)
      throw new NotFoundError("Institute of National Importance not found");
    if (existing.isActive) {
      throw new ForbiddenError("Institute is already active");
    }
    const updated = await InstitutesOfNationalImportanceRepository.update(id, {
      isActive: true,
    });
    return toDto(updated);
  }

  /** Public/student-facing read — active only, paginated. */
  static async listForStudent(query: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const { rows, total } =
      await InstitutesOfNationalImportanceRepository.listAll({
        isActive: true,
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
    const data = await Promise.all(rows.map(toDto));
    return {
      data,
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }
}
