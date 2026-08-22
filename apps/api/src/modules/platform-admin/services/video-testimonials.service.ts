import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { VideoTestimonialsRepository } from "../repositories/video-testimonials.repository";
import {
  CreateVideoTestimonialInput,
  UpdateVideoTestimonialInput,
} from "../validators/video-testimonials.validator";

export class VideoTestimonialsService {
  static async create(data: CreateVideoTestimonialInput) {
    return VideoTestimonialsRepository.create({
      title: data.title,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      studentImageUrl: data.student_image_url,
      displayOrder: data.display_order ?? 0,
    });
  }

  static async update(id: string, data: UpdateVideoTestimonialInput) {
    const existing = await VideoTestimonialsRepository.findById(id);
    if (!existing) throw new NotFoundError("Video testimonial not found");

    return VideoTestimonialsRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.video_url !== undefined ? { videoUrl: data.video_url } : {}),
      ...(data.thumbnail_url !== undefined
        ? { thumbnailUrl: data.thumbnail_url }
        : {}),
      ...(data.student_image_url !== undefined
        ? { studentImageUrl: data.student_image_url }
        : {}),
      ...(data.display_order !== undefined
        ? { displayOrder: data.display_order }
        : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await VideoTestimonialsRepository.findById(id);
    if (!existing) throw new NotFoundError("Video testimonial not found");
    if (!existing.isActive)
      throw new ForbiddenError("Video testimonial is already inactive");
    return VideoTestimonialsRepository.softDeactivateById(id);
  }

  static async activate(id: string) {
    const existing = await VideoTestimonialsRepository.findById(id);
    if (!existing) throw new NotFoundError("Video testimonial not found");
    if (existing.isActive)
      throw new ForbiddenError("Video testimonial is already active");
    return VideoTestimonialsRepository.updateById(id, { isActive: true });
  }
}
