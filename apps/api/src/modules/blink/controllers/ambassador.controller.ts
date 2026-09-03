import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { BlinkService } from "../services/blink.service";
import { BlinkQuery } from "../queries/blink.query";
import {
  ambassadorProfileUpdateSchema,
  type CollegeListQuery,
  type CreateReferralCodeInput,
  type WalletTransactionQuery,
} from "../validators/blink.validator";

export class AmbassadorController {
  static async register(req: Request, res: Response) {
    const result = await BlinkService.registerAmbassador(
      req.body,
      req.userId!,
      req.collegeId!,
    );
    return res
      .status(201)
      .json(
        ApiResponse.success("Campus ambassador created successfully", result),
      );
  }

  static async getProfile(req: Request, res: Response) {
    const result = await BlinkService.getAmbassadorProfile(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Profile fetched successfully", result));
  }

  static async updateProfile(req: Request, res: Response) {
    const data = ambassadorProfileUpdateSchema.parse(req.body);
    const result = await BlinkService.updateAmbassadorProfile(
      req.userId!,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Profile updated successfully", result));
  }

  static async listColleges(req: Request, res: Response) {
    const filters = req.query as unknown as CollegeListQuery;
    const result = await BlinkQuery.listCollegesForEmployee(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Colleges fetched successfully",
          result.colleges,
          result.meta,
        ),
      );
  }

  static async listCoursesByCollege(req: Request, res: Response) {
    const collegeId = req.params["collegeId"] as string;
    const result = await BlinkQuery.listCoursesForEmployee(collegeId);
    if (!result) throw new NotFoundError("College not found");
    return res
      .status(200)
      .json(ApiResponse.success("Courses fetched successfully", result));
  }

  static async getCourseDetail(req: Request, res: Response) {
    const { collegeId, courseId } = req.params as {
      collegeId: string;
      courseId: string;
    };
    const result = await BlinkQuery.getCourseDetailForAmbassador(
      collegeId,
      courseId,
    );
    if (!result) throw new NotFoundError("Course not found");
    return res
      .status(200)
      .json(ApiResponse.success("Course fetched successfully", result));
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
}
