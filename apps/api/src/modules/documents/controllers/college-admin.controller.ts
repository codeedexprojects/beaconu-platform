import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { DocumentsQuery } from "../queries/documents.query";
import { DocumentSubmissionRequestService } from "../services/document-submission-request.service";
import { DocumentRequestService } from "../services/document-request.service";
import { DocumentTemplateService } from "../services/document-template.service";
import {
  createSubmissionRequestSchema,
  reviewSubmissionSchema,
  submissionRequestListQuerySchema,
  issueDocumentRequestSchema,
  rejectDocumentRequestSchema,
  documentRequestListQuerySchema,
  createDocumentTemplateSchema,
  updateDocumentTemplateSchema,
  templateListQuerySchema,
} from "../validators/documents.validator";

export class CollegeAdminDocumentsController {
  static async createSubmissionRequest(req: Request, res: Response) {
    const data = createSubmissionRequestSchema.parse(req.body);
    const result = await DocumentSubmissionRequestService.create(
      req.collegeId!,
      req.userId!,
      data,
    );
    const message = Array.isArray(result)
      ? `Document requested from ${result.length} student${result.length === 1 ? "" : "s"}`
      : "Document request created";
    return res.status(201).json(ApiResponse.success(message, result));
  }

  static async listSubmissionRequests(req: Request, res: Response) {
    const filters = submissionRequestListQuerySchema.parse(req.query);
    const result = await DocumentsQuery.listSubmissionRequestsForCollege(
      req.collegeId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Document requests fetched", {
        requests: result.requests,
        meta: result.meta,
      }),
    );
  }

  static async reviewSubmission(req: Request, res: Response) {
    const data = reviewSubmissionSchema.parse(req.body);
    const result = await DocumentSubmissionRequestService.review(
      req.params.requestId as string,
      req.collegeId!,
      req.userId!,
      data,
    );
    return res.json(ApiResponse.success("Document reviewed", result));
  }

  static async listDocumentRequests(req: Request, res: Response) {
    const filters = documentRequestListQuerySchema.parse(req.query);
    const result = await DocumentsQuery.listDocumentRequestsForCollege(
      req.collegeId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Document requests fetched", {
        requests: result.requests,
        meta: result.meta,
      }),
    );
  }

  static async approveDocumentRequest(req: Request, res: Response) {
    const result = await DocumentRequestService.approve(
      req.params.requestId as string,
      req.collegeId!,
      req.userId!,
    );
    return res.json(ApiResponse.success("Document request approved", result));
  }

  static async issueDocumentRequest(req: Request, res: Response) {
    const data = issueDocumentRequestSchema.parse(req.body);
    const result = await DocumentRequestService.issue(
      req.params.requestId as string,
      req.collegeId!,
      req.userId!,
      data,
    );
    return res.json(ApiResponse.success("Document issued", result));
  }

  static async rejectDocumentRequest(req: Request, res: Response) {
    const data = rejectDocumentRequestSchema.parse(req.body);
    const result = await DocumentRequestService.reject(
      req.params.requestId as string,
      req.collegeId!,
      req.userId!,
      data,
    );
    return res.json(ApiResponse.success("Document request rejected", result));
  }

  static async createTemplate(req: Request, res: Response) {
    const data = createDocumentTemplateSchema.parse(req.body);
    const result = await DocumentTemplateService.create(req.collegeId!, data);
    return res
      .status(201)
      .json(ApiResponse.success("Document template created", result));
  }

  static async listTemplates(req: Request, res: Response) {
    const filters = templateListQuerySchema.parse(req.query);
    const result = await DocumentsQuery.listTemplatesForCollege(
      req.collegeId!,
      filters.include_inactive,
    );
    return res.json(ApiResponse.success("Document templates fetched", result));
  }

  static async updateTemplate(req: Request, res: Response) {
    const data = updateDocumentTemplateSchema.parse(req.body);
    const result = await DocumentTemplateService.update(
      req.params.templateId as string,
      req.collegeId!,
      data,
    );
    return res.json(ApiResponse.success("Document template updated", result));
  }

  static async activateTemplate(req: Request, res: Response) {
    const result = await DocumentTemplateService.setActive(
      req.params.templateId as string,
      req.collegeId!,
      true,
    );
    return res.json(ApiResponse.success("Document template activated", result));
  }

  static async deactivateTemplate(req: Request, res: Response) {
    const result = await DocumentTemplateService.setActive(
      req.params.templateId as string,
      req.collegeId!,
      false,
    );
    return res.json(
      ApiResponse.success("Document template deactivated", result),
    );
  }
}
