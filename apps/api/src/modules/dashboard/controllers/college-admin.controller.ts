import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { SidebarHintsService } from "../services/sidebar-hints.service";

export class DashboardCollegeAdminController {
  static async getSidebarHints(req: Request, res: Response): Promise<void> {
    const result = await SidebarHintsService.getForCollege(req.collegeId!);
    res.status(200).json(ApiResponse.success("Sidebar hints fetched", result));
  }
}
