export interface PlatformConfig {
  gstPercentage: number;
  counsellorMinWithdrawalAmount: number;
  updatedByAdminId: string | null;
  updatedAt: string;
}

export interface PlatformRole {
  id: string;
  name: string;
  slug: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: string[];
}

export interface ProfileUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  agencyName?: string;
  createdAt: string;
  blinkRole?: {
    name: string;
    slug: string;
  };
}

export interface PlatformAdmin {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  platformRole?: {
    name: string;
    slug: string;
  };
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminProfilesResponse {
  students: ProfileUser[];
  blinkUsers: ProfileUser[];
  platformAdmins: PlatformAdmin[];
}

export interface AssociateAdmin {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  agencyName: string;
  agencyRegNumber: string;
  country?: string;
  createdAt: string;
}
