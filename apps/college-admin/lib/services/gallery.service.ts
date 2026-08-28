import { api } from "../api";
import type { PublicGalleryItem } from "@beaconu/types";

export interface CreateGalleryItemInput {
  mediaType: "image" | "video";
  url: string;
  caption?: string | null;
}

export async function getCollegeGalleryItems(): Promise<PublicGalleryItem[]> {
  return api.get("/api/v1/college-admin/gallery");
}

export async function createCollegeGalleryItem(
  data: CreateGalleryItemInput,
): Promise<PublicGalleryItem> {
  return api.post("/api/v1/college-admin/gallery", data);
}

export async function deleteCollegeGalleryItem(id: string): Promise<null> {
  return api.delete(`/api/v1/college-admin/gallery/${id}`);
}

export async function reorderCollegeGalleryItems(
  orderedIds: string[],
): Promise<PublicGalleryItem[]> {
  return api.patch("/api/v1/college-admin/gallery/reorder", { orderedIds });
}
