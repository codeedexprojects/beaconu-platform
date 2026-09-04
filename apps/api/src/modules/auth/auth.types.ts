import type { Prisma } from "@beaconu/db";

export type UserType =
  | "student"
  | "platform_admin"
  | "staff_member"
  | "blink_associate"
  | "blink_employee"
  | "blink_ambassador"
  | "counsellor"
  | "blog_author";

export interface JwtPayload {
  userId: string;
  userType: UserType;
  roleId?: string;
  collegeId?: string;
  permissions?: string[];
  sessionId: string;
  counsellorType?: "academic" | "mindcare";
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
  deviceInfo?: Prisma.InputJsonValue;

  ipAddress?: string;
}

/** What a controller extracts from `req` at login time (IP + raw user-agent
 * string) and passes into the auth service — kept separate from the
 * validated login body DTO so services never need `req` directly. */
export interface SessionMeta {
  ipAddress?: string;
  userAgent?: string;
}
