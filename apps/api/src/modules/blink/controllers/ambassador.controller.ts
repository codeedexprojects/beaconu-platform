import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";
import { ambassadorProfileUpdateSchema } from "../validators/blink.validator";

export class AmbassadorController {
  static async register(req: Request, res: Response) {
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

  static async getProfile(req: Request, res: Response) {
    const result = await BlinkService.getAmbassadorProfile(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Profile fetched successfully", result));
  }

  static async updateProfile(req: Request, res: Response) {
    const data = ambassadorProfileUpdateSchema.parse(req.body);
    const result = await BlinkService.updateAmbassadorProfile(
      req.userId!,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Profile updated successfully", result));
  }
}
