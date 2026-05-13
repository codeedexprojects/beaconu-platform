import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AuthService } from "../services/auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 90 * 24 * 60 * 60 * 1000,
};

export class BlinkAuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.registerAssociateAdmin(req.body);
    res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);
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
    res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);
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
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
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
