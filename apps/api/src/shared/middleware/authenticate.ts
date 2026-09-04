import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/shared/config/env";
import { UnauthorizedError } from "@/shared/errors";
import { JwtPayload } from "@/modules/auth/auth.types";
import { isSessionRevoked } from "@/shared/lib/session-revocation";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or invalid authorization header"));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (payload.sessionId && (await isSessionRevoked(payload.sessionId))) {
      next(new UnauthorizedError("Session has been signed out"));
      return;
    }

    req.userId = payload.userId;
    req.userType = payload.userType;
    req.sessionId = payload.sessionId;

    req.collegeId = payload.collegeId;
    req.roleId = payload.roleId;
    req.permissions = payload.permissions;
    req.counsellorType = payload.counsellorType;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
