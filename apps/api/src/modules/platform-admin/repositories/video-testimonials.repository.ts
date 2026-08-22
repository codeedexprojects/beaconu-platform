import { prisma } from "@beaconu/db";

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

export class VideoTestimonialsRepository {
  static async findById(id: string) {
    return prisma.videoTestimonial.findUnique({
      where: { id },
      select: VTM_SELECT,
    });
  }

  static async create(data: {
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    studentImageUrl: string;
    displayOrder: number;
  }) {
    return prisma.videoTestimonial.create({ data, select: VTM_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      title?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
      studentImageUrl?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.videoTestimonial.update({
      where: { id },
      data,
      select: VTM_SELECT,
    });
  }

  static async softDeactivateById(id: string) {
    return prisma.videoTestimonial.update({
      where: { id },
      data: { isActive: false },
      select: VTM_SELECT,
    });
  }
}
