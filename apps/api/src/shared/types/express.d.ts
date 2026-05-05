import { UserType } from '@beaconu/types'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
      userId?: string
      userType?: UserType
      collegeId?: string
      roleId?: string
      permissions?: string[]
    }
  }
}

export {}
