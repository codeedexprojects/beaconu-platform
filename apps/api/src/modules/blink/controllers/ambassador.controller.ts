import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";

export class AmbassadorController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BlinkService.registerAmbassador(
        req.body,
        req.userId!,
      );
      return res
        .status(201)
        .json(
          ApiResponse.success("Campus ambassador created successfully", result),
        );
    } catch (error) {
      next(error);
    }
  }
}
