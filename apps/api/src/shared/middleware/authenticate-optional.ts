import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/shared/config/env";
import { JwtPayload } from "@/modules/auth/auth.types";

// Populates req.userId/userType when a valid Bearer token is present, but
// never rejects the request — used on public routes that personalize the
// response (e.g. isWishlisted) for logged-in students without requiring login.
export function authenticateOptional(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    req.userType = payload.userType;
    req.collegeId = payload.collegeId;
    req.roleId = payload.roleId;
    req.permissions = payload.permissions;
    req.counsellorType = payload.counsellorType;
  } catch {
    // Invalid/expired token on a public route — proceed anonymously.
  }

  next();
}
