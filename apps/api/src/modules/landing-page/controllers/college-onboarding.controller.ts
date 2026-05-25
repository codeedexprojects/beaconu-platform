import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { collegeOnboardingSchemas } from "../validators/college-onboarding.validator";
import { CollegeOnboardingService } from "../services/college-onboarding.service";

export class CollegeOnboardingController {
  // POST /api/v1/public/college-onboarding — public, no auth
  static async submit(req: Request, res: Response) {
    const data = collegeOnboardingSchemas.submit.parse(req.body);
    const result = await CollegeOnboardingService.submit(data);
    return res
      .status(201)
      .json(
        ApiResponse.success(
          "Thank you! Your request has been submitted and is under review.",
          result,
        ),
      );
  }
}
