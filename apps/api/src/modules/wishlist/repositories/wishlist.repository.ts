import { prisma } from "@beaconu/db";

export class WishlistRepository {
  static async add(studentId: string, collegeId: string, courseId?: string) {
    return prisma.collegeWishlist.upsert({
      where: { uq_college_wishlist: { studentId, collegeId } },
      create: { studentId, collegeId, courseId: courseId ?? null },
      update: courseId ? { courseId } : {},
    });
  }

  static async remove(studentId: string, collegeId: string): Promise<number> {
    const result = await prisma.collegeWishlist.deleteMany({
      where: { studentId, collegeId },
    });
    return result.count;
  }

  static async findCollegeById(collegeId: string) {
    return prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, status: true },
    });
  }

  static async findCourseInCollege(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true },
    });
  }
}
