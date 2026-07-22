import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CourseQuotaService } from "../services/course-quota.service";
import {
  attachCourseQuotaSchema,
  updateCourseQuotaSchema,
  courseQuotaParamSchema,
  courseIdOnlyParamSchema,
} from "../validators/course-quota.validator";

export class CourseQuotasController {
  static async listCourseQuotas(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = courseIdOnlyParamSchema.parse(req.params);
    const quotas = await CourseQuotaService.listCourseQuotas(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Course quotas fetched", quotas));
  }

  static async attachQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = courseIdOnlyParamSchema.parse(req.params);
    const body = attachCourseQuotaSchema.parse(req.body);
    const quota = await CourseQuotaService.attachQuota(id, collegeId, body);
    return res
      .status(201)
      .json(ApiResponse.success("Quota attached to course", quota));
  }

  static async updateCourseQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id, courseQuotaId } = courseQuotaParamSchema.parse(req.params);
    const body = updateCourseQuotaSchema.parse(req.body);
    const quota = await CourseQuotaService.updateCourseQuota(
      id,
      collegeId,
      courseQuotaId,
      body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Course quota updated", quota));
  }

  static async detachQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id, courseQuotaId } = courseQuotaParamSchema.parse(req.params);
    await CourseQuotaService.detachQuota(id, collegeId, courseQuotaId);
    return res
      .status(200)
      .json(ApiResponse.success("Quota detached from course", null));
  }
}
