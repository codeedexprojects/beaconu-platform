export interface Short {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShortInput {
  title: string;
  thumbnail_url: string;
  video_url: string;
  display_order?: number;
}

export interface UpdateShortInput {
  title?: string;
  thumbnail_url?: string;
  video_url?: string;
  display_order?: number;
  is_active?: boolean;
}
