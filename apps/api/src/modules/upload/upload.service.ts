import { randomUUID } from "crypto";
import {
  generateUploadUrl,
  generateDownloadUrl,
  objectExists,
  permanentUrl,
} from "@/shared/lib/s3";
import { NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import {
  MIME_TO_EXT,
  PRESIGN_EXPIRY_SECONDS,
  VIEW_URL_EXPIRY_SECONDS,
} from "./upload.constants";
import type { AllowedMimeType } from "./upload.constants";
import type { PresignResponse, VerifyResponse } from "./upload.types";

export class UploadService {
  static buildKey(
    entityType: string,
    entityId: string,
    context: string,
    mimeType: AllowedMimeType,
  ): string {
    const ext = MIME_TO_EXT[mimeType];
    return `${entityType}/${entityId}/${context}/${randomUUID()}.${ext}`;
  }

  static async presign(
    key: string,
    mimeType: string,
  ): Promise<PresignResponse> {
    const uploadUrl = await generateUploadUrl(key, mimeType, PRESIGN_EXPIRY_SECONDS);
    logger.info({ action: "UPLOAD_PRESIGNED", module: "upload", key, mimeType });
    return { uploadUrl, key, expiresIn: PRESIGN_EXPIRY_SECONDS };
  }

  static async verify(key: string): Promise<VerifyResponse> {
    const exists = await objectExists(key);
    if (!exists) {
      throw new NotFoundError("File not found in storage. Please upload first.");
    }
    const viewUrl = await generateDownloadUrl(key, VIEW_URL_EXPIRY_SECONDS);
    logger.info({ action: "UPLOAD_VERIFIED", module: "upload", key });
    return { verified: true, permanentUrl: permanentUrl(key), viewUrl };
  }
}
