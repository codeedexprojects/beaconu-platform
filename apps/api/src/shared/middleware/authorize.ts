import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors";
import type { UserType as AuthUserType } from "@/modules/auth/auth.types";

export function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userId) {
      next(new UnauthorizedError());
      return;
    }

    if (requiredPermissions.length === 0) {
      next();
      return;
    }

    const userPermissions = req.permissions ?? [];

    // super_admin has wildcard — bypasses all permission checks
    if (userPermissions.includes('*')) {
      next();
      return;
    }

    const hasAll = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasAll) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
}

export function authorizeUserType(...allowedUserTypes: AuthUserType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userType || !allowedUserTypes.includes(req.userType)) {
      next(
        new ForbiddenError(
          "You do not have permission to access this resource",
        ),
      );
      return;
    }
    next();
  };
}
