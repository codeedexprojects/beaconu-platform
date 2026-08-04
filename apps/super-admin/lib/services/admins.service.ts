import { api } from "@/lib/api";
import type {
  AdminProfilesResponse,
  PlatformAdmin,
  ProfileUser,
} from "@beaconu/types";

export type { AdminProfilesResponse, PlatformAdmin, ProfileUser };

export async function getAdminProfiles(): Promise<AdminProfilesResponse> {
  const response = await api.get<AdminProfilesResponse>(
    "/api/v1/admin/users/profiles",
  );

  return {
    students: response.students ?? [],
    blinkUsers: response.blinkUsers ?? [],
    platformAdmins: response.platformAdmins ?? [],
  };
}

export async function getPendingBlinkUsers(): Promise<ProfileUser[]> {
  const response = await api.get<ProfileUser[]>(
    "/api/v1/admin/users/blink-users/pending",
  );
  return response ?? [];
}
