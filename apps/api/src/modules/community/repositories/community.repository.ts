import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

export class CommunityRepository {
  static async create(data: {
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    coverImageUrl: string | null;
    createdById: string;
    createdByType: string;
  }) {
    return prisma.community.create({ data });
  }

  static async listActive(skip: number, take: number) {
    const where = { status: "active" as const };

    const [data, total] = await prisma.$transaction([
      prisma.community.findMany({
        where,
        orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.community.count({ where }),
    ]);

    return { data, total };
  }

  static async listForAdmin(
    skip: number,
    take: number,
    status?: "active" | "disabled",
  ) {
    const where = status ? { status } : {};

    const [data, total] = await prisma.$transaction([
      prisma.community.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.community.count({ where }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.community.findUnique({ where: { id } });
  }

  static async hasMembership(
    communityId: string,
    memberId: string,
    memberType: string,
  ) {
    const row = await prisma.communityMember.findFirst({
      where: { communityId, memberId, memberType },
      select: { id: true },
    });
    return Boolean(row);
  }

  static async addMembershipAndIncrementCount(
    communityId: string,
    memberId: string,
    memberType: string,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.communityMember.create({
        data: { communityId, memberId, memberType },
      });

      return tx.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      });
    });
  }

  static async updateCommunity(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      iconUrl?: string | null;
      coverImageUrl?: string | null;
    },
  ) {
    return prisma.community.update({
      where: { id },
      data,
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.community.update({
      where: { id },
      data: { status },
    });
  }

  static async findPostById(postId: string) {
    return prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        communityId: true,
        authorId: true,
        authorType: true,
        status: true,
      },
    });
  }

  static async softDeletePost(
    postId: string,
    communityId: string,
    shouldDecrementPostCount: boolean,
  ) {
    return prisma.$transaction(async (tx) => {
      const deletedPost = await tx.communityPost.update({
        where: { id: postId },
        data: {
          status: "deleted",
        },
      });

      if (shouldDecrementPostCount) {
        await tx.community.update({
          where: { id: communityId },
          data: {
            postCount: {
              decrement: 1,
            },
          },
        });
      }

      return deletedPost;
    });
  }

  static async createPostAndIncrementCount(data: {
    communityId: string;
    authorId: string;
    authorType: string;
    content: string;
    attachments: Prisma.InputJsonValue;
  }) {
    return prisma.$transaction(async (tx) => {
      const post = await tx.communityPost.create({
        data: {
          communityId: data.communityId,
          authorId: data.authorId,
          authorType: data.authorType,
          content: data.content,
          attachments: data.attachments,
          status: "active",
        },
      });

      await tx.community.update({
        where: { id: data.communityId },
        data: {
          postCount: {
            increment: 1,
          },
        },
      });

      return post;
    });
  }
}
