import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AntiRaggingQuery } from "../queries/anti-ragging.query";
import { AntiRaggingService } from "../services/anti-ragging.service";
import {
  createComplaintSchema,
  complaintListQuerySchema,
} from "../validators/anti-ragging.validator";

export class StudentAntiRaggingController {
  static async create(req: Request, res: Response) {
    const data = createComplaintSchema.parse(req.body);
    const result = await AntiRaggingService.create(
      req.userId!,
      data.college_id,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Report submitted", result));
  }

  static async list(req: Request, res: Response) {
    const filters = complaintListQuerySchema.parse(req.query);
    const result = await AntiRaggingQuery.listForStudent(req.userId!, filters);
    return res.json(
      ApiResponse.success("Reports fetched", {
        complaints: result.complaints,
        meta: result.meta,
      }),
    );
  }

  static async get(req: Request, res: Response) {
    const result = await AntiRaggingQuery.getForStudent(
      req.params.complaintId as string,
      req.userId!,
    );
    if (!result) throw new NotFoundError("Complaint not found");
    return res.json(ApiResponse.success("Report fetched", result));
  }
}
