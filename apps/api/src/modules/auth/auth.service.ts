import { UnauthorizedError } from '@/shared/errors'
import { JwtUtils } from './auth.jwt'
import { SessionManager } from './auth.session'
import { TokenResponse } from './auth.types'

export class AuthService {
  static async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const session = await SessionManager.validateSession(refreshToken)
    
    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    // Verify token matches payload
    try {
      const payload = JwtUtils.verifyRefreshToken(refreshToken)
      
      // Rotate session
      const newSession = await SessionManager.rotateSession(refreshToken, {
        userId: session.userId,
        userType: session.userType as any,
        ipAddress: session.ipAddress || undefined,
        deviceInfo: session.deviceInfo,
      })

      const accessToken = JwtUtils.generateAccessToken({
        userId: session.userId,
        userType: session.userType as any,
        // Optional: include role/college if needed, but for refresh we might need to fetch them
        // or just rely on what's in the session if we store it.
        // For now, minimal payload.
      })

      return {
        accessToken,
        refreshToken: newSession.refreshToken,
      }
    } catch (error) {
      // If verification fails, invalidate session anyway
      await SessionManager.invalidateSession(refreshToken)
      throw new UnauthorizedError('Invalid refresh token')
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await SessionManager.invalidateSession(refreshToken)
  }
}
