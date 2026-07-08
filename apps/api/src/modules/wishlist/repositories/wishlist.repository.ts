import { prisma } from "@beaconu/db";

export class WishlistRepository {
  static async add(studentId: string, collegeId: string) {
    return prisma.collegeWishlist.upsert({
      where: { uq_college_wishlist: { studentId, collegeId } },
      create: { studentId, collegeId },
      update: {},
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
}
