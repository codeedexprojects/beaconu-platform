import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CounsellingService } from "../services/counselling.service";
import { SessionService } from "../services/sessions.service";
import { RefundService } from "../services/refund.service";
import { CounsellorRequestService } from "../services/counsellor-request.service";
import { counsellorRequestSchemas } from "../validators/counsellor-request.validator";
import type {
  ListCounsellorSlotsQueryInput,
  ListSessionsQueryInput,
  ListWalletTransactionsQueryInput,
  ListWithdrawalRequestsQueryInput,
  UpdateWithdrawalStatusInput,
} from "../validators/sessions.validator";
import type {
  ListRefundRequestsQueryInput,
  UpdateRefundStatusInput,
} from "../validators/refund.validator";

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

  static async getWalletTransactions(req: Request, res: Response) {
    const wallet = await SessionService.getWallet(
      req.params["id"] as string,
      req.query as unknown as ListWalletTransactionsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Wallet transactions retrieved", wallet));
  }

  static async getSlots(req: Request, res: Response) {
    const { data, meta } = await SessionService.listCounsellorSlotsForAdmin(
      req.params["id"] as string,
      req.query as unknown as ListCounsellorSlotsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Slots retrieved", data, meta));
  }

  static async getSessions(req: Request, res: Response) {
    const { data, meta } = await SessionService.listCounsellorSessions(
      req.params["id"] as string,
      req.query as unknown as ListSessionsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Sessions retrieved", data, meta));
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

  static async listRefundRequests(req: Request, res: Response) {
    const result = await RefundService.listAllForAdmin(
      req.query as unknown as ListRefundRequestsQueryInput,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Refund requests retrieved",
          result.data,
          result.meta,
        ),
      );
  }

  static async updateRefundStatus(req: Request, res: Response) {
    const result = await RefundService.updateStatus(
      req.params["id"] as string,
      req.body as UpdateRefundStatusInput,
      req.userId as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Refund request status updated", result));
  }
}
