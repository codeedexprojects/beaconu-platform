import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsService } from "../services/campus-visits.service";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import {
  createCampusVisitSchema,
  rescheduleCampusVisitSchema,
  cancelCampusVisitSchema,
  campusVisitListQuerySchema,
} from "../validators/campus-visits.validator";
import { studentAvailabilityQuerySchema } from "../validators/campus-visit-availability.validator";
import { CampusVisitAvailabilityService } from "../services/campus-visit-availability.service";
import { NotFoundError } from "@/shared/errors";

export class StudentCampusVisitController {
  static async book(req: Request, res: Response) {
    const data = createCampusVisitSchema.parse(req.body);
    const visit = await CampusVisitsService.book(data, req.userId!);
    return res.status(201).json(
      ApiResponse.success("Campus visit booked successfully", {
        id: visit.id,
      }),
    );
  }

  static async list(req: Request, res: Response) {
    const filters = campusVisitListQuerySchema.parse(req.query);
    const result = await CampusVisitsQuery.listByStudent(req.userId!, filters);
    return res.json(
      ApiResponse.success("Campus visits fetched", {
        visits: result.visits,
        meta: result.meta,
      }),
    );
  }

  static async listAvailability(req: Request, res: Response) {
    const { college_id } = studentAvailabilityQuerySchema.parse(req.query);
    const availability =
      await CampusVisitAvailabilityService.listForCollege(college_id);
    return res.json(
      ApiResponse.success("Campus visit availability fetched", availability),
    );
  }

  static async getOne(req: Request, res: Response) {
    const visit = await CampusVisitsQuery.getDetail(
      req.params.visitId as string,
    );
    if (!visit) throw new NotFoundError("Campus visit not found");
    return res.json(ApiResponse.success("Campus visit fetched", visit));
  }

  static async reschedule(req: Request, res: Response) {
    const data = rescheduleCampusVisitSchema.parse(req.body);
    await CampusVisitsService.reschedule(
      req.params.visitId as string,
      req.userId!,
      data,
    );
    return res.json(
      ApiResponse.success("Campus visit rescheduled successfully", null),
    );
  }

  static async cancel(req: Request, res: Response) {
    const data = cancelCampusVisitSchema.parse(req.body);
    await CampusVisitsService.cancel(
      req.params.visitId as string,
      req.userId!,
      data,
    );
    return res.json(
      ApiResponse.success("Campus visit cancelled successfully", null),
    );
  }
}
