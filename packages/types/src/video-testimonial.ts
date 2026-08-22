export interface VideoTestimonial {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  studentImageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoTestimonialInput {
  title: string;
  video_url: string;
  thumbnail_url: string;
  student_image_url: string;
  display_order?: number;
}

export interface UpdateVideoTestimonialInput {
  title?: string;
  video_url?: string;
  thumbnail_url?: string;
  student_image_url?: string;
  display_order?: number;
  is_active?: boolean;
}
