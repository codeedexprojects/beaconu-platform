export interface CampusAmbassador {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
}

export interface CampusAmbassadorDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  ambassadorType: string | null;
  campusCode: string | null;
  status: string;
  createdAt: string;
  course: string | null;
  district: string | null;
  state: string | null;
}

export interface CreateCampusAmbassadorInput {
  full_name: string;
  email: string;
  phone_number?: string;
  college_id: string;
  linked_student_id?: string;
  ambassador_type: "student" | "teacher";
  avatar_url?: string | null;
  course?: string;
  district?: string;
  state?: string;
  password: string;
  confirm_password: string;
}

export interface UpdateCampusAmbassadorInput {
  full_name?: string;
  phone_number?: string;
  ambassador_type?: "student" | "teacher";
  avatar_url?: string | null;
  course?: string;
  district?: string;
  state?: string;
  status?: "active" | "inactive";
  password?: string;
  confirm_password?: string;
}

export interface AmbassadorVisitStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  reassigned: number;
}

export interface CampusAmbassadorDetailDto extends CampusAmbassadorDto {
  visitStats: AmbassadorVisitStats;
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
