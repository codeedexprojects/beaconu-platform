import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ScholarshipConfigService } from "../services/scholarship-config.service";
import { ScholarshipApplicationService } from "../services/scholarship-application.service";
import {
  createScholarshipConfigSchema,
  updateScholarshipConfigSchema,
  reviewScholarshipApplicationSchema,
  listScholarshipApplicationsQuerySchema,
} from "../validators/scholarship.validator";

export class ScholarshipCollegeAdminController {
  static async createConfig(req: Request, res: Response) {
    const body = createScholarshipConfigSchema.parse(req.body);
    const result = await ScholarshipConfigService.create(req.collegeId!, {
      name: body.name,
      scholarshipType: body.scholarship_type,
      discountType: body.discount_type,
      discountValue: body.discount_value,
      requiredDocuments: body.required_documents,
    });
    return res
      .status(201)
      .json(ApiResponse.success("Scholarship created", result));
  }

  static async listConfigs(req: Request, res: Response) {
    const result = await ScholarshipConfigService.list(req.collegeId!);
    return res.json(ApiResponse.success("Scholarships fetched", result));
  }

  static async updateConfig(req: Request, res: Response) {
    const body = updateScholarshipConfigSchema.parse(req.body);
    const result = await ScholarshipConfigService.update(
      req.collegeId!,
      req.params.id as string,
      {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.scholarship_type !== undefined && {
          scholarshipType: body.scholarship_type,
        }),
        ...(body.discount_type !== undefined && {
          discountType: body.discount_type,
        }),
        ...(body.discount_value !== undefined && {
          discountValue: body.discount_value,
        }),
        ...(body.required_documents !== undefined && {
          requiredDocuments: body.required_documents,
        }),
        ...(body.is_active !== undefined && { isActive: body.is_active }),
      },
    );
    return res.json(ApiResponse.success("Scholarship updated", result));
  }

  static async listApplications(req: Request, res: Response) {
    const query = listScholarshipApplicationsQuerySchema.parse(req.query);
    const result = await ScholarshipApplicationService.listForCollege(
      req.collegeId!,
      query.status,
    );
    return res.json(
      ApiResponse.success("Scholarship applications fetched", result),
    );
  }

  static async reviewApplication(req: Request, res: Response) {
    const body = reviewScholarshipApplicationSchema.parse(req.body);
    const result = await ScholarshipApplicationService.review(
      req.collegeId!,
      req.userId!,
      req.params.id as string,
      body,
    );
    return res.json(
      ApiResponse.success("Scholarship application reviewed", result),
    );
  }
}
