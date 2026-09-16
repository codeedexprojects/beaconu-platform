import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { LegalDocumentService } from "../services/legal-documents.service";
import {
  legalDocTypeParamSchema,
  setLegalDocumentStatusSchema,
  upsertLegalDocumentSchema,
} from "../validators/legal-documents.validator";

export class LegalDocumentPlatformAdminController {
  static async list(_req: Request, res: Response) {
    const result = await LegalDocumentService.listForAdmin();
    return res.json(ApiResponse.success("Legal documents fetched", result));
  }

  static async getOne(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const result = await LegalDocumentService.getForAdmin(docType);
    return res.json(ApiResponse.success("Legal document fetched", result));
  }

  static async upsert(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const data = upsertLegalDocumentSchema.parse(req.body);
    const result = await LegalDocumentService.upsert(
      docType,
      data,
      req.userId!,
    );
    return res.json(ApiResponse.success("Legal document saved", result));
  }

  static async setStatus(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const data = setLegalDocumentStatusSchema.parse(req.body);
    const result = await LegalDocumentService.setStatus(
      docType,
      data,
      req.userId!,
    );
    return res.json(ApiResponse.success("Legal document updated", result));
  }
}

export class LegalDocumentPublicController {
  static async list(_req: Request, res: Response) {
    const result = await LegalDocumentService.listPublic();
    return res.json(ApiResponse.success("Legal documents fetched", result));
  }

  static async getOne(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const result = await LegalDocumentService.getPublic(docType);
    return res.json(ApiResponse.success("Legal document fetched", result));
  }
}
