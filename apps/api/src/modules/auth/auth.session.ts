import { prisma } from '@beaconu/db'
import { SessionData } from './auth.types'
import { JwtUtils } from './auth.jwt'
import { UserType } from '@beaconu/types'

export class SessionManager {
  static async createSession(data: SessionData) {
    const { userId, userType, deviceInfo, ipAddress } = data
    
    // Generate refresh token
    const refreshToken = JwtUtils.generateRefreshToken({
      userId,
      userType,
    })

    // Calculate expiry (90 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    // Store session in DB
    const session = await prisma.userSession.create({
      data: {
        userId,
        userType,
        refreshToken,
        deviceInfo: deviceInfo || {},
        ipAddress,
        expiresAt,
      },
    })

    return {
      refreshToken,
      sessionId: session.id,
    }
  }

  static async invalidateSession(refreshToken: string) {
    await prisma.userSession.updateMany({
      where: { refreshToken, isActive: true },
      data: { isActive: false },
    })
  }

  static async rotateSession(oldRefreshToken: string, data: SessionData) {
    // Invalidate old session
    await this.invalidateSession(oldRefreshToken)

    // Create new session
    return this.createSession(data)
  }

  static async validateSession(refreshToken: string) {
    const session = await prisma.userSession.findFirst({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    })

    return session
  }
}
