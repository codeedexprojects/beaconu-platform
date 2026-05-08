export type UserType = 'student' | 'platform_admin' | 'staff_member' | 'blink_associate' | 'blink_employee' | 'blink_ambassador' | 'counsellor';

export interface JwtPayload {
  userId: string;
  userType: UserType;
  roleId?: string;
  collegeId?: string;
  permissions?: string[];
  sessionId: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
  roleId?: string;
  collegeId?: string;
  permissions?: string[];
}

export interface LoginResponse extends TokenResponse {
  user: AuthUser;
}

export interface SessionData {
  userId: string;
  userType: UserType;
  deviceInfo?: Record<string, unknown>;

  ipAddress?: string;
}
