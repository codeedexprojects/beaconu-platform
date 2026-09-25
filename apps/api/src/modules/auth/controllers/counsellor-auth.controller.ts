import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { REFRESH_TOKEN_COOKIE_OPTIONS } from "@/shared/constants";
import { AuthService } from "../services/auth.service";
import { CounsellorPasswordResetService } from "../services/counsellor-password-reset.service";

export class CounsellorAuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.registerCounsellor(req.body);
    res.cookie(
      "refreshToken",
      result.tokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(201).json(
      ApiResponse.success("Counsellor registered successfully", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }),
    );
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.loginCounsellor(req.body);
    res.cookie(
      "refreshToken",
      result.tokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(200).json(
      ApiResponse.success("Login successful", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }),
    );
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as { email: string };
    await CounsellorPasswordResetService.requestReset(email);
    // Same response whether or not the account exists (no user enumeration).
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "If an account exists for this email, a reset code has been sent",
          null,
        ),
      );
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, otp, password } = req.body as {
      email: string;
      otp: string;
      password: string;
    };
    await CounsellorPasswordResetService.resetPassword(email, otp, password);
    return res
      .status(200)
      .json(ApiResponse.success("Password updated. Please sign in.", null));
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await AuthService.refreshTokens(refreshToken);
    res.cookie(
      "refreshToken",
      result.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(200).json(
      ApiResponse.success("Token refreshed successfully", {
        accessToken: result.accessToken,
      }),
    );
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) await AuthService.logout(refreshToken);
    res.clearCookie("refreshToken");
    return res
      .status(200)
      .json(ApiResponse.success("Logged out successfully", null));
  }
}
