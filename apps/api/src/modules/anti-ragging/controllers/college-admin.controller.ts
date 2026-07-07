import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AntiRaggingQuery } from "../queries/anti-ragging.query";
import { AntiRaggingService } from "../services/anti-ragging.service";
import {
  complaintListQuerySchema,
  resolveComplaintSchema,
} from "../validators/anti-ragging.validator";

export class CollegeAdminAntiRaggingController {
  static async list(req: Request, res: Response) {
    const filters = complaintListQuerySchema.parse(req.query);
    const result = await AntiRaggingQuery.listForCollege(
      req.collegeId!,
      filters,
    );
    return res.json(
      ApiResponse.success("Reports fetched", {
        complaints: result.complaints,
        meta: result.meta,
      }),
    );
  }

  static async get(req: Request, res: Response) {
    const result = await AntiRaggingQuery.getForCollege(
      req.params.complaintId as string,
      req.collegeId!,
    );
    if (!result) throw new NotFoundError("Complaint not found");
    return res.json(ApiResponse.success("Report fetched", result));
  }

  static async acknowledge(req: Request, res: Response) {
    const result = await AntiRaggingService.acknowledge(
      req.params.complaintId as string,
      req.collegeId!,
      req.userId!,
    );
    return res.json(ApiResponse.success("Report acknowledged", result));
  }

  static async startInvestigation(req: Request, res: Response) {
    const result = await AntiRaggingService.startInvestigation(
      req.params.complaintId as string,
      req.collegeId!,
      req.userId!,
    );
    return res.json(ApiResponse.success("Investigation started", result));
  }

  static async resolve(req: Request, res: Response) {
    const data = resolveComplaintSchema.parse(req.body);
    const result = await AntiRaggingService.resolve(
      req.params.complaintId as string,
      req.collegeId!,
      req.userId!,
      data,
    );
    return res.json(ApiResponse.success("Report resolved", result));
  }
}
