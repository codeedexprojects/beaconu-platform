import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { collegeOnboardingSchemas } from "@/modules/landing-page/validators/college-onboarding.validator";
import { CollegeOnboardingService } from "@/modules/landing-page/services/college-onboarding.service";

export class CollegeLeadsController {
  // POST /api/v1/admin/college-leads
  static async create(req: Request, res: Response) {
    const data = collegeOnboardingSchemas.submit.parse(req.body);
    const result = await CollegeOnboardingService.createByAdmin(data);
    return res
      .status(201)
      .json(ApiResponse.success("College lead created successfully", result));
  }

  // GET /api/v1/admin/college-leads
  static async list(req: Request, res: Response) {
    const filters = collegeOnboardingSchemas.list.parse(req.query);
    const result = await CollegeOnboardingService.list(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "College onboarding requests fetched successfully",
          result,
        ),
      );
  }

  // GET /api/v1/admin/college-leads/:id
  static async getById(req: Request, res: Response) {
    const id = String(req.params.id);
    const result = await CollegeOnboardingService.getById(id);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "College onboarding request fetched successfully",
          result,
        ),
      );
  }

  // PATCH /api/v1/admin/college-leads/:id
  static async update(req: Request, res: Response) {
    const id = String(req.params.id);
    const data = collegeOnboardingSchemas.submit.parse(req.body);
    const result = await CollegeOnboardingService.updateLead(id, data);
    return res
      .status(200)
      .json(ApiResponse.success("College lead updated successfully", result));
  }

  // PATCH /api/v1/admin/college-leads/:id/status
  static async updateStatus(req: Request, res: Response) {
    const id = String(req.params.id);
    const data = collegeOnboardingSchemas.updateStatus.parse(req.body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminId = (req as any).user?.id as string;
    const result = await CollegeOnboardingService.updateStatus(
      id,
      data,
      adminId,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Status updated successfully", result));
  }

  // GET /api/v1/admin/college-leads/stats
  static async getStats(_req: Request, res: Response) {
    const result = await CollegeOnboardingService.getStats();
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "College onboarding stats fetched successfully",
          result,
        ),
      );
  }
}
