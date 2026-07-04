import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { DocumentsQuery } from "../queries/documents.query";
import { DocumentSubmissionRequestService } from "../services/document-submission-request.service";
import { DocumentRequestService } from "../services/document-request.service";
import {
  createSubmissionRequestSchema,
  reviewSubmissionSchema,
  submissionRequestListQuerySchema,
  issueDocumentRequestSchema,
  rejectDocumentRequestSchema,
  documentRequestListQuerySchema,
} from "../validators/documents.validator";

export class CollegeAdminDocumentsController {
  // ── Direction A: request a document from a student, then verify it ──────

  static async createSubmissionRequest(req: Request, res: Response) {
    const data = createSubmissionRequestSchema.parse(req.body);
    const result = await DocumentSubmissionRequestService.create(
      req.collegeId!,
      req.userId!,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Document request created", result));
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

  // ── Direction B: fulfill/reject documents students requested from us ────

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

  static async startReview(req: Request, res: Response) {
    const result = await DocumentRequestService.startReview(
      req.params.requestId as string,
      req.collegeId!,
      req.userId!,
    );
    return res.json(
      ApiResponse.success("Document request under review", result),
    );
  }

  static async sendForApproval(req: Request, res: Response) {
    const result = await DocumentRequestService.sendForApproval(
      req.params.requestId as string,
      req.collegeId!,
      req.userId!,
    );
    return res.json(
      ApiResponse.success("Document request sent for approval", result),
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
}
