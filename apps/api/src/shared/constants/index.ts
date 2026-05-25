export const USER_TYPES = {
  STUDENT: "student",
  PLATFORM_ADMIN: "platform_admin",
  STAFF: "staff_member",
  BLINK_ASSOCIATE: "blink_associate",
  BLINK_EMPLOYEE: "blink_employee",
  BLINK_AMBASSADOR: "blink_ambassador",
  COUNSELLOR: "counsellor",
  BLOG_AUTHOR: "blog_author",
} as const;

export const SESSION_EXPIRY_DAYS = 90;
export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "90d";

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
  PENDING_APPROVAL: "pending_approval",
  REJECTED: "rejected",
} as const;
export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const COLLEGE_ONBOARDING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
