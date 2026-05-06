import bcrypt from 'bcryptjs'
import { BlinkRepository } from './blink.repository'
import { BlinkRegisterInput, BlinkLoginInput } from './blink.schema'
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/shared/errors'
import { SessionManager } from '../auth/auth.session'
import { JwtUtils } from '../auth/auth.jwt'
import { UserType } from '@beaconu/types'
import { LoginResponse, AuthUser } from '../auth/auth.types'

export class BlinkService {
  static async register(input: BlinkRegisterInput, ipAddress?: string): Promise<LoginResponse> {
    // Check if email unique
    const existingEmail = await BlinkRepository.findByEmail(input.agency_email)
    if (existingEmail) {
      throw new BadRequestError('Email already registered')
    }

    // Check if agency_reg_number unique
    const existingReg = await BlinkRepository.findByAgencyRegNumber(input.agency_reg_number)
    if (existingReg) {
      throw new BadRequestError('Agency registration number already registered')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 10)

    // Assign blink role: associate_admin
    const role = await BlinkRepository.findRoleBySlug('associate_admin')
    if (!role) {
      throw new BadRequestError('Default role not found')
    }

    // Create blink_user
    const user = await BlinkRepository.create({
      fullName: input.agency_name, // User asked for agency_name to be used as fullName or just for registration? I'll use it as fullName if that's the only name field.
      email: input.agency_email,
      passwordHash,
      phoneNumber: input.agency_phone_no,
      country: input.country,
      agencyName: input.agency_name,
      agencyRegNumber: input.agency_reg_number,
      blinkRoleId: role.id,
      status: 'active', // Default status
    })

    // Create session
    const { refreshToken } = await SessionManager.createSession({
      userId: user.id,
      userType: UserType.BlinkUser,
      ipAddress,
    })

    // Generate access token
    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType: UserType.BlinkUser,
      roleId: role.id,
    })

    return {
      user: this.mapToAuthUser(user),
      accessToken,
      refreshToken,
    }
  }

  static async login(input: BlinkLoginInput, ipAddress?: string): Promise<LoginResponse> {
    let user = null
    if (input.agency_email) {
      user = await BlinkRepository.findByEmail(input.agency_email)
    } else if (input.agency_reg_number) {
      user = await BlinkRepository.findByAgencyRegNumber(input.agency_reg_number)
    }

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Validate credentials
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Reject if inactive/suspended/etc
    if (user.status !== 'active') {
      throw new ForbiddenError(`Account is ${user.status}`)
    }

    // Update last_login_at
    await BlinkRepository.updateLastLogin(user.id)

    // Create session
    const { refreshToken } = await SessionManager.createSession({
      userId: user.id,
      userType: UserType.BlinkUser,
      ipAddress,
    })

    // Generate access token
    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType: UserType.BlinkUser,
      roleId: user.blinkRoleId,
    })

    return {
      user: this.mapToAuthUser(user),
      accessToken,
      refreshToken,
    }
  }

  static async getMe(userId: string): Promise<AuthUser> {
    const user = await BlinkRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return this.mapToAuthUser(user)
  }

  private static mapToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: UserType.BlinkUser,
      roleId: user.blinkRoleId,
      // collegeId: user.collegeId, // optional
    }
  }
}
