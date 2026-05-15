import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors";
import type { UserType as AuthUserType } from "@/modules/auth/auth.types";

export function authorize(...requiredPermissions: string[]) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.userId) {
      next(new UnauthorizedError());
      return;
    }

    if (requiredPermissions.length === 0) {
      next();
      return;
    }

    try {
      let userPermissions = req.permissions ?? [];

      // Platform admin permissions are always enforced from DB so updates
      // take effect immediately for active sessions.
      if (req.userType === "platform_admin") {
        if (!req.roleId) {
          next(new ForbiddenError("Role context is missing for this admin"));
          return;
        }

        const role = await prisma.platformRole.findUnique({
          where: { id: req.roleId },
          select: {
            isActive: true,
            permissions: {
              select: { permissionCode: true },
            },
          },
        });

        if (!role || !role.isActive) {
          next(new ForbiddenError("Role is inactive or no longer available"));
          return;
        }

        userPermissions = role.permissions.map(
          (permission) => permission.permissionCode,
        );
        req.permissions = userPermissions;
      }

      // super_admin has wildcard — bypasses all permission checks
      if (userPermissions.includes("*")) {
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
    } catch (error) {
      next(error);
    }
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
