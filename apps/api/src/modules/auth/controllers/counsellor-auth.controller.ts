import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AuthService } from "../services/auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 90 * 24 * 60 * 60 * 1000,
};

export class CounsellorAuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerCounsellor(req.body);
      res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);
      return res.status(201).json(
        ApiResponse.success("Counsellor registered successfully", {
          user: result.user,
          accessToken: result.tokens.accessToken,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.loginCounsellor(req.body);
      res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);
      return res.status(200).json(
        ApiResponse.success("Login successful", {
          user: result.user,
          accessToken: result.tokens.accessToken,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await AuthService.refreshTokens(refreshToken);
      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      return res.status(200).json(
        ApiResponse.success("Token refreshed successfully", {
          accessToken: result.accessToken,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) await AuthService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res
        .status(200)
        .json(ApiResponse.success("Logged out successfully", null));
    } catch (error) {
      next(error);
    }
  }
}
