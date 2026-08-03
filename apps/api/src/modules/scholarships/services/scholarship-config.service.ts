import { NotFoundError, ValidationError } from "@/shared/errors";
import {
  ScholarshipConfigRepository,
  type ScholarshipConfigCreateData,
} from "../repositories/scholarship-config.repository";
import type { ScholarshipConfigItem } from "@beaconu/types";

type ConfigRow = NonNullable<
  Awaited<ReturnType<typeof ScholarshipConfigRepository.findById>>
>;

function mapConfig(row: ConfigRow): ScholarshipConfigItem {
  return {
    id: row.id,
    collegeId: row.collegeId,
    name: row.name,
    scholarshipType: row.scholarshipType,
    discountType: row.discountType as ScholarshipConfigItem["discountType"],
    discountValue: row.discountValue.toString(),
    requiredDocuments: (row.requiredDocuments as string[] | null) ?? [],
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ScholarshipConfigService {
  private static validate(data: Partial<ScholarshipConfigCreateData>) {
    if (data.discountValue !== undefined && data.discountValue <= 0) {
      throw new ValidationError("discount_value must be greater than 0");
    }
    if (
      data.discountType === "percentage" &&
      data.discountValue !== undefined &&
      data.discountValue > 100
    ) {
      throw new ValidationError(
        "discount_value cannot exceed 100 for a percentage discount",
      );
    }
  }

  static async create(collegeId: string, data: ScholarshipConfigCreateData) {
    this.validate(data);
    const row = await ScholarshipConfigRepository.create(collegeId, data);
    return mapConfig(row);
  }

  static async list(collegeId: string, activeOnly = false) {
    const rows = await ScholarshipConfigRepository.listByCollege(
      collegeId,
      activeOnly,
    );
    return rows.map(mapConfig);
  }

  static async update(
    collegeId: string,
    id: string,
    data: Partial<ScholarshipConfigCreateData> & { isActive?: boolean },
  ) {
    this.validate(data);
    const existing = await ScholarshipConfigRepository.findById(id, collegeId);
    if (!existing) throw new NotFoundError("Scholarship not found");
    const row = await ScholarshipConfigRepository.update(id, data);
    return mapConfig(row);
  }
}
