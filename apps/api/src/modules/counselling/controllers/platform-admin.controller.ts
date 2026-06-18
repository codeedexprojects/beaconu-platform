import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CounsellingService } from "../services/counselling.service";
import { SessionService } from "../services/sessions.service";
import { CounsellorRequestService } from "../services/counsellor-request.service";
import { counsellorRequestSchemas } from "../validators/counsellor-request.validator";
import type {
  ListWithdrawalRequestsQueryInput,
  UpdateWithdrawalStatusInput,
} from "../validators/sessions.validator";

export class CounsellingPlatformAdminController {
  static async listAll(req: Request, res: Response) {
    const counsellors = await CounsellingService.listAll({
      counsellor_type: req.query["counsellor_type"] as string | undefined,
      status: req.query["status"] as string | undefined,
      language: req.query["language"] as string | undefined,
    });
    return res
      .status(200)
      .json(ApiResponse.success("Counsellors retrieved", counsellors));
  }

  static async getById(req: Request, res: Response) {
    const counsellor = await CounsellingService.getById(
      req.params["id"] as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Counsellor retrieved", counsellor));
  }

  static async getDetail(req: Request, res: Response) {
    const detail = await SessionService.getCounsellorDetailForAdmin(
      req.params["id"] as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Counsellor detail retrieved", detail));
  }

  static async updateStatus(req: Request, res: Response) {
    const counsellor = await CounsellingService.updateStatus(
      req.params["id"] as string,
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Status updated", counsellor));
  }

  // GET /api/v1/admin/counsellor-requests
  static async listRequests(req: Request, res: Response) {
    const filters = counsellorRequestSchemas.list.parse(req.query);
    const result = await CounsellorRequestService.list(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Counsellor registration requests retrieved",
          result,
        ),
      );
  }

  // GET /api/v1/admin/counsellor-requests/:id
  static async getRequestById(req: Request, res: Response) {
    const result = await CounsellorRequestService.getById(
      req.params["id"] as string,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Counsellor registration request retrieved",
          result,
        ),
      );
  }

  // PATCH /api/v1/admin/counsellor-requests/:id/status
  static async updateRequestStatus(req: Request, res: Response) {
    const data = counsellorRequestSchemas.updateStatus.parse(req.body);
    const result = await CounsellorRequestService.updateStatus(
      req.params["id"] as string,
      data,
      req.userId as string,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Counsellor registration request status updated",
          result,
        ),
      );
  }

  // GET /api/v1/admin/counsellors/withdrawals
  static async listWithdrawalRequests(req: Request, res: Response) {
    const result = await SessionService.listWithdrawalRequests(
      req.query as unknown as ListWithdrawalRequestsQueryInput,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Withdrawal requests retrieved",
          result.requests,
          result.meta,
        ),
      );
  }

  // PATCH /api/v1/admin/counsellors/withdrawals/:id/status
  static async updateWithdrawalStatus(req: Request, res: Response) {
    const result = await SessionService.updateWithdrawalStatus(
      req.params["id"] as string,
      req.body as UpdateWithdrawalStatusInput,
      req.userId as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Withdrawal request status updated", result));
  }
}
