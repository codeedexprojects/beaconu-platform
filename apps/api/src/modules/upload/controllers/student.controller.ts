import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ValidationError } from "@/shared/errors";
import {
  presignBodySchema,
  verifyBodySchema,
  removeBodySchema,
} from "../upload.validators";
import { UploadService } from "../upload.service";
import type { AllowedMimeType } from "../upload.constants";

const ENTITY_TYPE = "students";

export class StudentUploadController {
  static async presignAvatar(req: Request, res: Response): Promise<void> {
    const { mimeType } = presignBodySchema.parse(req.body);
    const key = UploadService.buildKey(
      ENTITY_TYPE,
      req.userId!,
      "avatars",
      mimeType as AllowedMimeType,
    );
    const result = await UploadService.presign(key, mimeType);
    res.status(200).json(ApiResponse.success("Upload URL generated", result));
  }

  static async verifyAvatar(req: Request, res: Response): Promise<void> {
    const { key } = verifyBodySchema.parse(req.body);
    const expectedPrefix = `${ENTITY_TYPE}/${req.userId!}/avatars/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this context");
    }
    const result = await UploadService.verify(key);
    res.status(200).json(ApiResponse.success("Upload verified", result));
  }

  static async presignRefundProof(req: Request, res: Response): Promise<void> {
    const { mimeType } = presignBodySchema.parse(req.body);
    const key = UploadService.buildKey(
      ENTITY_TYPE,
      req.userId!,
      "refund-proof",
      mimeType as AllowedMimeType,
    );
    const result = await UploadService.presign(key, mimeType);
    res.status(200).json(ApiResponse.success("Upload URL generated", result));
  }

  static async verifyRefundProof(req: Request, res: Response): Promise<void> {
    const { key } = verifyBodySchema.parse(req.body);
    const expectedPrefix = `${ENTITY_TYPE}/${req.userId!}/refund-proof/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this context");
    }
    const result = await UploadService.verify(key);
    res.status(200).json(ApiResponse.success("Upload verified", result));
  }

  static async presignDocument(req: Request, res: Response): Promise<void> {
    const { mimeType } = presignBodySchema.parse(req.body);
    const key = UploadService.buildKey(
      ENTITY_TYPE,
      req.userId!,
      "documents",
      mimeType as AllowedMimeType,
    );
    const result = await UploadService.presign(key, mimeType);
    res.status(200).json(ApiResponse.success("Upload URL generated", result));
  }

  static async verifyDocument(req: Request, res: Response): Promise<void> {
    const { key } = verifyBodySchema.parse(req.body);
    const expectedPrefix = `${ENTITY_TYPE}/${req.userId!}/documents/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this context");
    }
    const result = await UploadService.verify(key);
    res.status(200).json(ApiResponse.success("Upload verified", result));
  }

  static async presignAntiRaggingEvidence(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { mimeType } = presignBodySchema.parse(req.body);
    const key = UploadService.buildKey(
      ENTITY_TYPE,
      req.userId!,
      "anti-ragging",
      mimeType as AllowedMimeType,
    );
    const result = await UploadService.presign(key, mimeType);
    res.status(200).json(ApiResponse.success("Upload URL generated", result));
  }

  static async verifyAntiRaggingEvidence(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { key } = verifyBodySchema.parse(req.body);
    const expectedPrefix = `${ENTITY_TYPE}/${req.userId!}/anti-ragging/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this context");
    }
    const result = await UploadService.verify(key);
    res.status(200).json(ApiResponse.success("Upload verified", result));
  }

  static async removeFile(req: Request, res: Response): Promise<void> {
    const { key } = removeBodySchema.parse(req.body);
    const expectedPrefix = `${ENTITY_TYPE}/${req.userId!}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError("Invalid key: does not belong to this context");
    }
    const result = await UploadService.remove(key);
    res.status(200).json(ApiResponse.success("File deleted", result));
  }
}
