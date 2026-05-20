export interface CampusAmbassador {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
}

export interface CollegeProfileDetails {
  totalCourses: number;
  instituteType: string | null;
  campusAmbassadors: CampusAmbassador[];
}

export interface CollegePermissionDto {
  code: string;
  description: string | null;
}

export interface CollegeRoleDto {
  id: string;
  name: string;
  slug: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: string[]; // array of permissionCodes
}

export interface CreateCollegeRoleInput {
  name: string;
  permissionCodes: string[];
}

export interface UpdateCollegeRoleInput {
  name?: string;
  isActive?: boolean;
  permissionCodes?: string[];
}
