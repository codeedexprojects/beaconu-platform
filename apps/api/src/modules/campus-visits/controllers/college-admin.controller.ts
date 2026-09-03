import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsQuery } from "../queries/campus-visits.query";
import { CampusVisitsService } from "../services/campus-visits.service";
import { campusVisitListQuerySchema } from "../validators/campus-visits.validator";
import {
  upsertAvailabilitySchema,
  upsertSettingsSchema,
  createDateOverrideSchema,
  monthCalendarQuerySchema,
  cancelByAdminSchema,
  bulkCancelForDateSchema,
} from "../validators/campus-visit-availability.validator";
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

  static async getSettings(req: Request, res: Response) {
    const settings = await CampusVisitsService.getSettings(req.collegeId!);
    return res.json(
      ApiResponse.success("Campus visit settings fetched", {
        collegeId: req.collegeId!,
        visitStartTime: settings
          ? settings.visitStartTime.toISOString().split("T")[1]!.slice(0, 5)
          : null,
        visitEndTime: settings
          ? settings.visitEndTime.toISOString().split("T")[1]!.slice(0, 5)
          : null,
      }),
    );
  }

  static async upsertSettings(req: Request, res: Response) {
    const data = upsertSettingsSchema.parse(req.body);
    const settings = await CampusVisitsService.upsertSettings(
      req.collegeId!,
      data.visit_start_time,
      data.visit_end_time,
    );
    return res.json(
      ApiResponse.success("Campus visit settings updated", {
        collegeId: settings.collegeId,
        visitStartTime: settings.visitStartTime
          .toISOString()
          .split("T")[1]!
          .slice(0, 5),
        visitEndTime: settings.visitEndTime
          .toISOString()
          .split("T")[1]!
          .slice(0, 5),
      }),
    );
  }

  static async getCalendar(req: Request, res: Response) {
    const query = monthCalendarQuerySchema.parse(req.query);
    const days = await CampusVisitsService.getMonthCalendar(
      req.collegeId!,
      query.year,
      query.month,
    );
    return res.json(ApiResponse.success("Campus visit calendar fetched", days));
  }

  static async addDateOverride(req: Request, res: Response) {
    const data = createDateOverrideSchema.parse(req.body);
    const override = await CampusVisitsService.addDateOverride(
      req.collegeId!,
      req.userId!,
      data.date,
      data.reason,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Date marked as unavailable", override));
  }

  static async removeDateOverride(req: Request, res: Response) {
    await CampusVisitsService.removeDateOverride(
      req.collegeId!,
      req.params.overrideId as string,
    );
    return res.json(ApiResponse.success("Date override removed", null));
  }

  static async cancelVisit(req: Request, res: Response) {
    const data = cancelByAdminSchema.parse(req.body);
    const visit = await CampusVisitsService.cancelByAdmin(
      req.collegeId!,
      req.params.visitId as string,
      data.message,
    );
    return res.json(ApiResponse.success("Campus visit cancelled", visit));
  }

  static async cancelForDate(req: Request, res: Response) {
    const data = bulkCancelForDateSchema.parse(req.body);
    const count = await CampusVisitsService.cancelAllForDate(
      req.collegeId!,
      data.date,
      data.message,
    );
    return res.json(
      ApiResponse.success("Campus visits cancelled", { cancelledCount: count }),
    );
  }
}
