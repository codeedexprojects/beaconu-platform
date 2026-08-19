import { prisma } from "@beaconu/db";

export class ComparisonRepository {
  static async findCollegeBasics(collegeId: string) {
    return prisma.college.findUnique({
      where: { id: collegeId },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        coverImageUrl: true,
        city: true,
        district: true,
        state: true,
        establishedYear: true,
        collegeType: true,
        avgRating: true,
        reviewCount: true,
        campusSizeAcres: true,
        view360Url: true,
        clubs: true,
        university: {
          select: {
            name: true,
            accreditation: true,
            universityType: { select: { name: true } },
          },
        },
        institutionGroupMember: {
          select: {
            group: {
              select: {
                name: true,
                members: {
                  select: {
                    college: {
                      select: { id: true, name: true, logoUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async findCourseName(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true, name: true, duration: true, studyMode: true },
    });
  }

  static async findGalleryItems(collegeId: string) {
    return prisma.collegeGallery.findMany({
      where: { collegeId },
      orderBy: { sortOrder: "asc" },
      take: 20,
      select: {
        id: true,
        mediaType: true,
        url: true,
        caption: true,
        sortOrder: true,
      },
    });
  }
}
