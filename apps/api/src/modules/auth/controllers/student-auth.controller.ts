import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AuthService } from "../services/auth.service";
import {
  sendStudentOtpSchema,
  verifyStudentOtpSchema,
  registerStudentSchema,
  firebaseStudentLoginSchema,
} from "../validators/auth.validator";

import { REFRESH_TOKEN_COOKIE_OPTIONS } from "@/shared/constants";

export class StudentAuthController {
  static async sendOtp(req: Request, res: Response) {
    const { phone_number, phone_country_code } = sendStudentOtpSchema.parse(
      req.body,
    );
    const result = await AuthService.sendStudentOtp(
      phone_number,
      phone_country_code,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "OTP sent successfully",
          result.devOtp ? { devOtp: result.devOtp } : null,
        ),
      );
  }

  static async resendOtp(req: Request, res: Response) {
    const { phone_number, phone_country_code } = sendStudentOtpSchema.parse(
      req.body,
    );
    const result = await AuthService.sendStudentOtp(
      phone_number,
      phone_country_code,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "OTP resent successfully",
          result.devOtp ? { devOtp: result.devOtp } : null,
        ),
      );
  }

  static async verifyOtp(req: Request, res: Response) {
    const { phone_number, phone_country_code, otp, fcm_token } =
      verifyStudentOtpSchema.parse(req.body);
    const result = await AuthService.verifyStudentOtp(
      phone_number,
      phone_country_code,
      otp,
      fcm_token,
    );

    if (!result.isNewUser) {
      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );
      return res.status(200).json(
        ApiResponse.success("Login successful", {
          isNewUser: false,
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        }),
      );
    }

    return res.status(200).json(
      ApiResponse.success("OTP verified", {
        isNewUser: true,
        registrationToken: result.registrationToken,
      }),
    );
  }

  static async register(req: Request, res: Response) {
    const data = registerStudentSchema.parse(req.body);
    const result = await AuthService.registerStudent(data);
    res.cookie(
      "refreshToken",
      result.tokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(201).json(
      ApiResponse.success("Account created successfully", {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
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
        refreshToken: result.refreshToken,
      }),
    );
  }

  static async firebaseLogin(req: Request, res: Response) {
    const { id_token, fcm_token } = firebaseStudentLoginSchema.parse(req.body);
    const result = await AuthService.loginWithFirebaseGoogle(
      id_token,
      fcm_token,
    );
    res.cookie(
      "refreshToken",
      result.tokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(200).json(
      ApiResponse.success("Login successful", {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
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
