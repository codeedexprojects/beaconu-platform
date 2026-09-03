import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BlinkService } from "../services/blink.service";
import { BlinkQuery } from "../queries/blink.query";
import type {
  ReferralListQuery,
  WalletTransactionQuery,
  ServiceChargeQuery,
  EmployeeRankingQuery,
  EmployeeListQuery,
  DashboardSummaryQuery,
  CreateReferralCodeInput,
} from "../validators/blink.validator";

export class AssociateAdminController {
  static async getDashboardSummary(req: Request, res: Response) {
    const { from, to } = req.query as unknown as DashboardSummaryQuery;
    const result = await BlinkQuery.getDashboardSummary(req.userId!, {
      from,
      to,
    });
    return res
      .status(200)
      .json(
        ApiResponse.success("Dashboard summary fetched successfully", result),
      );
  }

  static async registerEmployee(req: Request, res: Response) {
    const result = await BlinkService.registerAssociateEmployee(req.body);
    return res
      .status(201)
      .json(ApiResponse.success(result.message, { user: result.user }));
  }

  static async getProfile(req: Request, res: Response) {
    const result = await BlinkService.getProfile(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Profile fetched successfully", result));
  }

  static async listEmployees(req: Request, res: Response) {
    const { status, search, page, limit } =
      req.query as unknown as EmployeeListQuery;
    const result = await BlinkQuery.listEmployeesPlain(req.userId!, {
      status,
      search,
      page,
      limit,
    });
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Employees fetched successfully",
          result.employees,
          result.meta,
        ),
      );
  }

  static async listEmployeeLeaderboard(req: Request, res: Response) {
    const { from, to, page, limit } =
      req.query as unknown as EmployeeRankingQuery;
    const result = await BlinkQuery.listEmployeesWithRankings(req.userId!, {
      from,
      to,
      page,
      limit,
    });
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Employee leaderboard fetched successfully",
          result.employees,
          result.meta,
        ),
      );
  }

  static async getEmployeePerformance(req: Request, res: Response) {
    const employeeId = req.params["employeeId"] as string;
    const result = await BlinkService.getEmployeePerformance(
      req.userId!,
      employeeId,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Employee performance fetched successfully",
          result,
        ),
      );
  }

  static async listPendingEmployees(req: Request, res: Response) {
    const result = await BlinkService.listPendingEmployees(req.userId!);
    return res
      .status(200)
      .json(
        ApiResponse.success("Pending employees fetched successfully", result),
      );
  }

  static async updateEmployeeStatus(req: Request, res: Response) {
    const employeeId = req.params["employeeId"] as string;
    const result = await BlinkService.updateAssociateEmployeeStatus(
      req.userId!,
      employeeId,
      req.body,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Employee status updated successfully", result),
      );
  }

  static async listReferrals(req: Request, res: Response) {
    const { status, search, page, limit } =
      req.query as unknown as ReferralListQuery;
    const result = await BlinkQuery.listReferralsByAdmin(req.userId!, {
      status,
      search,
      page,
      limit,
    });
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Referrals fetched successfully",
          result.referrals,
          result.meta,
        ),
      );
  }

  static async getStudentByReferral(req: Request, res: Response) {
    const referralId = req.params["referralId"] as string;
    const result = await BlinkService.getStudentByReferral(
      req.userId!,
      referralId,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Student profile fetched successfully", result),
      );
  }

  static async getWallet(req: Request, res: Response) {
    const result = await BlinkService.getWallet(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Wallet fetched successfully", result));
  }

  static async getWalletTransactions(req: Request, res: Response) {
    const { page, limit, type } =
      req.query as unknown as WalletTransactionQuery;
    const result = await BlinkService.getWalletTransactions(
      req.userId!,
      page,
      limit,
      type,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Transactions fetched successfully",
          result.transactions,
          result.meta,
        ),
      );
  }

  static async updateBankDetails(req: Request, res: Response) {
    const result = await BlinkService.updateBankDetails(req.userId!, req.body);
    return res
      .status(200)
      .json(ApiResponse.success("Bank details updated successfully", result));
  }

  static async requestWithdrawal(req: Request, res: Response) {
    const result = await BlinkService.requestWithdrawal(req.userId!, req.body);
    return res
      .status(201)
      .json(
        ApiResponse.success(
          "Withdrawal request submitted successfully",
          result,
        ),
      );
  }

  static async listServiceCharges(req: Request, res: Response) {
    const filters = req.query as unknown as ServiceChargeQuery;
    const result = await BlinkQuery.listServiceCharges(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success("Service charges fetched successfully", result),
      );
  }

  static async updateServiceCharge(req: Request, res: Response) {
    const id = req.params["id"] as string;
    const result = await BlinkService.updateServiceCharge(id, req.body);
    return res
      .status(200)
      .json(ApiResponse.success("Service charge updated successfully", result));
  }

  static async createReferralCode(req: Request, res: Response) {
    const data = req.body as CreateReferralCodeInput;
    const result = await BlinkService.generateReferralCode(req.userId!, data);
    return res
      .status(201)
      .json(ApiResponse.success("Referral code ready", result));
  }

  static async listReferralCodes(req: Request, res: Response) {
    const result = await BlinkService.listOwnReferralCodes(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Referral codes fetched successfully", result));
  }

  static async deactivateReferralCode(req: Request, res: Response) {
    const id = req.params["id"] as string;
    const result = await BlinkService.deactivateReferralCode(req.userId!, id);
    return res
      .status(200)
      .json(ApiResponse.success("Referral code deactivated", result));
  }

  static async approveEmployeeStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const status = req.body.status;
    const result = await BlinkService.updateBlinkUserStatus(id, status);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Employee status updated by Platform Admin",
          result,
        ),
      );
  }
}
