import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CallRequestService } from "../services/call-request.service";
import {
  createCallRequestSchema,
  listCallRequestsQuerySchema,
} from "../validators/call-request.validator";

export class StudentCallRequestController {
  static async create(req: Request, res: Response) {
    const body = createCallRequestSchema.parse(req.body);
    const result = await CallRequestService.create(req.userId as string, body);
    return res
      .status(201)
      .json(ApiResponse.success("Call request submitted", result));
  }

  static async list(req: Request, res: Response) {
    const query = listCallRequestsQuerySchema.parse(req.query);
    const result = await CallRequestService.listMine(
      req.userId as string,
      { status: query.status },
      { page: query.page, limit: query.limit },
    );
    return res
      .status(200)
      .json(ApiResponse.success("Call requests fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await CallRequestService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Call request fetched", result));
  }

  static async cancel(req: Request, res: Response) {
    const result = await CallRequestService.cancelMine(
      req.userId as string,
      req.params.id as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Call request cancelled", result));
  }
}
