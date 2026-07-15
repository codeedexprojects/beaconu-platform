import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AssessmentStartQuery } from "../queries/assessment-start.query";

export class StudentAssessmentController {
  static async getStartInfo(req: Request, res: Response) {
    const result = await AssessmentStartQuery.getBySlotId(
      req.collegeId!,
      req.params.slotId as string,
    );
    return res.json(
      ApiResponse.success("Assessment start info fetched", result),
    );
  }
}
