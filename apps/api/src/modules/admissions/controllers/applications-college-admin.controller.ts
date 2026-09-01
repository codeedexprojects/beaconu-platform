import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import {
  listApplicationsQuerySchema,
  listPendingEnrollmentQuerySchema,
  listPendingShortlistQuerySchema,
  rejectApplicationCourseSchema,
} from "../validators/application.validator";
import { ApplicationListQuery } from "../queries/application-list.query";
import { ApplicationDetailQuery } from "../queries/application-detail.query";
import { PendingEnrollmentQuery } from "../queries/pending-enrollment.query";
import { EnrollmentService } from "../services/enrollment.service";
import { ApplicationCourseService } from "../services/application-course.service";

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
}
