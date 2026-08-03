import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ValidationError } from "@/shared/errors";
import { ScholarshipConfigService } from "../services/scholarship-config.service";
import { ScholarshipApplicationService } from "../services/scholarship-application.service";
import {
  applyScholarshipSchema,
  listScholarshipConfigsQuerySchema,
} from "../validators/scholarship.validator";

export class ScholarshipStudentController {
  /** Browse scholarships a student could optionally apply for — applying
   * is never required to proceed with an admission application. */
  static async listConfigs(req: Request, res: Response) {
    const query = listScholarshipConfigsQuerySchema.parse(req.query);
    if (!query.college_id) {
      throw new ValidationError("college_id is required");
    }
    const result = await ScholarshipConfigService.list(
      query.college_id,
      query.active_only ?? true,
    );
    return res.json(ApiResponse.success("Scholarships fetched", result));
  }

  static async apply(req: Request, res: Response) {
    const body = applyScholarshipSchema.parse(req.body);
    const result = await ScholarshipApplicationService.apply(req.userId!, {
      scholarshipConfigId: body.scholarship_config_id,
      applicationId: body.application_id,
      reason: body.reason,
      annualFamilyIncomeRange: body.annual_family_income_range,
      supportingDocuments: body.supporting_documents,
    });
    return res
      .status(201)
      .json(ApiResponse.success("Scholarship application submitted", result));
  }

  static async listMine(req: Request, res: Response) {
    const result = await ScholarshipApplicationService.listMine(req.userId!);
    return res.json(
      ApiResponse.success("Scholarship applications fetched", result),
    );
  }

  static async getMine(req: Request, res: Response) {
    const result = await ScholarshipApplicationService.getMine(
      req.params.id as string,
      req.userId!,
    );
    return res.json(
      ApiResponse.success("Scholarship application fetched", result),
    );
  }
}
