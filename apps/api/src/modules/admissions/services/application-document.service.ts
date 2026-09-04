import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
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

async function notifyStudentOfDocumentApproval(document: {
  id: string;
  studentId: string;
  documentType: string;
}): Promise<void> {
  try {
    await PushService.sendToUser(document.studentId, "student", {
      title: "Document approved",
      body: `Your "${document.documentType.replace(/_/g, " ")}" document was approved`,
      data: { type: "application_document_approved", documentId: document.id },
    });
  } catch (error) {
    logger.error(
      { err: error, documentId: document.id },
      "Failed to notify student of application document approval",
    );
  }
}

async function notifyStudentOfDocumentRejection(document: {
  id: string;
  studentId: string;
  documentType: string;
  reason: string;
}): Promise<void> {
  try {
    await PushService.sendToUser(document.studentId, "student", {
      title: "Document rejected",
      body: `Your "${document.documentType.replace(/_/g, " ")}" document was rejected: ${document.reason}`,
      data: { type: "application_document_rejected", documentId: document.id },
    });
  } catch (error) {
    logger.error(
      { err: error, documentId: document.id },
      "Failed to notify student of application document rejection",
    );
  }
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

  static async registerMany(
    applicationId: string,
    studentId: string,
    documents: RegisterApplicationDocumentInput[],
  ) {
    const application = await assertOwnApplication(applicationId, studentId);
    const isDraft = application.formStatus === "draft";
    const isSubmitted = application.formStatus === "submitted";
    if (!isDraft && !isSubmitted) {
      throw new ConflictError("This application can no longer be edited");
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

    // Resolve + validate every document first — nothing is written until
    // the whole batch passes, so an invalid entry partway through a
    // multi-document upload never leaves some documents saved and others
    // silently dropped.
    const resolved = documents.map((body) => {
      const config = configs.find((c) => c.documentType === body.document_type);
      if (
        !config ||
        !isApplicable(
          config,
          application.nationality,
          courseIds,
          collegeQuotaIds,
        )
      ) {
        throw new NotFoundError(
          `Document requirement not found: ${body.document_type}`,
        );
      }

      const acceptedMimeTypes = (config.acceptedMimeTypes as
        | string[]
        | null) ?? [...DOCUMENT_MIME_TYPES];
      if (!acceptedMimeTypes.includes(body.mime_type)) {
        throw new ValidationError(
          `${body.document_type} only accepts: ${acceptedMimeTypes.join(", ")}`,
        );
      }

      return { body, config };
    });

    // Once submitted, a document can only be resubmitted — never freshly
    // added or touched — if it's currently rejected. This is the only way
    // a student can act on college-admin's rejection after the application
    // has already been finalized.
    if (isSubmitted) {
      const uploaded =
        await ApplicationDocumentRepository.findUploadedByApplicationId(
          applicationId,
        );
      const uploadedByType = new Map(uploaded.map((d) => [d.documentType, d]));
      for (const { body } of resolved) {
        const existing = uploadedByType.get(body.document_type);
        if (!existing || existing.verificationStatus !== "rejected") {
          throw new ConflictError(
            `${body.document_type} can only be resubmitted if it was rejected`,
          );
        }
      }
    }

    const results = [];
    for (const { body, config } of resolved) {
      results.push(
        await ApplicationDocumentRepository.upsert({
          applicationId,
          documentType: body.document_type,
          documentCategory: config.documentCategory,
          fileUrl: body.file_url,
          fileName: body.file_name ?? null,
          fileSizeBytes: body.file_size_bytes ?? null,
          isResubmission: isSubmitted,
        }),
      );
    }
    return results;
  }

  static async listUploaded(applicationId: string, studentId: string) {
    await assertOwnApplication(applicationId, studentId);
    return ApplicationDocumentRepository.findUploadedByApplicationId(
      applicationId,
    );
  }

  private static async loadForCollege(collegeId: string, documentId: string) {
    const doc = await ApplicationDocumentRepository.findByIdForCollege(
      documentId,
      collegeId,
    );
    if (!doc) throw new NotFoundError("Document not found");
    if (doc.application.formStatus !== "submitted") {
      throw new ConflictError(
        "This application hasn't been submitted yet — documents can't be verified until it is",
      );
    }
    return doc;
  }

  static async verify(collegeId: string, staffId: string, documentId: string) {
    const doc = await ApplicationDocumentService.loadForCollege(
      collegeId,
      documentId,
    );
    const updated = await ApplicationDocumentRepository.verify(
      documentId,
      staffId,
    );
    await notifyStudentOfDocumentApproval({
      id: doc.id,
      studentId: doc.application.studentId,
      documentType: updated.documentType,
    });
    return updated;
  }

  static async reject(
    collegeId: string,
    staffId: string,
    documentId: string,
    reason: string,
  ) {
    const doc = await ApplicationDocumentService.loadForCollege(
      collegeId,
      documentId,
    );
    const staffName =
      await ApplicationDocumentRepository.findStaffName(staffId);
    const updated = await ApplicationDocumentRepository.reject(
      documentId,
      staffId,
      staffName,
      reason,
      doc.verificationHistory,
    );
    await notifyStudentOfDocumentRejection({
      id: doc.id,
      studentId: doc.application.studentId,
      documentType: updated.documentType,
      reason,
    });
    return updated;
  }
}
