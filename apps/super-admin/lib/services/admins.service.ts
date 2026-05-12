import { api } from "@/lib/api";

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

interface ProfileUser {
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

export interface AdminProfilesResponse {
  students: ProfileUser[];
  blinkUsers: ProfileUser[];
  platformAdmins: PlatformAdmin[];
}

export async function getAdminProfiles(): Promise<AdminProfilesResponse> {
  const response = await api.get<{
    students: ProfileUser[];
    blinkUsers: ProfileUser[];
    platformAdmins: PlatformAdmin[];
  }>("/api/v1/admin/users/profiles");

  return {
    students: response.students ?? [],
    blinkUsers: response.blinkUsers ?? [],
    // Keep UI stable if backend does not return platformAdmins yet.
    platformAdmins: response.platformAdmins ?? [],
  };
}

export async function getPendingBlinkUsers(): Promise<ProfileUser[]> {
  const response = await api.get<ProfileUser[]>(
    "/api/v1/admin/users/blink-users/pending",
  );
  return response ?? [];
}
