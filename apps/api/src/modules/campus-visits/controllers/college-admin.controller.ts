import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import { campusVisitListQuerySchema } from "../validators/campus-visits.validator";
import { upsertAvailabilitySchema } from "../validators/campus-visit-availability.validator";
import { CampusVisitAvailabilityService } from "../services/campus-visit-availability.service";
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

  static async getStats(req: Request, res: Response) {
    const stats = await CampusVisitsQuery.getCollegeStats(req.collegeId!);
    return res.json(ApiResponse.success("Campus visit stats fetched", stats));
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

  static async listAvailability(req: Request, res: Response) {
    const availability = await CampusVisitAvailabilityService.listForCollege(
      req.collegeId!,
    );
    return res.json(
      ApiResponse.success("Campus visit availability fetched", availability),
    );
  }

  static async upsertAvailability(req: Request, res: Response) {
    const data = upsertAvailabilitySchema.parse(req.body);
    const availability = await CampusVisitAvailabilityService.upsert(
      req.collegeId!,
      data,
    );
    return res.json(
      ApiResponse.success("Campus visit availability updated", availability),
    );
  }
}
