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

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  permissions: string[];
  avatarUrl?: string;
}

export interface AuthenticatedRequest {
  userId: string;
  userType: UserType;
  collegeId?: string;
  roleId?: string;
  permissions?: string[];
}
