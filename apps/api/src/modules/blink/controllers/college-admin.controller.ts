import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";

export class CollegeAdminBlinkController {
  static async listAmbassadors(req: Request, res: Response) {
    const result = await BlinkService.listCampusAmbassadors(req.collegeId!);
    return res
      .status(200)
      .json(ApiResponse.success("Campus ambassadors fetched", result));
  }

  static async createAmbassador(req: Request, res: Response) {
    const result = await BlinkService.registerAmbassador(
      req.body,
      req.userId!,
      req.collegeId!,
    );
    return res
      .status(201)
      .json(
        ApiResponse.success("Campus ambassador created successfully", result),
      );
  }
}
