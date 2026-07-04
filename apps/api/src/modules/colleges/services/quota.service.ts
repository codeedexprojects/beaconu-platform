import { ConflictError, NotFoundError } from "@/shared/errors";
import { toSlug } from "@/shared/utils/slug.utils";
import { QuotaRepository } from "../repositories/quota.repository";
import type {
  CreateQuotaInput,
  UpdateQuotaInput,
  ListQuotasQuery,
} from "../validators/quota.validator";

type QuotaRow = NonNullable<
  Awaited<ReturnType<typeof QuotaRepository.findById>>
>;

// Quota slugs use snake_case (e.g. "government_quota") — they are matched
// against DocumentUploadConfig.appliesToQuotas and the seeded catalogue.
function toQuotaSlug(name: string): string {
  return toSlug(name).replace(/-/g, "_");
}

function toQuotaDto(quota: QuotaRow) {
  const { _count, ...rest } = quota;
  return {
    ...rest,
    usage: {
      courseCount: _count.courseQuotas,
      seatPoolCount: _count.seatMatrices,
    },
  };
}

export class QuotaService {
  static async listQuotas(collegeId: string, query: ListQuotasQuery) {
    const quotas = await QuotaRepository.findByCollegeId(collegeId, {
      bucketType: query.bucket_type,
      includeInactive: query.include_inactive,
    });
    return quotas.map(toQuotaDto);
  }

  static async getQuota(id: string, collegeId: string) {
    const quota = await QuotaRepository.findById(id, collegeId);
    if (!quota) throw new NotFoundError("Quota not found");
    return toQuotaDto(quota);
  }

  static async createQuota(collegeId: string, body: CreateQuotaInput) {
    const slug = toQuotaSlug(body.name);
    if (!slug) throw new ConflictError("Quota name must contain letters");

    const existing = await QuotaRepository.findBySlug(collegeId, slug);
    if (existing) {
      throw new ConflictError(`A quota named "${body.name}" already exists`);
    }

    const quota = await QuotaRepository.create({
      collegeId,
      name: body.name,
      slug,
      bucketType: body.bucketType,
      description: body.description ?? null,
      sortOrder: body.sortOrder ?? 0,
    });
    return toQuotaDto(quota);
  }

  static async updateQuota(
    id: string,
    collegeId: string,
    body: UpdateQuotaInput,
  ) {
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const slug = toQuotaSlug(body.name);
      if (!slug) throw new ConflictError("Quota name must contain letters");

      const existing = await QuotaRepository.findBySlug(collegeId, slug);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A quota named "${body.name}" already exists`);
      }
      data.name = body.name;
      data.slug = slug;
    }
    if (body.bucketType !== undefined) data.bucketType = body.bucketType;
    if (body.description !== undefined) data.description = body.description;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const quota = await QuotaRepository.update(id, collegeId, data);
    if (!quota) throw new NotFoundError("Quota not found");
    return toQuotaDto(quota);
  }

  static async deleteQuota(id: string, collegeId: string) {
    const quota = await QuotaRepository.softDeleteById(id, collegeId);
    if (!quota) throw new NotFoundError("Quota not found");
    return toQuotaDto(quota);
  }
}
