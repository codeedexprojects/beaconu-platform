import { Request, Response } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { ApiResponse } from "@/shared/responses/api-response";
import { ValidationError } from "@/shared/errors";
import { UploadService } from "../upload.service";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../upload.constants";
import type { AllowedMimeType } from "../upload.constants";

const presignSchema = z.object({
  mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]], {
    error:
      "Allowed: image/jpeg, image/png, image/webp, application/pdf, video/mp4, video/webm, video/quicktime",
  }),
  fileSizeBytes: z.number().int().positive(),
  context: z.string().trim().min(1).max(100),
});

const verifySchema = z.object({
  key: z.string().min(1),
});

export class CollegeAdminUploadController {
  static async presign(req: Request, res: Response): Promise<void> {
    const collegeId = req.collegeId!;
    const { mimeType, fileSizeBytes, context } = presignSchema.parse(req.body);

    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(
        `File must not exceed ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
      );
    }

    const key = `college/${collegeId}/${context}/${randomUUID()}`;
    const result = await UploadService.presign(
      key,
      mimeType as AllowedMimeType,
    );

    res.status(200).json(ApiResponse.success("Upload URL generated", result));
  }

  static async verify(req: Request, res: Response): Promise<void> {
    const collegeId = req.collegeId!;
    const { key } = verifySchema.parse(req.body);
    const expectedPrefix = `college/${collegeId}/`;

    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this college");
    }

    const result = await UploadService.verify(key);
    res.status(200).json(ApiResponse.success("Upload verified", result));
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const collegeId = req.collegeId!;
    const { key } = verifySchema.parse(req.body);
    const expectedPrefix = `college/${collegeId}/`;

    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this college");
    }

    const result = await UploadService.remove(key);
    res.status(200).json(ApiResponse.success("File deleted", result));
  }
}
