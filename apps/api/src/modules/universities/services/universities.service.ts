import { ConflictError, NotFoundError } from "@/shared/errors";
import { UniversityRepository } from "../repositories/universities.repository";
import { UniversityTypeRepository } from "../repositories/university-types.repository";
import {
  CreateUniversityInput,
  UpdateUniversityInput,
} from "../validators/universities.validator";

function buildUniversityMetadata(
  data:
    | Pick<CreateUniversityInput, "metadata" | "cover_url" | "governance">
    | Pick<UpdateUniversityInput, "metadata" | "cover_url" | "governance">,
) {
  const metadata: Record<string, unknown> = {
    ...(data.metadata ?? {}),
  };

  if (data.cover_url !== undefined) {
    metadata.cover_url = data.cover_url;
  }

  if (data.governance !== undefined) {
    metadata.governance = data.governance;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

export class UniversityService {
  static async create(data: CreateUniversityInput) {
    const existingType = await UniversityTypeRepository.findById(
      data.university_type_id,
    );
    if (!existingType) throw new NotFoundError("University type not found");

    const existingSlug = await UniversityRepository.findBySlug(data.slug);
    if (existingSlug) throw new ConflictError("University slug already exists");

    return UniversityRepository.create({
      universityTypeId: data.university_type_id,
      name: data.name,
      slug: data.slug,
      state: data.state,
      city: data.city,
      accreditation: data.accreditation,
      governanceDetails: data.governance_details,
      logoUrl: data.logo_url,
      metadata: buildUniversityMetadata(data),
    });
  }

  static async update(id: string, data: UpdateUniversityInput) {
    const existing = await UniversityRepository.findById(id);
    if (!existing) throw new NotFoundError("University not found");

    if (data.university_type_id) {
      const existingType = await UniversityTypeRepository.findById(
        data.university_type_id,
      );
      if (!existingType) throw new NotFoundError("University type not found");
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await UniversityRepository.findBySlug(data.slug);
      if (existingSlug)
        throw new ConflictError("University slug already exists");
    }

    const metadata = buildUniversityMetadata(data);

    return UniversityRepository.updateById(id, {
      ...(data.university_type_id !== undefined
        ? { universityTypeId: data.university_type_id }
        : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.accreditation !== undefined
        ? { accreditation: data.accreditation }
        : {}),
      ...(data.governance_details !== undefined
        ? { governanceDetails: data.governance_details }
        : {}),
      ...(data.logo_url !== undefined ? { logoUrl: data.logo_url } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    });
  }

  static async archive(id: string) {
    const existing = await UniversityRepository.findById(id);
    if (!existing) throw new NotFoundError("University not found");

    if (existing.status === "archived") return existing;

    return UniversityRepository.updateById(id, { status: "archived" });
  }
}
