export interface StarterGuideVideo {
  id: string;
  title: string;
  videoKey: string;
  videoUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StarterGuideVideoListItem {
  id: string;
  title: string;
  videoUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStarterGuideVideoInput {
  title: string;
  video_key: string;
  display_order?: number;
}

export interface UpdateStarterGuideVideoInput {
  title?: string;
  video_key?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface PresignStarterGuideVideoUploadInput {
  mime_type: "video/mp4" | "video/webm";
  file_size_bytes: number;
}

export interface StarterGuideVideoPresignResult {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}
