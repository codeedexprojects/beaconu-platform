import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors';
import { JwtUtils } from './auth.jwt';
import { UserType } from './auth.types';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = JwtUtils.verifyAccessToken(token);
    req.userId = payload.userId;
    req.userType = payload.userType;
    req.collegeId = payload.collegeId;
    req.roleId = payload.roleId;
    req.permissions = payload.permissions;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export function authorize(...allowedUserTypes: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userType || !allowedUserTypes.includes(req.userType)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }
    next();
  };
}

export function authorizePermissions(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.permissions) {
      return next(new ForbiddenError('No permissions found for user'));
    }

    if (req.permissions.includes('*')) {
      next();
      return;
    }

    const hasPermission = requiredPermissions.every((perm) => 
      req.permissions?.includes(perm)
    );

    if (!hasPermission) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}
