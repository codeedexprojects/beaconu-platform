import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import {
  listApplicationsQuerySchema,
  listPendingEnrollmentQuerySchema,
  listPendingShortlistQuerySchema,
  rejectApplicationCourseSchema,
} from "../validators/application.validator";
import {
  documentVerificationListQuerySchema,
  rejectApplicationDocumentSchema,
} from "../validators/application-document.validator";
import { ApplicationListQuery } from "../queries/application-list.query";
import { ApplicationDetailQuery } from "../queries/application-detail.query";
import { PendingEnrollmentQuery } from "../queries/pending-enrollment.query";
import { ApplicationDocumentVerificationQuery } from "../queries/application-document-verification.query";
import { EnrollmentService } from "../services/enrollment.service";
import { ApplicationCourseService } from "../services/application-course.service";
import { ApplicationDocumentService } from "../services/application-document.service";

export class ApplicationsCollegeAdminController {
  static async list(req: Request, res: Response): Promise<void> {
    const filters = listApplicationsQuerySchema.parse(req.query);
    const result = await ApplicationListQuery.listForCollegeAdmin(
      req.collegeId!,
      filters,
    );
    res.status(200).json(
      ApiResponse.success("Applications fetched", {
        applications: result.applications,
        meta: result.meta,
      }),
    );
  }

  static async listPendingEnrollment(
    req: Request,
    res: Response,
  ): Promise<void> {
    const filters = listPendingEnrollmentQuerySchema.parse(req.query);
    const result = await PendingEnrollmentQuery.listForCollegeAdmin(
      req.collegeId!,
      filters,
    );
    res
      .status(200)
      .json(ApiResponse.success("Pending enrollments fetched", result));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const result = await ApplicationDetailQuery.getForCollegeAdmin(
      req.params.id as string,
      req.collegeId!,
    );
    res.status(200).json(ApiResponse.success("Application fetched", result));
  }

  static async enrollCourse(req: Request, res: Response): Promise<void> {
    const result = await EnrollmentService.enroll(
      req.collegeId!,
      req.userId!,
      req.params.applicationCourseId as string,
    );
    res.status(200).json(ApiResponse.success("Student enrolled", result));
  }

  static async listPendingShortlist(
    req: Request,
    res: Response,
  ): Promise<void> {
    const query = listPendingShortlistQuerySchema.parse(req.query);
    const result = await ApplicationCourseService.listPendingShortlist(
      req.collegeId!,
      { search: query.search },
    );
    res
      .status(200)
      .json(ApiResponse.success("Pending shortlisting fetched", result));
  }

  static async getPendingShortlistDetail(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await ApplicationCourseService.getPendingShortlistDetail(
      req.collegeId!,
      req.params.applicationCourseId as string,
    );
    res
      .status(200)
      .json(ApiResponse.success("Pending shortlist detail fetched", result));
  }

  static async rejectCourse(req: Request, res: Response): Promise<void> {
    const body = rejectApplicationCourseSchema.parse(req.body);
    await ApplicationCourseService.rejectCourse(
      req.collegeId!,
      req.userId!,
      req.params.applicationCourseId as string,
      body.reason,
    );
    res
      .status(200)
      .json(ApiResponse.success("Application course rejected", {}));
  }

  static async listDocumentsUnderReview(
    req: Request,
    res: Response,
  ): Promise<void> {
    const filters = documentVerificationListQuerySchema.parse(req.query);
    const result = await ApplicationDocumentVerificationQuery.listUnderReview(
      req.collegeId!,
      filters,
    );
    res
      .status(200)
      .json(ApiResponse.success("Documents under review fetched", result));
  }

  static async listPartiallyVerifiedDocuments(
    req: Request,
    res: Response,
  ): Promise<void> {
    const filters = documentVerificationListQuerySchema.parse(req.query);
    const result =
      await ApplicationDocumentVerificationQuery.listPartiallyVerified(
        req.collegeId!,
        filters,
      );
    res
      .status(200)
      .json(
        ApiResponse.success("Partially verified applications fetched", result),
      );
  }

  static async getDocumentVerificationDetail(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await ApplicationDocumentVerificationQuery.getDetail(
      req.collegeId!,
      req.params.applicationId as string,
    );
    res
      .status(200)
      .json(
        ApiResponse.success("Document verification detail fetched", result),
      );
  }

  static async verifyDocument(req: Request, res: Response): Promise<void> {
    const result = await ApplicationDocumentService.verify(
      req.collegeId!,
      req.userId!,
      req.params.documentId as string,
    );
    res.status(200).json(ApiResponse.success("Document verified", result));
  }

  static async rejectDocument(req: Request, res: Response): Promise<void> {
    const body = rejectApplicationDocumentSchema.parse(req.body);
    const result = await ApplicationDocumentService.reject(
      req.collegeId!,
      req.userId!,
      req.params.documentId as string,
      body.reason,
    );
    res.status(200).json(ApiResponse.success("Document rejected", result));
  }
}
