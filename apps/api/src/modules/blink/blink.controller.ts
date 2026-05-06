import { Request, Response, NextFunction } from 'express'
import { BlinkService } from './blink.service'
import { blinkRegisterSchema, blinkLoginSchema } from './blink.schema'
import { AuthService } from '../auth/auth.service'
import { refreshTokenSchema } from '../auth/auth.schema'

export class BlinkController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = blinkRegisterSchema.parse(req.body)
      const result = await BlinkService.register(input, req.ip || undefined)
      
      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      })

      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = blinkLoginSchema.parse(req.body)
      const result = await BlinkService.login(input, req.ip || undefined)

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      })

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token missing' })
      }

      const result = await AuthService.refreshTokens(refreshToken)

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      })

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken
      
      if (refreshToken) {
        await AuthService.logout(refreshToken)
      }

      res.clearCookie('refreshToken')
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await BlinkService.getMe(req.userId!)
      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }
}
