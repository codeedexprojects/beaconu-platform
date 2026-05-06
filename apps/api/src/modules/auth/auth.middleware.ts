import { Request, Response, NextFunction } from 'express'
import { UnauthorizedError } from '@/shared/errors'
import { JwtUtils } from './auth.jwt'

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
    const payload = JwtUtils.verifyAccessToken(token)
    req.userId = payload.userId
    req.userType = payload.userType
    req.collegeId = payload.collegeId
    req.roleId = payload.roleId
    req.permissions = payload.permissions
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'))
  }
}
