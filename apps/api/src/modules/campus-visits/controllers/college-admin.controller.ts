import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import { campusVisitListQuerySchema } from "../validators/campus-visits.validator";
import { NotFoundError } from "@/shared/errors";

export class CollegeAdminCampusVisitController {
  static async list(req: Request, res: Response) {
    const filters = campusVisitListQuerySchema.parse(req.query);
    const result = await CampusVisitsQuery.listByCollege(
      req.collegeId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Campus visits fetched", {
        visits: result.visits,
        meta: result.meta,
      }),
    );
  }

  static async getOne(req: Request, res: Response) {
    const visit = await CampusVisitsQuery.getDetail(
      req.params.visitId as string,
    );
    if (!visit) throw new NotFoundError("Campus visit not found");
    if (visit.collegeId !== req.collegeId!) {
      throw new NotFoundError("Campus visit not found");
    }
    return res.json(ApiResponse.success("Campus visit fetched", visit));
  }
}
