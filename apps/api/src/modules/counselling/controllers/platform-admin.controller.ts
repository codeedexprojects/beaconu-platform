import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CounsellingService } from "../services/counselling.service";

export class CounsellingPlatformAdminController {
  static async listAll(req: Request, res: Response) {
    const counsellors = await CounsellingService.listAll({
      counsellor_type: req.query["counsellor_type"] as string | undefined,
      status: req.query["status"] as string | undefined,
    });
    return res
      .status(200)
      .json(ApiResponse.success("Counsellors retrieved", counsellors));
  }

  static async getById(req: Request, res: Response) {
    const counsellor = await CounsellingService.getById(
      req.params["id"] as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Counsellor retrieved", counsellor));
  }

  static async updateStatus(req: Request, res: Response) {
    const counsellor = await CounsellingService.updateStatus(
      req.params["id"] as string,
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Status updated", counsellor));
  }
}
