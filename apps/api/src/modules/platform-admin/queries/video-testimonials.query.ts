import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ListVideoTestimonialsQuery } from "../validators/video-testimonials.validator";

const VTM_SELECT = {
  id: true,
  title: true,
  videoUrl: true,
  thumbnailUrl: true,
  studentImageUrl: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class VideoTestimonialsQuery {
  static async listAll(filters: ListVideoTestimonialsQuery) {
    const { page, limit, is_active } = filters;
    const skip = (page - 1) * limit;
    const where = is_active !== undefined ? { isActive: is_active } : {};

    const [data, total] = await prisma.$transaction([
      prisma.videoTestimonial.findMany({
        where,
        select: VTM_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.videoTestimonial.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const testimonial = await prisma.videoTestimonial.findUnique({
      where: { id },
      select: VTM_SELECT,
    });
    if (!testimonial) throw new NotFoundError("Video testimonial not found");
    return testimonial;
  }

  /** Student-facing feed: paginated, active only. */
  static async listActive(filters: ListVideoTestimonialsQuery) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    const [data, total] = await prisma.$transaction([
      prisma.videoTestimonial.findMany({
        where,
        select: VTM_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.videoTestimonial.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }
}
