import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";
import type {
  ListWithdrawalRequestsQueryInput,
  UpdateWithdrawalStatusInput,
} from "../validators/blink.validator";

export class BlinkPlatformAdminController {
  static async listWithdrawalRequests(req: Request, res: Response) {
    const result = await BlinkService.listWithdrawalRequests(
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
    const result = await BlinkService.updateWithdrawalStatus(
      req.params["id"] as string,
      req.body as UpdateWithdrawalStatusInput,
      req.userId as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Withdrawal request status updated", result));
  }
}
