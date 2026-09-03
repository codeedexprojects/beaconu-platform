export interface Feed {
  id: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedInput {
  caption: string;
  thumbnail_url: string;
  video_url: string;
  display_order?: number;
}

export interface UpdateFeedInput {
  caption?: string;
  thumbnail_url?: string;
  video_url?: string;
  display_order?: number;
  is_active?: boolean;
}
