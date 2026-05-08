export interface UpdateMyProfileData {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

export interface UpdateCounsellorStatusData {
  status: 'active' | 'inactive' | 'pending_verification';
}

export interface CounsellorProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  counsellorType: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}
