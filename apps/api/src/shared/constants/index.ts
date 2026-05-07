export const USER_TYPES = {
  STUDENT: 'student',
  PLATFORM_ADMIN: 'platform_admin',
  STAFF: 'staff',
  BLINK: 'blink',
  COUNSELLOR: 'counsellor',
} as const;

export const SESSION_EXPIRY_DAYS = 90;
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '90d';

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;
