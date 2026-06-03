import { Request, Response } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { ApiResponse } from "@/shared/responses/api-response";
import { ValidationError } from "@/shared/errors";
import { UploadService } from "../upload.service";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  VIDEO_MIME_TYPES,
  VIDEO_PRESIGN_EXPIRY_SECONDS,
} from "../upload.constants";
import type { AllowedMimeType } from "../upload.constants";

const presignSchema = z.object({
  mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]], {
    error:
      "Allowed: image/jpeg, image/png, image/webp, application/pdf, video/mp4, video/webm, video/quicktime",
  }),
  fileSizeBytes: z.number().int().positive(),
  context: z.string().trim().min(1).max(60),
});

const verifySchema = z.object({
  key: z.string().min(1),
});

export class PlatformAdminUploadController {
  static async presign(req: Request, res: Response): Promise<void> {
    const { mimeType, fileSizeBytes, context } = presignSchema.parse(req.body);

    const isVideo = (VIDEO_MIME_TYPES as string[]).includes(mimeType);
    const maxBytes = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_FILE_SIZE_BYTES;

    if (fileSizeBytes > maxBytes) {
      throw new ValidationError(
        isVideo
          ? `Video must not exceed ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)} MB`
          : `File must not exceed ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
      );
    }

    const expiresIn = isVideo ? VIDEO_PRESIGN_EXPIRY_SECONDS : undefined;
    const key = `platform-admin/${context}/${randomUUID()}`;
    const result = await UploadService.presign(
      key,
      mimeType as AllowedMimeType,
      expiresIn,
    );
    res.status(200).json(ApiResponse.success("Upload URL generated", result));
  }

  static async verify(req: Request, res: Response): Promise<void> {
    const { key } = verifySchema.parse(req.body);
    if (!key.startsWith("platform-admin/")) {
      throw new ValidationError(
        "Invalid key: must belong to platform-admin context",
      );
    }
    const result = await UploadService.verify(key);
    res.status(200).json(ApiResponse.success("Upload verified", result));
  }
}
