import jwt from 'jsonwebtoken'
import { env } from '@/shared/config/env'
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '@/shared/constants'
import { JwtPayload } from './auth.types'

export class JwtUtils {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    })
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    })
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload
  }

  static decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null
  }
}
