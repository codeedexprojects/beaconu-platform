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
export const ACCESS_TOKEN_EXPIRY = "90d";
export const REFRESH_TOKEN_EXPIRY = "90d";

// sameSite "none" is required for cross-domain deployments (e.g. Vercel → Render).
// "none" mandates secure:true, which is safe because production is always HTTPS.
// Development keeps "lax" because localhost is same-site and doesn't support secure cookies over HTTP.
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
};

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
