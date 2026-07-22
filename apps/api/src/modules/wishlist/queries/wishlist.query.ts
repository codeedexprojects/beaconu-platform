import { prisma } from "@beaconu/db";
import type { PaginationMeta, WishlistCollegeItem } from "@beaconu/types";

function mapWishlistItem(row: {
  createdAt: Date;
  college: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    city: string | null;
    state: string | null;
    avgRating: unknown;
    reviewCount: number;
  };
}): WishlistCollegeItem {
  return {
    id: row.college.id,
    name: row.college.name,
    slug: row.college.slug,
    logoUrl: row.college.logoUrl,
    coverImageUrl: row.college.coverImageUrl,
    city: row.college.city,
    state: row.college.state,
    avgRating: Number(row.college.avgRating),
    reviewCount: row.college.reviewCount,
    wishlistedAt: row.createdAt.toISOString(),
  };
}

export class WishlistQuery {
  static async listForStudent(
    studentId: string,
    filters: { page: number; limit: number },
  ): Promise<{ colleges: WishlistCollegeItem[]; meta: PaginationMeta }> {
    const where = { studentId };
    const skip = (filters.page - 1) * filters.limit;

    const [total, rows] = await Promise.all([
      prisma.collegeWishlist.count({ where }),
      prisma.collegeWishlist.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          college: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              coverImageUrl: true,
              city: true,
              state: true,
              avgRating: true,
              reviewCount: true,
            },
          },
        },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { colleges: rows.map(mapWishlistItem), meta };
  }

  static async isWishlisted(
    studentId: string,
    collegeId: string,
  ): Promise<boolean> {
    const row = await prisma.collegeWishlist.findUnique({
      where: { uq_college_wishlist: { studentId, collegeId } },
      select: { id: true },
    });
    return !!row;
  }

  static async getWishlistedCollegeIds(
    studentId: string,
    collegeIds: string[],
  ): Promise<Set<string>> {
    if (collegeIds.length === 0) return new Set();

    const rows = await prisma.collegeWishlist.findMany({
      where: { studentId, collegeId: { in: collegeIds } },
      select: { collegeId: true },
    });
    return new Set(rows.map((row) => row.collegeId));
  }
}
