import { prisma } from "@beaconu/db";

export class PublicCollegeExtrasQuery {
  static async getScholarshipsBySlug(slug: string) {
    const college = await prisma.college.findUnique({
      where: { slug },
      select: {
        id: true,
        scholarshipConfigs: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            scholarshipType: true,
            discountType: true,
            discountValue: true,
            discountDisplay: true,
            displayLabel: true,
            applicableYears: true,
            termsAndConditions: true,
            coverImageUrl: true,
          },
        },
      },
    });

    return college ? college.scholarshipConfigs : null;
  }

  static async getGalleryBySlug(slug: string) {
    const college = await prisma.college.findUnique({
      where: { slug },
      select: {
        id: true,
        gallery: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            mediaType: true,
            url: true,
            caption: true,
            sortOrder: true,
          },
        },
      },
    });

    return college ? college.gallery : null;
  }

  static async getReviewsBySlug(slug: string, limit: number) {
    const college = await prisma.college.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!college) return null;

    const reviews = await prisma.collegeReview.findMany({
      where: { collegeId: college.id, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        rating: true,
        reviewText: true,
        reviewType: true,
        categoryRatings: true,
        createdAt: true,
      },
    });

    return reviews;
  }
}
