import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AuthService } from "../services/auth.service";
import { CollegeProvisioningRepository } from "@/modules/colleges/repositories/college-provisioning.repository";
import { CryptoUtils } from "@/shared/utils";
import { AuthRepository } from "../repositories/auth.repository";
import { JwtUtils } from "../auth.jwt";
import {
  USER_TYPES,
  SESSION_EXPIRY_DAYS,
  ACCOUNT_STATUS,
} from "@/shared/constants";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} from "@/shared/errors";
import { z } from "zod";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 90 * 24 * 60 * 60 * 1000,
};

const setupAccountSchema = z.object({
  token: z.string().uuid(),
  fullName: z.string().trim().min(2).max(255).optional(),
  password: z.string().min(8).max(100),
});

export class StaffAuthController {
  // ── Login ─────────────────────────────────────────────────────────────────
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const staff = await CollegeProvisioningRepository.findStaffByEmail(email);
      if (!staff || !staff.passwordHash) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const isMatch = await CryptoUtils.compare(password, staff.passwordHash);
      if (!isMatch) throw new UnauthorizedError("Invalid credentials");

      if (staff.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new ForbiddenError(`Account is ${staff.status}`);
      }

      const permissions = staff.collegeRole.permissions.map(
        (p) => p.permissionCode,
      );

      const session = await AuthRepository.createSession({
        userId: staff.id,
        userType: USER_TYPES.STAFF,
      });

      await CollegeProvisioningRepository.updateLastLogin(staff.id);

      const accessToken = JwtUtils.generateAccessToken({
        userId: staff.id,
        userType: USER_TYPES.STAFF,
        roleId: staff.collegeRoleId,
        collegeId: staff.collegeId,
        permissions,
        sessionId: session.sessionId,
      });

      res.cookie("refreshToken", session.refreshToken, COOKIE_OPTIONS);
      return res.status(200).json(
        ApiResponse.success("Login successful", {
          user: {
            id: staff.id,
            email: staff.email,
            fullName: staff.fullName,
            collegeId: staff.collegeId,
            collegeSlug: staff.college.slug,
            collegeName: staff.college.name,
            collegeStatus: staff.college.status,
            roleSlug: staff.collegeRole.slug,
          },
          tokens: { accessToken, refreshToken: session.refreshToken },
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // ── Verify Setup Token ────────────────────────────────────────────────────
  static async verifySetupToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token } = req.params;
      const { CollegeProvisioningService } =
        await import("@/modules/colleges/services/college-provisioning.service");
      const result = await CollegeProvisioningService.verifySetupToken(token);

      if (!result) {
        return res
          .status(400)
          .json(
            ApiResponse.success("Setup token is invalid or has expired", null),
          );
      }

      return res.status(200).json(
        ApiResponse.success("Token is valid", {
          valid: true,
          collegeName: result.collegeName,
          collegeSlug: result.collegeSlug,
          email: result.email,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // ── Setup Account (set password for the first time) ───────────────────────
  static async setupAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, fullName, password } = setupAccountSchema.parse(req.body);

      const result =
        await CollegeProvisioningRepository.findBySetupToken(token);
      if (!result)
        throw new BadRequestError("Setup token is invalid or has expired");

      const staffId = result.staff?.id;
      const collegeId = result.college.id;

      if (!staffId)
        throw new BadRequestError("Staff account not found for this token");

      const passwordHash = await CryptoUtils.hash(password);
      const staff = await CollegeProvisioningRepository.completeSetup(
        collegeId,
        staffId,
        passwordHash,
        fullName || result.staff.fullName,
      );

      const permissions = staff.collegeRole.permissions.map(
        (p) => p.permissionCode,
      );

      const session = await AuthRepository.createSession({
        userId: staff.id,
        userType: USER_TYPES.STAFF,
      });

      const accessToken = JwtUtils.generateAccessToken({
        userId: staff.id,
        userType: USER_TYPES.STAFF,
        roleId: staff.collegeRoleId,
        collegeId: staff.collegeId,
        permissions,
        sessionId: session.sessionId,
      });

      res.cookie("refreshToken", session.refreshToken, COOKIE_OPTIONS);
      return res.status(200).json(
        ApiResponse.success("Account set up successfully", {
          user: {
            id: staff.id,
            email: staff.email,
            fullName: staff.fullName,
            collegeId: staff.collegeId,
            collegeSlug: staff.college.slug,
            collegeName: staff.college.name,
            collegeStatus: staff.college.status,
            roleSlug: staff.collegeRole.slug,
          },
          tokens: { accessToken, refreshToken: session.refreshToken },
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────
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

  // ── Logout ────────────────────────────────────────────────────────────────
  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) await AuthService.logout(refreshToken);
    res.clearCookie("refreshToken");
    return res
      .status(200)
      .json(ApiResponse.success("Logged out successfully", null));
  }
}
