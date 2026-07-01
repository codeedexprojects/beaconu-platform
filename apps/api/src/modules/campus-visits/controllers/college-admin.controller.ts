import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import { campusVisitListQuerySchema } from "../validators/campus-visits.validator";

export class CollegeAdminCampusVisitController {
  static async list(req: Request, res: Response) {
    const filters = campusVisitListQuerySchema.parse(req.query);
    const result = await CampusVisitsQuery.listByCollege(
      req.collegeId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Campus visits fetched", result.visits, result.meta),
    );
  }
}
