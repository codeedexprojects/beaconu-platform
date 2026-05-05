import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '@/shared/config/env'
import { UnauthorizedError } from '@/shared/errors'
import { JwtPayload, UserType } from '@beaconu/types'

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'))
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.userId = payload.userId
    req.userType = payload.userType as UserType
    req.collegeId = payload.collegeId
    req.roleId = payload.roleId
    req.permissions = payload.permissions
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token'))
  }
}
