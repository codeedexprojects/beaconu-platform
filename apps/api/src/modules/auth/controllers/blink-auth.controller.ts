import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { REFRESH_TOKEN_COOKIE_OPTIONS } from "@/shared/constants";
import { AuthService } from "../services/auth.service";

export class BlinkAuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.registerAssociateAdmin(req.body);
    res.cookie(
      "refreshToken",
      result.tokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(201).json(
      ApiResponse.success("Associate admin registered successfully", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }),
    );
  }

  static async registerEmployee(req: Request, res: Response) {
    const result = await AuthService.registerEmployee(req.body);
    return res
      .status(201)
      .json(ApiResponse.success(result.message, { user: result.user }));
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.loginBlink(req.body);
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

  static async forgotPassword(req: Request, res: Response) {
    const result = await AuthService.blinkForgotPassword(req.body.email);
    return res
      .status(200)
      .json(ApiResponse.success("OTP sent to registered phone number", result));
  }

  static async verifyResetOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    const result = await AuthService.blinkVerifyResetOtp(email, otp);
    return res.status(200).json(ApiResponse.success("OTP verified", result));
  }

  static async resetPassword(req: Request, res: Response) {
    const { reset_token, new_password } = req.body;
    await AuthService.blinkResetPassword(reset_token, new_password);
    return res
      .status(200)
      .json(ApiResponse.success("Password reset successfully", null));
  }
}
