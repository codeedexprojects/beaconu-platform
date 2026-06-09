import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

export class CommunityRepository {
  private static async enrichCommentResponse(
    comment: Prisma.CommunityCommentGetPayload<Record<string, never>>,
    userId: string,
    userType: string,
  ) {
    const authorProfiles = await this.resolveAuthorProfiles([
      {
        id: comment.authorId,
        type: comment.authorType,
      },
    ]);

    const authorProfile = authorProfiles.get(
      `${comment.authorType}:${comment.authorId}`,
    );

    return {
      ...comment,
      replies: [],
      authorName: authorProfile?.fullName ?? null,
      authorAvatarUrl: authorProfile?.avatarUrl ?? null,
      currentUserVote: null,
      isLiked: false,
      isDisliked: false,
      isOwnComment:
        comment.authorId === userId && comment.authorType === userType,
    };
  }

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

  static async listVisibleWithJoinStatus(
    skip: number,
    take: number,
    userId: string,
    userType: string,
    search?: string,
  ) {
    const searchClause = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const where = {
      ...searchClause,
      OR: [
        { status: "active" as const },
        { createdById: userId, createdByType: userType },
      ],
    };

    return prisma.$transaction(async (tx) => {
      const [communities, total] = await Promise.all([
        tx.community.findMany({
          where,
          orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
          skip,
          take,
        }),
        tx.community.count({ where }),
      ]);

      const communityIds = communities.map((community) => community.id);

      const memberships =
        communityIds.length > 0
          ? await tx.communityMember.findMany({
              where: {
                communityId: { in: communityIds },
                memberId: userId,
                memberType: userType,
              },
              select: {
                communityId: true,
              },
            })
          : [];

      const joinedCommunityIds = new Set(
        memberships.map((membership) => membership.communityId),
      );

      const data = communities.map((community) => {
        const isOwner =
          community.createdById === userId &&
          community.createdByType === userType;

        return {
          ...community,
          isJoined: isOwner || joinedCommunityIds.has(community.id),
        };
      });

      return { data, total };
    });
  }

  static async listJoinedWithSearch(
    skip: number,
    take: number,
    userId: string,
    userType: string,
    search?: string,
  ) {
    const communitySearchClause = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const where = {
      memberId: userId,
      memberType: userType,
      community: {
        status: "active" as const,
        ...communitySearchClause,
      },
    };

    const [memberships, total] = await prisma.$transaction([
      prisma.communityMember.findMany({
        where,
        include: {
          community: true,
        },
        orderBy: [{ joinedAt: "desc" }],
        skip,
        take,
      }),
      prisma.communityMember.count({ where }),
    ]);

    const data = memberships.map((membership) => ({
      ...membership.community,
      isJoined: true,
    }));

    return { data, total };
  }

