export interface StarterGuideStep {
  title: string;
  description: string;
}

export interface StarterGuideListItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StarterGuide {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  steps: StarterGuideStep[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Public/student-facing list item — title + thumbnail only. */
export interface PublicStarterGuideListItem {
  id: string;
  title: string;
  thumbnailUrl: string;
}

/** Public/student-facing detail — includes the video link and steps. */
export interface PublicStarterGuideDetail {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  steps: StarterGuideStep[];
}

export interface CreateStarterGuideInput {
  title: string;
  thumbnail_url: string;
  video_url: string;
  steps: StarterGuideStep[];
  display_order?: number;
}

export interface UpdateStarterGuideInput {
  title?: string;
  thumbnail_url?: string;
  video_url?: string;
  steps?: StarterGuideStep[];
  display_order?: number;
  is_active?: boolean;
}
