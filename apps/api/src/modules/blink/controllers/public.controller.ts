import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";

export class BlinkPublicController {
  static async resolveReferralCode(req: Request, res: Response) {
    const code = req.params["code"] as string;
    const result = await BlinkService.resolveReferralCode(code);
    return res
      .status(200)
      .json(ApiResponse.success("Referral code resolved", result));
  }
}