  static async listCreatedWithJoinStatus(
    skip: number,
    take: number,
    userId: string,
    userType: string,
    search?: string,
  ) {
    const searchClause = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const where = {
      createdById: userId,
      createdByType: userType,
      ...searchClause,
    };

    return prisma.$transaction(async (tx) => {
      const [communities, total] = await Promise.all([
        tx.community.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
          skip,
          take,
        }),
        tx.community.count({ where }),
      ]);

      const communityIds = communities.map((community) => community.id);

      const memberships =
        communityIds.length > 0
          ? await tx.communityMember.findMany({
              where: {
                communityId: { in: communityIds },
                memberId: userId,
                memberType: userType,
              },
              select: {
                communityId: true,
              },
            })
          : [];

      const joinedCommunityIds = new Set(
        memberships.map((membership) => membership.communityId),
      );

      const data = communities.map((community) => ({
        ...community,
        isJoined: joinedCommunityIds.has(community.id),
      }));

      return { data, total };
    });
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

  static async listPostsByCommunityId(
    communityId: string,
    skip: number,
    take: number,
    userId: string,
    userType: string,
  ) {
    const where = {
      communityId,
      status: "active" as const,
    };

    const [data, total] = await prisma.$transaction([
      prisma.communityPost.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        include: {
          votes: {
            where: {
              voterId: userId,
              voterType: userType,
            },
            select: {
              voteType: true,
            },
            take: 1,
          },
          comments: {
            where: {
              status: "active",
              parentCommentId: null,
            },
            orderBy: [{ createdAt: "asc" }],
            include: {
              likes: {
                where: {
                  likerId: userId,
                  likerType: userType,
                },
                select: {
                  id: true,
                },
                take: 1,
              },
              replies: {
                where: {
                  status: "active",
                },
                orderBy: [{ createdAt: "asc" }],
                include: {
                  likes: {
                    where: {
                      likerId: userId,
                      likerType: userType,
                    },
                    select: {
                      id: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        skip,
        take,
      }),
      prisma.communityPost.count({ where }),
    ]);

    // Collect all unique author identifiers (posts + comments + replies)
    const authorKeys = new Map<string, { id: string; type: string }>();

    for (const post of data) {
      const postKey = `${post.authorType}:${post.authorId}`;
      if (!authorKeys.has(postKey)) {
        authorKeys.set(postKey, {
          id: post.authorId,
          type: post.authorType,
        });
      }

      for (const comment of post.comments) {
        const commentKey = `${comment.authorType}:${comment.authorId}`;
        if (!authorKeys.has(commentKey)) {
          authorKeys.set(commentKey, {
            id: comment.authorId,
            type: comment.authorType,
          });
        }

        for (const reply of comment.replies) {
          const replyKey = `${reply.authorType}:${reply.authorId}`;
          if (!authorKeys.has(replyKey)) {
            authorKeys.set(replyKey, {
              id: reply.authorId,
              type: reply.authorType,
            });
          }
        }
      }
    }

    // Batch-resolve author profiles (avatarUrl, fullName) by type
    const authorProfiles = await this.resolveAuthorProfiles(
      Array.from(authorKeys.values()),
    );

    const formattedData = data.map((post) => {
      const currentUserVote = post.votes[0]?.voteType ?? null;
      const postAuthorKey = `${post.authorType}:${post.authorId}`;
      const postAuthor = authorProfiles.get(postAuthorKey);
      const isOwnPost =
        post.authorId === userId && post.authorType === userType;

      const enrichedComments = post.comments.map((comment) => {
        const commentAuthorKey = `${comment.authorType}:${comment.authorId}`;
        const commentAuthor = authorProfiles.get(commentAuthorKey);
        const commentCurrentUserVote =
          comment.likes.length > 0 ? "upvote" : null;
        const isOwnComment =
          comment.authorId === userId && comment.authorType === userType;

        const enrichedReplies = comment.replies.map((reply) => {
          const replyAuthorKey = `${reply.authorType}:${reply.authorId}`;
          const replyAuthor = authorProfiles.get(replyAuthorKey);
          const replyCurrentUserVote = reply.likes.length > 0 ? "upvote" : null;
          const isOwnReply =
            reply.authorId === userId && reply.authorType === userType;
          const { likes: _replyLikes, ...replyWithoutLikes } = reply;

          return {
            ...replyWithoutLikes,
            authorName: replyAuthor?.fullName ?? null,
            authorAvatarUrl: replyAuthor?.avatarUrl ?? null,
            currentUserVote: replyCurrentUserVote,
            isLiked: replyCurrentUserVote === "upvote",
            isDisliked: false,
            isOwnReply,
          };
        });

        const { likes: _commentLikes, ...commentWithoutLikes } = comment;

        return {
          ...commentWithoutLikes,
          authorName: commentAuthor?.fullName ?? null,
          authorAvatarUrl: commentAuthor?.avatarUrl ?? null,
          currentUserVote: commentCurrentUserVote,
          isLiked: commentCurrentUserVote === "upvote",
          isDisliked: false,
          isOwnComment,
          replies: enrichedReplies,
        };
      });

      const { votes, ...postWithoutVotes } = post;

      return {
        ...postWithoutVotes,
        currentUserVote,
        isLiked: currentUserVote === "upvote",
        isDisliked: currentUserVote === "downvote",
        isOwnPost,
        upvoteCount: post.upvoteCount,
        downvoteCount: post.downvoteCount,
        authorName: postAuthor?.fullName ?? null,
        authorAvatarUrl: postAuthor?.avatarUrl ?? null,
        comments: enrichedComments,
      };
    });

    return { data: formattedData, total };
  }

  /**
   * Batch-resolve author profiles from polymorphic user tables.
   * Groups author IDs by type, queries each table once, and returns a
   * Map keyed by "type:id" with { fullName, avatarUrl }.
   */
  private static async resolveAuthorProfiles(
    authors: { id: string; type: string }[],
  ): Promise<Map<string, { fullName: string; avatarUrl: string | null }>> {
    const byType = new Map<string, string[]>();
    for (const author of authors) {
      const ids = byType.get(author.type) ?? [];
      ids.push(author.id);
      byType.set(author.type, ids);
    }

    const result = new Map<
      string,
      { fullName: string; avatarUrl: string | null }
    >();

    const studentIds = byType.get("student") ?? [];
    if (studentIds.length > 0) {
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      });
      for (const s of students) {
        result.set(`student:${s.id}`, {
          fullName: s.fullName,
          avatarUrl: s.avatarUrl,
        });
      }
    }

    const staffIds = byType.get("staff") ?? [];
    if (staffIds.length > 0) {
      const staff = await prisma.staffMember.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      });
      for (const s of staff) {
        result.set(`staff:${s.id}`, {
          fullName: s.fullName,
          avatarUrl: s.avatarUrl,
        });
      }
    }

    const platformAdminIds = byType.get("platform_admin") ?? [];
    if (platformAdminIds.length > 0) {
      const admins = await prisma.platformAdmin.findMany({
        where: { id: { in: platformAdminIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      });
      for (const a of admins) {
        result.set(`platform_admin:${a.id}`, {
          fullName: a.fullName,
          avatarUrl: a.avatarUrl,
        });
      }
    }

    const blinkIds = byType.get("blink") ?? [];
    if (blinkIds.length > 0) {
      const blinkUsers = await prisma.blinkUser.findMany({
        where: { id: { in: blinkIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      });
      for (const b of blinkUsers) {
        result.set(`blink:${b.id}`, {
          fullName: b.fullName,
          avatarUrl: b.avatarUrl,
        });
      }
    }

    const counsellorIds = byType.get("counsellor") ?? [];
    if (counsellorIds.length > 0) {
      const counsellors = await prisma.counsellor.findMany({
        where: { id: { in: counsellorIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      });
      for (const c of counsellors) {
        result.set(`counsellor:${c.id}`, {
          fullName: c.fullName,
          avatarUrl: c.avatarUrl,
        });
      }
    }

    return result;
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
        commentCount: true,
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

  static async findCommentById(commentId: string) {
    return prisma.communityComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        authorId: true,
        authorType: true,
        parentCommentId: true,
        status: true,
      },
    });
  }

  static async createCommentAndIncrementCount(data: {
    postId: string;
    authorId: string;
    authorType: string;
    content: string;
    parentCommentId?: string;
    userId: string;
    userType: string;
  }) {
    const comment = await prisma.$transaction(async (tx) => {
      const createdComment = await tx.communityComment.create({
        data: {
          postId: data.postId,
          authorId: data.authorId,
          authorType: data.authorType,
          content: data.content,
          parentCommentId: data.parentCommentId,
          status: "active",
        },
      });

      await tx.communityPost.update({
        where: { id: data.postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      return createdComment;
    });

    return this.enrichCommentResponse(comment, data.userId, data.userType);
  }

  static async incrementCommentLikeCount(commentId: string) {
    return prisma.communityComment.update({
      where: { id: commentId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });
  }

  static async incrementShareCount(postId: string) {
    return prisma.communityPost.update({
      where: { id: postId },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });
  }

  static async applyPostVote(
    postId: string,
    voterId: string,
    voterType: string,
    voteType: "upvote" | "downvote",
  ) {
    return prisma.$transaction(async (tx) => {
      const existingVote = await tx.communityPostVote.findFirst({
        where: {
          postId,
          voterId,
          voterType,
        },
        select: {
          id: true,
          voteType: true,
        },
      });

      if (!existingVote) {
        await tx.communityPostVote.create({
          data: {
            postId,
            voterId,
            voterType,
            voteType,
          },
        });

        const post = await tx.communityPost.update({
          where: { id: postId },
          data:
            voteType === "upvote"
              ? {
                  upvoteCount: {
                    increment: 1,
                  },
                }
              : {
                  downvoteCount: {
                    increment: 1,
                  },
                },
        });

        return {
          ...post,
          currentUserVote: voteType,
          isLiked: voteType === "upvote",
          isDisliked: voteType === "downvote",
        };
      }

      if (existingVote.voteType === voteType) {
        const post = await tx.communityPost.findUnique({
          where: { id: postId },
        });

        if (!post) {
          return null;
        }

        return {
          ...post,
          currentUserVote: existingVote.voteType,
          isLiked: existingVote.voteType === "upvote",
          isDisliked: existingVote.voteType === "downvote",
        };
      }

      await tx.communityPostVote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });

      const post = await tx.communityPost.update({
        where: { id: postId },
        data:
          voteType === "upvote"
            ? {
                upvoteCount: {
                  increment: 1,
                },
                downvoteCount: {
                  decrement: 1,
                },
              }
            : {
                upvoteCount: {
                  decrement: 1,
                },
                downvoteCount: {
                  increment: 1,
                },
              },
      });

      return {
        ...post,
        currentUserVote: voteType,
        isLiked: voteType === "upvote",
        isDisliked: voteType === "downvote",
      };
    });
  }

  static async softDeleteComment(
    commentId: string,
    postId: string,
    shouldDecrementCommentCount: boolean,
  ) {
    return prisma.$transaction(async (tx) => {
      const deletedComment = await tx.communityComment.update({
        where: { id: commentId },
        data: {
          status: "deleted",
        },
      });

      if (shouldDecrementCommentCount) {
        await tx.communityPost.update({
          where: { id: postId },
          data: {
            commentCount: {
              decrement: 1,
            },
          },
        });
      }

      return deletedComment;
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

  static async applyCommentLike(
    commentId: string,
    likerId: string,
    likerType: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const existingLike = await tx.communityCommentLike.findFirst({
        where: {
          commentId,
          likerId,
          likerType,
        },
        select: {
          id: true,
        },
      });

      if (existingLike) {
        await tx.communityCommentLike.delete({
          where: { id: existingLike.id },
        });

        const comment = await tx.communityComment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });

        return {
          ...comment,
          currentUserVote: null,
          isLiked: false,
          isDisliked: false,
        };
      }

      await tx.communityCommentLike.create({
        data: {
          commentId,
          likerId,
          likerType,
        },
      });

      const comment = await tx.communityComment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return {
        ...comment,
        currentUserVote: "upvote",
        isLiked: true,
        isDisliked: false,
      };
    });
  }
}
