import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { WalletService } from "../services/wallet.service";
import { RedemptionQuery } from "../queries/redemption.query";
import type {
  ListRedemptionsQuery,
  ReviewRedemptionInput,
} from "../validators/wallet.validator";

/** Super Admin panel: the BeaconU Card redemption queue. Payouts are made by
 * hand outside the platform; these endpoints are the queue and its audit
 * trail, not a payment integration. */
export class EngagementPlatformAdminController {
  static async listRedemptions(req: Request, res: Response): Promise<void> {
    const filters = req.query as unknown as ListRedemptionsQuery;
    const { requests, meta } = await RedemptionQuery.listForAdmin(filters);
    res
      .status(200)
      .json(ApiResponse.success("Redemption requests fetched", requests, meta));
  }

  static async getPayoutDetails(req: Request, res: Response): Promise<void> {
    const details = await RedemptionQuery.getPayoutDetails(
      req.params.id as string,
    );
    res
      .status(200)
      .json(ApiResponse.success("Payout details fetched", details));
  }

  static async reviewRedemption(req: Request, res: Response): Promise<void> {
    const data = req.body as ReviewRedemptionInput;
    const result = await WalletService.reviewRedemption(
      req.params.id as string,
      data,
      req.userId!,
    );
    res
      .status(200)
      .json(ApiResponse.success("Redemption request reviewed", result));
  }
}
