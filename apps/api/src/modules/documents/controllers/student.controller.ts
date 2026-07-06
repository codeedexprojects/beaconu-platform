import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { DocumentsQuery } from "../queries/documents.query";
import { DocumentSubmissionRequestService } from "../services/document-submission-request.service";
import { DocumentRequestService } from "../services/document-request.service";
import { NotFoundError } from "@/shared/errors";
import {
  submitDocumentSchema,
  submissionRequestListQuerySchema,
  createDocumentRequestSchema,
  documentRequestListQuerySchema,
  resubmitDocumentRequestSchema,
  studentTemplateListQuerySchema,
} from "../validators/documents.validator";

export class StudentDocumentsController {
  // ── Direction A: documents the college has requested from this student ──

  static async listSubmissionRequests(req: Request, res: Response) {
    const filters = submissionRequestListQuerySchema.parse(req.query);
    const result = await DocumentsQuery.listSubmissionRequestsForStudent(
      req.userId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Document requests fetched", {
        requests: result.requests,
        meta: result.meta,
      }),
    );
  }

  static async submitDocument(req: Request, res: Response) {
    const data = submitDocumentSchema.parse(req.body);
    const result = await DocumentSubmissionRequestService.submit(
      req.params.requestId as string,
      req.userId!,
      data,
    );
    return res.json(
      ApiResponse.success("Document submitted successfully", result),
    );
  }

  // ── Direction B: official documents this student has requested from the college ──

  static async createDocumentRequest(req: Request, res: Response) {
    const data = createDocumentRequestSchema.parse(req.body);
    const result = await DocumentRequestService.create(
      req.userId!,
      data.college_id,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Document request submitted", result));
  }

  static async listDocumentRequests(req: Request, res: Response) {
    const filters = documentRequestListQuerySchema.parse(req.query);
    const result = await DocumentsQuery.listDocumentRequestsForStudent(
      req.userId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Document requests fetched", {
        requests: result.requests,
        meta: result.meta,
      }),
    );
  }

  static async getDocumentRequest(req: Request, res: Response) {
    const result = await DocumentsQuery.getDocumentRequestForStudent(
      req.params.requestId as string,
      req.userId!,
    );
    if (!result) throw new NotFoundError("Document request not found");
    return res.json(ApiResponse.success("Document request fetched", result));
  }

  static async resubmitDocumentRequest(req: Request, res: Response) {
    const data = resubmitDocumentRequestSchema.parse(req.body);
    const result = await DocumentRequestService.resubmit(
      req.params.requestId as string,
      req.userId!,
      data,
    );
    return res.json(
      ApiResponse.success("Document request resubmitted", result),
    );
  }

  static async listTemplates(req: Request, res: Response) {
    const filters = studentTemplateListQuerySchema.parse(req.query);
    const result = await DocumentsQuery.listTemplatesForCollege(
      filters.college_id,
      false,
    );
    return res.json(ApiResponse.success("Document templates fetched", result));
  }
}
