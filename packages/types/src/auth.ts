export enum UserType {
  Student = "student",
  PlatformAdmin = "platform_admin",
  StaffMember = "staff_member",
  BlinkUser = "blink_user",
  Counsellor = "counsellor",
  BlogAuthor = "blog_author",
}

export interface JwtPayload {
  userId: string;
  userType: UserType;
  collegeId?: string;
  roleId?: string;
  permissions?: string[];
}

// Auth fields added to Express Request by middleware.
// Module augmentation lives in apps/api/src/shared/types/express.d.ts
export interface AuthenticatedRequest {
  userId: string;
  userType: UserType;
  collegeId?: string;
  roleId?: string;
  permissions?: string[];
}
