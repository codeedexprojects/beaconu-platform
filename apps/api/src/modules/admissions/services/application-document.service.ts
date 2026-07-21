import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { ApplicationDocumentRepository } from "../repositories/application-document.repository";
import { DOCUMENT_MIME_TYPES } from "../validators/document-upload-config.validator";
import type { RegisterApplicationDocumentInput } from "../validators/application-document.validator";

type ApplicableConfig = Awaited<
  ReturnType<typeof ApplicationDocumentRepository.findApplicableConfigs>
>[number];

async function assertOwnApplication(applicationId: string, studentId: string) {
  const application =
    await ApplicationDocumentRepository.findApplicationForStudent(
      applicationId,
      studentId,
    );
  if (!application) throw new NotFoundError("Application");
  return application;
}

/** A requirement applies when its nationality/course/quota scopes are
 * either unset (= applies to everyone) or intersect with what the student
 * has actually selected — mirrors the admin-side scoping semantics from
 * DocumentUploadConfigService. */
function isApplicable(
  config: ApplicableConfig,
  nationality: string | null,
  courseIds: string[],
  collegeQuotaIds: string[],
): boolean {
  const nationalities = config.appliesToNationalities as string[] | null;
  if (nationalities && nationalities.length > 0) {
    if (!nationality || !nationalities.includes(nationality)) return false;
  }
  if (config.courses.length > 0) {
    if (!config.courses.some((c) => courseIds.includes(c.courseId)))
      return false;
  }
  if (config.quotas.length > 0) {
    if (
      !config.quotas.some((q) => collegeQuotaIds.includes(q.collegeQuotaId))
    ) {
      return false;
    }
  }
  return true;
}

export class ApplicationDocumentService {
  static async listRequired(applicationId: string, studentId: string) {
    const application = await assertOwnApplication(applicationId, studentId);
    const { courseIds, collegeQuotaIds } =
      await ApplicationDocumentRepository.findSelectedCourseAndQuotaIds(
        applicationId,
      );
    const configs = await ApplicationDocumentRepository.findApplicableConfigs(
      application.admissionCycleId,
    );
    const uploaded =
      await ApplicationDocumentRepository.findUploadedByApplicationId(
        applicationId,
      );
    const uploadedByType = new Map(uploaded.map((d) => [d.documentType, d]));

    return configs
      .filter((c) =>
        isApplicable(c, application.nationality, courseIds, collegeQuotaIds),
      )
      .map((c) => {
        const doc = uploadedByType.get(c.documentType);
        return {
          documentType: c.documentType,
          documentCategory: c.documentCategory,
          documentLabel: c.documentLabel,
          isRequired: c.isRequired,
          acceptedMimeTypes: (c.acceptedMimeTypes as string[] | null) ?? [
            ...DOCUMENT_MIME_TYPES,
          ],
          uploaded: doc
            ? {
                id: doc.id,
                fileUrl: doc.fileUrl,
                fileName: doc.fileName,
                verificationStatus: doc.verificationStatus,
                rejectionReason: doc.rejectionReason,
              }
            : null,
        };
      });
  }

  static async register(
    applicationId: string,
    studentId: string,
    body: RegisterApplicationDocumentInput,
  ) {
    const application = await assertOwnApplication(applicationId, studentId);
    if (application.formStatus !== "draft") {
      throw new ConflictError(
        "This application has already been submitted and can no longer be edited",
      );
    }
    if (application.feePaymentStatus !== "paid") {
      throw new ConflictError(
        "Complete payment for your primary course before uploading documents",
      );
    }

    const { courseIds, collegeQuotaIds } =
      await ApplicationDocumentRepository.findSelectedCourseAndQuotaIds(
        applicationId,
      );
    const configs = await ApplicationDocumentRepository.findApplicableConfigs(
      application.admissionCycleId,
    );
    const config = configs.find((c) => c.documentType === body.document_type);
    if (
      !config ||
      !isApplicable(config, application.nationality, courseIds, collegeQuotaIds)
    ) {
      throw new NotFoundError("Document requirement");
    }

    const acceptedMimeTypes = (config.acceptedMimeTypes as string[] | null) ?? [
      ...DOCUMENT_MIME_TYPES,
    ];
    if (!acceptedMimeTypes.includes(body.mime_type)) {
      throw new ValidationError(
        `This document only accepts: ${acceptedMimeTypes.join(", ")}`,
      );
    }

    return ApplicationDocumentRepository.upsert({
      applicationId,
      documentType: body.document_type,
      documentCategory: config.documentCategory,
      fileUrl: body.file_url,
      fileName: body.file_name ?? null,
      fileSizeBytes: body.file_size_bytes ?? null,
    });
  }

  static async listUploaded(applicationId: string, studentId: string) {
    await assertOwnApplication(applicationId, studentId);
    return ApplicationDocumentRepository.findUploadedByApplicationId(
      applicationId,
    );
  }
}
