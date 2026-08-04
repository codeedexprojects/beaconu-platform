import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors";
import type { UserType as AuthUserType } from "@/modules/auth/auth.types";

async function resolveStaffPermissions(req: Request): Promise<string[]> {
  if (!req.roleId || !req.collegeId) {
    throw new ForbiddenError("Role context is missing for this staff member");
  }

  const role = await prisma.collegeRole.findFirst({
    where: { id: req.roleId, collegeId: req.collegeId },
    select: {
      slug: true,
      isActive: true,
      permissions: {
        select: { permissionCode: true },
      },
    },
  });

  if (!role || !role.isActive) {
    throw new ForbiddenError("Role is inactive or no longer available");
  }

  if (role.slug === "college_admin") {
    return ["*"];
  }

  return role.permissions.map((permission) => permission.permissionCode);
}

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

      if (req.userType === "staff_member") {
        userPermissions = await resolveStaffPermissions(req);
        req.permissions = userPermissions;
      }

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

export function authorizeAny(...allowedPermissions: string[]) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.userId) {
      next(new UnauthorizedError());
      return;
    }

    if (allowedPermissions.length === 0) {
      next();
      return;
    }

    try {
      let userPermissions = req.permissions ?? [];

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

      if (req.userType === "staff_member") {
        userPermissions = await resolveStaffPermissions(req);
        req.permissions = userPermissions;
      }

      if (userPermissions.includes("*")) {
        next();
        return;
      }

      const hasAny = allowedPermissions.some((p) =>
        userPermissions.includes(p),
      );

      if (!hasAny) {
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
    if (!req.userId) {
      next(new UnauthorizedError());
      return;
    }
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

export function authorizeCounsellorType(
  ...allowedCounsellorTypes: Array<"academic" | "mindcare">
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userId) {
      next(new UnauthorizedError());
      return;
    }
    if (
      !req.counsellorType ||
      !allowedCounsellorTypes.includes(req.counsellorType)
    ) {
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

export function denyRoleSlugs(...blockedRoleSlugs: string[]) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.roleId || !req.collegeId) {
      next(new ForbiddenError("Role context is missing"));
      return;
    }

    try {
      const role = await prisma.collegeRole.findFirst({
        where: { id: req.roleId, collegeId: req.collegeId },
        select: { slug: true },
      });

      if (!role) {
        next(new ForbiddenError("Role is invalid for this college"));
        return;
      }

      if (blockedRoleSlugs.includes(role.slug)) {
        next(new ForbiddenError("This role has read-only access"));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
