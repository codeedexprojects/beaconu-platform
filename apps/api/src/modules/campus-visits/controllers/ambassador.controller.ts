import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsService } from "../services/campus-visits.service";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import {
  reassignCampusVisitSchema,
  campusVisitListQuerySchema,
  completeCampusVisitSchema,
} from "../validators/campus-visits.validator";

export class AmbassadorCampusVisitController {
  static async list(req: Request, res: Response) {
    const filters = campusVisitListQuerySchema.parse(req.query);
    const result = await CampusVisitsQuery.listByAmbassador(
      req.userId!,
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

  static async accept(req: Request, res: Response) {
    await CampusVisitsService.accept(req.params.visitId as string, req.userId!);
    return res.json(ApiResponse.success("Campus visit accepted", null));
  }

  static async complete(req: Request, res: Response) {
    const data = completeCampusVisitSchema.parse(req.body ?? {});
    await CampusVisitsService.complete(
      req.params.visitId as string,
      req.userId!,
      data,
    );
    return res.json(ApiResponse.success("Campus visit completed", null));
  }

  static async reassign(req: Request, res: Response) {
    const data = reassignCampusVisitSchema.parse(req.body);
    await CampusVisitsService.reassign(
      req.params.visitId as string,
      req.userId!,
      data,
    );
    return res.json(ApiResponse.success("Campus visit reassigned", null));
  }
}
