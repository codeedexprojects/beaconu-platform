import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '@/shared/errors'
import { UserType } from '@beaconu/types'
import type { UserType as AuthUserType } from '@/modules/auth/auth.types'

export function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userId) {
      next(new UnauthorizedError())
      return
    }

    // Platform admins bypass all permission checks
    if (req.userType === UserType.PlatformAdmin) {
      next()
      return
    }

    if (requiredPermissions.length === 0) {
      next()
      return
    }

    const userPermissions = req.permissions ?? []
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p))

    if (!hasAll) {
      next(new ForbiddenError('Insufficient permissions'))
      return
    }

    next()
  }
}

export function authorizeUserType(...allowedUserTypes: AuthUserType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userType || !allowedUserTypes.includes(req.userType)) {
      next(new ForbiddenError('You do not have permission to access this resource'))
      return
    }
    next()
  }
}
