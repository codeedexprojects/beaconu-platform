import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsService } from "@/modules/campus-visits/services/campus-visits.service";
import { updateAmbassadorSchema } from "../validators/blink.validator";
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

  static async getAmbassador(req: Request, res: Response) {
    const { id } = req.params;
    const [ambassador, visitStats] = await Promise.all([
      BlinkService.getAmbassadorForCollege(id as string, req.collegeId!),
      CampusVisitsService.getAmbassadorVisitStats(id as string),
    ]);
    return res.status(200).json(
      ApiResponse.success("Campus ambassador fetched", {
        ...ambassador,
        visitStats,
      }),
    );
  }

  static async updateAmbassador(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateAmbassadorSchema.parse(req.body);
    const result = await BlinkService.updateAmbassador(
      id as string,
      req.collegeId!,
      data,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Campus ambassador updated successfully", result),
      );
  }
}
