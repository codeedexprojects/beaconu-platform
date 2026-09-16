import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CollegeLegalDocumentService } from "../services/college-legal-documents.service";
import {
  legalDocTypeParamSchema,
  setLegalDocumentStatusSchema,
  upsertLegalDocumentSchema,
} from "../validators/legal-documents.validator";

export class CollegeLegalDocumentCollegeAdminController {
  static async list(req: Request, res: Response) {
    const result = await CollegeLegalDocumentService.listForCollegeAdmin(
      req.collegeId!,
    );
    return res.json(ApiResponse.success("Legal documents fetched", result));
  }

  static async getOne(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const result = await CollegeLegalDocumentService.getForCollegeAdmin(
      req.collegeId!,
      docType,
    );
    return res.json(ApiResponse.success("Legal document fetched", result));
  }

  static async upsert(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const data = upsertLegalDocumentSchema.parse(req.body);
    const result = await CollegeLegalDocumentService.upsert(
      req.collegeId!,
      docType,
      data,
      req.userId!,
    );
    return res.json(ApiResponse.success("Legal document saved", result));
  }

  static async setStatus(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const data = setLegalDocumentStatusSchema.parse(req.body);
    const result = await CollegeLegalDocumentService.setStatus(
      req.collegeId!,
      docType,
      data,
      req.userId!,
    );
    return res.json(ApiResponse.success("Legal document updated", result));
  }
}

export class CollegeLegalDocumentPublicController {
  static async list(req: Request, res: Response) {
    const result = await CollegeLegalDocumentService.listPublic(
      req.params.collegeId as string,
    );
    return res.json(ApiResponse.success("Legal documents fetched", result));
  }

  static async getOne(req: Request, res: Response) {
    const { docType } = legalDocTypeParamSchema.parse(req.params);
    const result = await CollegeLegalDocumentService.getPublic(
      req.params.collegeId as string,
      docType,
    );
    return res.json(ApiResponse.success("Legal document fetched", result));
  }
}
