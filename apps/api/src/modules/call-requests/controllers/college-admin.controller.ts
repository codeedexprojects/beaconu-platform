import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CallRequestService } from "../services/call-request.service";
import {
  listCallRequestsQuerySchema,
  updateCallRequestStatusSchema,
} from "../validators/call-request.validator";

export class CollegeAdminCallRequestController {
  static async list(req: Request, res: Response) {
    const query = listCallRequestsQuerySchema.parse(req.query);
    const result = await CallRequestService.listForCollege(
      req.collegeId!,
      { status: query.status, search: query.search },
      { page: query.page, limit: query.limit },
    );
    return res
      .status(200)
      .json(ApiResponse.success("Call requests fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await CallRequestService.getForCollege(
      req.collegeId!,
      req.params.id as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Call request fetched", result));
  }

  static async updateStatus(req: Request, res: Response) {
    const body = updateCallRequestStatusSchema.parse(req.body);
    const result = await CallRequestService.updateStatus(
      req.collegeId!,
      req.userId as string,
      req.params.id as string,
      body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Call request updated", result));
  }
}
