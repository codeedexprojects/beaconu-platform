import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { SidebarHintsService } from "../services/sidebar-hints.service";
import { ReportsQuery } from "../queries/reports.query";
import { reportsQuerySchema } from "../validators/reports.validator";

export class DashboardCollegeAdminController {
  static async getSidebarHints(req: Request, res: Response): Promise<void> {
    const result = await SidebarHintsService.getForCollege(req.collegeId!);
    res.status(200).json(ApiResponse.success("Sidebar hints fetched", result));
  }

  static async getEnrollmentOverview(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { admission_cycle_id } = reportsQuerySchema.parse(req.query);
    const result = await ReportsQuery.getEnrollmentOverview(
      req.collegeId!,
      admission_cycle_id,
    );
    res
      .status(200)
      .json(ApiResponse.success("Enrollment overview fetched", result));
  }

  static async getAdmissionsFunnel(req: Request, res: Response): Promise<void> {
    const { admission_cycle_id } = reportsQuerySchema.parse(req.query);
    const result = await ReportsQuery.getAdmissionsFunnel(
      req.collegeId!,
      admission_cycle_id,
    );
    res
      .status(200)
      .json(ApiResponse.success("Admissions funnel fetched", result));
  }

  static async getAgeGenderInsights(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { admission_cycle_id } = reportsQuerySchema.parse(req.query);
    const result = await ReportsQuery.getAgeGenderInsights(
      req.collegeId!,
      admission_cycle_id,
    );
    res
      .status(200)
      .json(ApiResponse.success("Age & gender insights fetched", result));
  }

  static async getGeographicOrigin(req: Request, res: Response): Promise<void> {
    const { admission_cycle_id } = reportsQuerySchema.parse(req.query);
    const result = await ReportsQuery.getGeographicOrigin(
      req.collegeId!,
      admission_cycle_id,
    );
    res
      .status(200)
      .json(ApiResponse.success("Geographic origin analysis fetched", result));
  }
}
