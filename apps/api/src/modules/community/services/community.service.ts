import { Prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { generateSlug } from "@/shared/utils";
import { CommunityRepository } from "../repositories/community.repository";
import type {
  AdminListCommunitiesQuery,
  CreateCommunityCommentInput,
  CreateCommunityInput,
  CreateCommunityPostInput,
  ListCommunityPostsQuery,
  ListCommunitiesQuery,
} from "../validators/community.validator";

export class CommunityService {
  static async create(
    input: CreateCommunityInput,
    createdById: string,
    createdByType: string,
  ) {
    const slug =
      generateSlug(input.name) + "-" + Date.now().toString().slice(-6);

    return CommunityRepository.create({
      name: input.name,
      slug,
      description: input.description ?? null,
      iconUrl: input.iconUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      createdById,
      createdByType,
    });
  }

  static async list(
    filters: ListCommunitiesQuery,
    userId: string,
    userType: string,
  ) {
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const result = await CommunityRepository.listVisibleWithJoinStatus(
      skip,
      limit,
      userId,
      userType,
      filters.search,
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        hasNext: page * limit < result.total,
      },
    };
  }

  static async listJoinedCommunities(
    filters: ListCommunitiesQuery,
    userId: string,
    userType: string,
  ) {
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const result = await CommunityRepository.listJoinedWithSearch(
      skip,
      limit,
      userId,
      userType,
      filters.search,
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        hasNext: page * limit < result.total,
      },
    };
  }

  static async listMyCreatedCommunities(
    filters: ListCommunitiesQuery,
    userId: string,
    userType: string,
  ) {
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const result = await CommunityRepository.listCreatedWithJoinStatus(
      skip,
      limit,
      userId,
      userType,
      filters.search,
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        hasNext: page * limit < result.total,
      },
    };
  }

  static async listForAdmin(filters: AdminListCommunitiesQuery) {
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const result = await CommunityRepository.listForAdmin(
      skip,
      limit,
      filters.status,
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        hasNext: page * limit < result.total,
      },
    };
  }

  static async updateCommunity(
    communityId: string,
    input: {
      name?: string;
      description?: string | null;
      iconUrl?: string | null;
      coverImageUrl?: string | null;
    },
    userId: string,
    userType: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const isCreator =
      community.createdById === userId && community.createdByType === userType;

    const isPlatformAdmin = userType === "platform_admin";

    if (!isCreator && !isPlatformAdmin) {
      throw new ForbiddenError("You are not allowed to edit this community");
    }

    return CommunityRepository.updateCommunity(communityId, input);
  }

  static async join(communityId: string, memberId: string, memberType: string) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    if (community.status !== "active") {
      throw new ForbiddenError("Community is not active");
    }

    const alreadyJoined = await CommunityRepository.hasMembership(
      communityId,
      memberId,
      memberType,
    );

    if (alreadyJoined) {
      throw new ConflictError("Already joined");
    }

    try {
      return await CommunityRepository.addMembershipAndIncrementCount(
        communityId,
        memberId,
        memberType,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Already joined");
      }

      throw error;
    }
  }

  static async disableCommunity(communityId: string) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    return CommunityRepository.updateStatus(communityId, "disabled");
  }

  static async deleteCommunityPost(
    communityId: string,
    postId: string,
    userId: string,
    userType: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const post = await CommunityRepository.findPostById(postId);

    if (!post || post.communityId !== communityId) {
      throw new NotFoundError("Community post not found");
    }

    const isCommunityOwner =
      community.createdById === userId && community.createdByType === userType;

    const isPostAuthor =
      post.authorId === userId && post.authorType === userType;

    if (!isCommunityOwner && !isPostAuthor) {
      throw new ForbiddenError(
        "Only community owner or post author can delete this post",
      );
    }

    if (post.status === "deleted") {
      throw new ConflictError("Post already deleted");
    }

    return CommunityRepository.softDeletePost(
      postId,
      communityId,
      community.postCount > 0,
    );
  }

  static async createCommunityPost(
    communityId: string,
    input: CreateCommunityPostInput,
    userId: string,
    userType: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    if (community.status !== "active") {
      throw new ForbiddenError("Community is not active");
    }

    const isCommunityOwner =
      community.createdById === userId && community.createdByType === userType;

    const isJoinedMember = await CommunityRepository.hasMembership(
      communityId,
      userId,
      userType,
    );

    if (!isCommunityOwner && !isJoinedMember) {
      throw new ForbiddenError(
        "Only joined members or the community owner can create posts",
      );
    }

    return CommunityRepository.createPostAndIncrementCount({
      communityId,
      authorId: userId,
      authorType: userType,
      content: input.content,
      attachments: (input.attachments ?? []) as Prisma.InputJsonValue,
    });
  }

  static async listCommunityPosts(
    communityId: string,
    filters: ListCommunityPostsQuery,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const result = await CommunityRepository.listPostsByCommunityId(
      communityId,
      skip,
      limit,
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        hasNext: page * limit < result.total,
      },
    };
  }

  static async sharePost(communityId: string, postId: string) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const post = await CommunityRepository.findPostById(postId);

    if (!post || post.communityId !== communityId || post.status !== "active") {
      throw new NotFoundError("Post not found");
    }

    return CommunityRepository.incrementShareCount(postId);
  }

  static async createComment(
    communityId: string,
    postId: string,
    input: CreateCommunityCommentInput,
    userId: string,
    userType: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const post = await CommunityRepository.findPostById(postId);

    if (!post || post.communityId !== communityId || post.status !== "active") {
      throw new NotFoundError("Post not found");
    }

    return CommunityRepository.createCommentAndIncrementCount({
      postId,
      authorId: userId,
      authorType: userType,
      content: input.content,
    });
  }

  static async replyToComment(
    communityId: string,
    postId: string,
    commentId: string,
    input: CreateCommunityCommentInput,
    userId: string,
    userType: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const post = await CommunityRepository.findPostById(postId);

    if (!post || post.communityId !== communityId || post.status !== "active") {
      throw new NotFoundError("Post not found");
    }

    const parentComment = await CommunityRepository.findCommentById(commentId);

    if (
      !parentComment ||
      parentComment.postId !== postId ||
      parentComment.status !== "active"
    ) {
      throw new NotFoundError("Parent comment not found");
    }

    return CommunityRepository.createCommentAndIncrementCount({
      postId,
      authorId: userId,
      authorType: userType,
      content: input.content,
      parentCommentId: commentId,
    });
  }

  static async likeComment(
    communityId: string,
    postId: string,
    commentId: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const post = await CommunityRepository.findPostById(postId);

    if (!post || post.communityId !== communityId || post.status !== "active") {
      throw new NotFoundError("Post not found");
    }

    const comment = await CommunityRepository.findCommentById(commentId);

    if (!comment || comment.postId !== postId || comment.status !== "active") {
      throw new NotFoundError("Comment not found");
    }

    return CommunityRepository.incrementCommentLikeCount(commentId);
  }

  static async deleteComment(
    communityId: string,
    postId: string,
    commentId: string,
    userId: string,
    userType: string,
  ) {
    const community = await CommunityRepository.findById(communityId);

    if (!community) {
      throw new NotFoundError("Community not found");
    }

    const post = await CommunityRepository.findPostById(postId);

    if (!post || post.communityId !== communityId) {
      throw new NotFoundError("Post not found");
    }

    const comment = await CommunityRepository.findCommentById(commentId);

    if (!comment || comment.postId !== postId) {
      throw new NotFoundError("Comment not found");
    }

    const isCommunityOwner =
      community.createdById === userId && community.createdByType === userType;

    const isCommentAuthor =
      comment.authorId === userId && comment.authorType === userType;

    if (!isCommunityOwner && !isCommentAuthor) {
      throw new ForbiddenError(
        "Only community owner or comment author can delete this comment",
      );
    }

    if (comment.status === "deleted") {
      throw new ConflictError("Comment already deleted");
    }

    return CommunityRepository.softDeleteComment(
      commentId,
      postId,
      post.commentCount > 0,
    );
  }
}
