import { NotFoundError, ValidationError } from "@/shared/errors";
import { toSlug } from "@/shared/utils/slug.utils";
import { DocumentUploadConfigRepository } from "../repositories/document-upload-config.repository";
import { DOCUMENT_MIME_TYPES } from "../validators/document-upload-config.validator";
import type {
  CreateDocumentRequirementInput,
  UpdateDocumentRequirementInput,
} from "../validators/document-upload-config.validator";

// documentType is an internal key derived from the admin-facing label — the
// admin never types it directly (e.g. "NEET Scorecard" -> "neet_scorecard").
function toDocumentType(label: string): string {
  return toSlug(label).replace(/-/g, "_");
}

type DocumentRequirementRow = NonNullable<
  Awaited<ReturnType<typeof DocumentUploadConfigRepository.findById>>
>;

function toDto(row: DocumentRequirementRow) {
  const { courses, quotas, acceptedMimeTypes, ...rest } = row;
  return {
    ...rest,
    // null means "not customized" in the DB — resolve to the default set so
    // the client always gets a concrete list to render/enforce.
    acceptedMimeTypes: (acceptedMimeTypes as string[] | null) ?? [
      ...DOCUMENT_MIME_TYPES,
    ],
    courses: courses.map((c) => ({
      id: c.course.id,
      name: c.course.name,
      code: c.course.code,
    })),
    quotas: quotas.map((q) => ({
      id: q.collegeQuota.id,
      name: q.collegeQuota.name,
      slug: q.collegeQuota.slug,
      bucketType: q.collegeQuota.bucketType,
    })),
  };
}

async function assertCycleInCollege(
  admissionCycleId: string,
  collegeId: string,
) {
  const cycle = await DocumentUploadConfigRepository.findCycleInCollege(
    admissionCycleId,
    collegeId,
  );
  if (!cycle) throw new NotFoundError("Application form not found");
}

async function assertCoursesInCycle(
  admissionCycleId: string,
  courseIds: string[],
) {
  if (courseIds.length === 0) return;
  const activeIds =
    await DocumentUploadConfigRepository.findActiveCycleCourseIds(
      admissionCycleId,
      courseIds,
    );
  const missing = courseIds.filter((id) => !activeIds.has(id));
  if (missing.length > 0) {
    throw new ValidationError(
      `These courses are not attached to this application form: ${missing.join(", ")}`,
    );
  }
}

async function assertQuotasInCollege(collegeId: string, quotaIds: string[]) {
  if (quotaIds.length === 0) return;
  const activeIds =
    await DocumentUploadConfigRepository.findActiveCollegeQuotaIds(
      collegeId,
      quotaIds,
    );
  const missing = quotaIds.filter((id) => !activeIds.has(id));
  if (missing.length > 0) {
    throw new ValidationError(
      `These quotas were not found in your catalogue: ${missing.join(", ")}`,
    );
  }
}

export class DocumentUploadConfigService {
  static async listForCycle(admissionCycleId: string, collegeId: string) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    const rows =
      await DocumentUploadConfigRepository.findByCycleId(admissionCycleId);
    return rows.map(toDto);
  }

  static async createRequirement(
    admissionCycleId: string,
    collegeId: string,
    body: CreateDocumentRequirementInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    await assertCoursesInCycle(admissionCycleId, body.course_ids);
    await assertQuotasInCollege(collegeId, body.quota_ids);

    const row = await DocumentUploadConfigRepository.create({
      collegeId,
      admissionCycleId,
      documentType: toDocumentType(body.document_label),
      documentCategory: body.document_category,
      documentLabel: body.document_label,
      isRequired: body.is_required,
      appliesToNationalities: body.applies_to_nationalities,
      acceptedMimeTypes: body.accepted_mime_types,
      sortOrder: body.sort_order ?? 0,
      courseIds: body.course_ids,
      quotaIds: body.quota_ids,
    });
    return toDto(row);
  }

  static async updateRequirement(
    admissionCycleId: string,
    collegeId: string,
    id: string,
    body: UpdateDocumentRequirementInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    if (body.course_ids) {
      await assertCoursesInCycle(admissionCycleId, body.course_ids);
    }
    if (body.quota_ids) {
      await assertQuotasInCollege(collegeId, body.quota_ids);
    }

    const row = await DocumentUploadConfigRepository.update(
      admissionCycleId,
      id,
      {
        documentType: body.document_label
          ? toDocumentType(body.document_label)
          : undefined,
        documentCategory: body.document_category,
        documentLabel: body.document_label,
        isRequired: body.is_required,
        appliesToNationalities: body.applies_to_nationalities,
        acceptedMimeTypes: body.accepted_mime_types,
        sortOrder: body.sort_order,
        isActive: body.is_active,
        courseIds: body.course_ids,
        quotaIds: body.quota_ids,
      },
    );
    if (!row) throw new NotFoundError("Document requirement not found");
    return toDto(row);
  }

  static async deleteRequirement(
    admissionCycleId: string,
    collegeId: string,
    id: string,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    const row = await DocumentUploadConfigRepository.softDeleteById(
      admissionCycleId,
      id,
    );
    if (!row) throw new NotFoundError("Document requirement not found");
    return toDto(row);
  }
}
