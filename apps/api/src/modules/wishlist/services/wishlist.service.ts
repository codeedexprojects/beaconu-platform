import { NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { WishlistRepository } from "../repositories/wishlist.repository";
import { WishlistQuery } from "../queries/wishlist.query";

export class WishlistService {
  // Cross-module read used by other modules (e.g. colleges) to personalize
  // public responses with wishlist status for the requesting student.
  static async getWishlistedCollegeIds(
    studentId: string,
    collegeIds: string[],
  ): Promise<Set<string>> {
    return WishlistQuery.getWishlistedCollegeIds(studentId, collegeIds);
  }

  static async isWishlisted(
    studentId: string,
    collegeId: string,
  ): Promise<boolean> {
    return WishlistQuery.isWishlisted(studentId, collegeId);
  }

  static async add(studentId: string, collegeId: string): Promise<void> {
    const college = await WishlistRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");

    await WishlistRepository.add(studentId, collegeId);
    logger.info({
      action: "WISHLIST_ADDED",
      module: "wishlist",
      studentId,
      collegeId,
    });
  }

  static async remove(studentId: string, collegeId: string): Promise<void> {
    const removed = await WishlistRepository.remove(studentId, collegeId);
    if (removed === 0) {
      throw new NotFoundError("College is not in your wishlist");
    }
    logger.info({
      action: "WISHLIST_REMOVED",
      module: "wishlist",
      studentId,
      collegeId,
    });
  }
}
