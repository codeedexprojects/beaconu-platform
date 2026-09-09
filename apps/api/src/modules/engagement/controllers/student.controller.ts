import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BeaconuCardService } from "../services/beaconu-card.service";
import { StudentReferralService } from "../services/student-referral.service";
import { StudentReferralQuery } from "../queries/student-referral.query";
import type { WalletTransactionQuery } from "../validators/student-referral.validator";
import { WalletService } from "../services/wallet.service";
import type {
  CreateBankAccountInput,
  RequestRedemptionInput,
} from "../validators/wallet.validator";

export class EngagementStudentController {
  static async getMyCard(req: Request, res: Response): Promise<void> {
    const card = await BeaconuCardService.getMine(req.userId!);
    res.status(200).json(ApiResponse.success("BeaconU card fetched", card));
  }

  static async getMyReferralCode(req: Request, res: Response): Promise<void> {
    const result = await StudentReferralService.getOrCreateCode(req.userId!);
    res.status(200).json(ApiResponse.success("Referral code fetched", result));
  }

  static async listMyReferrals(req: Request, res: Response): Promise<void> {
    const referrals = await StudentReferralService.listMyReferrals(req.userId!);
    res.status(200).json(ApiResponse.success("Referrals fetched", referrals));
  }

  static async getReferralSummary(req: Request, res: Response): Promise<void> {
    const summary = await StudentReferralQuery.getEarningsSummary(req.userId!);
    res
      .status(200)
      .json(ApiResponse.success("Referral summary fetched", summary));
  }

  static async listWalletTransactions(
    req: Request,
    res: Response,
  ): Promise<void> {
    const filters = req.query as unknown as WalletTransactionQuery;
    const { transactions, meta } =
      await StudentReferralQuery.listWalletTransactions(req.userId!, filters);
    res
      .status(200)
      .json(
        ApiResponse.success("Wallet transactions fetched", transactions, meta),
      );
  }

  static async listBankAccounts(req: Request, res: Response): Promise<void> {
    const accounts = await WalletService.listBankAccounts(req.userId!);
    res
      .status(200)
      .json(ApiResponse.success("Bank accounts fetched", accounts));
  }

  static async addBankAccount(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateBankAccountInput;
    const account = await WalletService.addBankAccount(req.userId!, data);
    res.status(201).json(ApiResponse.success("Bank account added", account));
  }

  static async setPrimaryBankAccount(
    req: Request,
    res: Response,
  ): Promise<void> {
    const account = await WalletService.setPrimaryBankAccount(
      req.userId!,
      req.params.id as string,
    );
    res
      .status(200)
      .json(ApiResponse.success("Primary bank account updated", account));
  }

  static async requestRedemption(req: Request, res: Response): Promise<void> {
    const data = req.body as RequestRedemptionInput;
    const result = await WalletService.requestRedemption(req.userId!, data);
    res
      .status(201)
      .json(ApiResponse.success("Redemption request submitted", result));
  }
}
