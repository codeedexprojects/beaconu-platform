import { api } from "../api";
import type {
  SiteAnnouncementItem,
  CreateSiteAnnouncementInput,
  UpdateSiteAnnouncementInput,
} from "@beaconu/types";

export async function getSiteAnnouncements(): Promise<SiteAnnouncementItem[]> {
  return api.get("/api/v1/college-admin/announcements");
}

export async function createSiteAnnouncement(
  data: CreateSiteAnnouncementInput,
): Promise<SiteAnnouncementItem> {
  return api.post("/api/v1/college-admin/announcements", data);
}

export async function updateSiteAnnouncement(
  id: string,
  data: UpdateSiteAnnouncementInput,
): Promise<SiteAnnouncementItem> {
  return api.patch(`/api/v1/college-admin/announcements/${id}`, data);
}

export async function deleteSiteAnnouncement(id: string): Promise<null> {
  return api.delete(`/api/v1/college-admin/announcements/${id}`);
}

export async function reorderSiteAnnouncements(
  orderedIds: string[],
): Promise<SiteAnnouncementItem[]> {
  return api.patch("/api/v1/college-admin/announcements/reorder", {
    orderedIds,
  });
}
