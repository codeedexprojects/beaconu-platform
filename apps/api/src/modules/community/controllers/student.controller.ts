import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CommunityService } from "../services/community.service";
import { CommunitySchema } from "../validators/community.validator";

export class CommunityStudentController {
  static async list(req: Request, res: Response): Promise<void> {
    const filters = CommunitySchema.listQuery.parse(req.query);
    const result = await CommunityService.list(
      filters,
      req.userId!,
      req.userType!,
    );

    res
      .status(200)
      .json(
        ApiResponse.success("Communities fetched", result.data, result.meta),
      );
  }

  static async listJoined(req: Request, res: Response): Promise<void> {
    const filters = CommunitySchema.listQuery.parse(req.query);
    const result = await CommunityService.listJoinedCommunities(
      filters,
      req.userId!,
      req.userType!,
    );

    res
      .status(200)
      .json(
        ApiResponse.success(
          "Joined communities fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async listMyCreated(req: Request, res: Response): Promise<void> {
    const filters = CommunitySchema.listQuery.parse(req.query);
    const result = await CommunityService.listMyCreatedCommunities(
      filters,
      req.userId!,
      req.userType!,
    );

    res
      .status(200)
      .json(
        ApiResponse.success(
          "My created communities fetched",
          result.data,
          result.meta,
        ),
      );
  }
  static async create(req: Request, res: Response): Promise<void> {
    const input = CommunitySchema.create.parse(req.body);
    const result = await CommunityService.create(
      input,
      req.userId!,
      req.userType!,
    );

    res.status(201).json(ApiResponse.success("Community created", result));
  }

  static async join(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.idParam.parse(req.params);
    const result = await CommunityService.join(
      params.id,
      req.userId!,
      req.userType!,
    );

    res.status(200).json(ApiResponse.success("Joined community", result));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.idParam.parse(req.params);
    const input = CommunitySchema.update.parse(req.body);
    const result = await CommunityService.updateCommunity(
      params.id,
      input,
      req.userId!,
      req.userType!,
    );

    res.status(200).json(ApiResponse.success("Community updated", result));
  }

  static async deletePost(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.postDeleteParam.parse(req.params);
    const result = await CommunityService.deleteCommunityPost(
      params.id,
      params.postId,
      req.userId!,
      req.userType!,
    );

    res.status(200).json(ApiResponse.success("Community post deleted", result));
  }

  static async createPost(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.idParam.parse(req.params);
    const input = CommunitySchema.createPost.parse(req.body);
    const result = await CommunityService.createCommunityPost(
      params.id,
      input,
      req.userId!,
      req.userType!,
    );

    res.status(201).json(ApiResponse.success("Community post created", result));
  }

  static async listPosts(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.idParam.parse(req.params);
    const filters = CommunitySchema.listQuery.parse(req.query);
    const result = await CommunityService.listCommunityPosts(
      params.id,
      filters,
      req.userId!,
      req.userType!,
    );

    res
      .status(200)
      .json(
        ApiResponse.success(
          "Community posts fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async sharePost(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.postDeleteParam.parse(req.params);
    const result = await CommunityService.sharePost(params.id, params.postId);

    res.status(200).json(ApiResponse.success("Community post shared", result));
  }

  static async likePost(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.postDeleteParam.parse(req.params);
    const result = await CommunityService.likePost(
      params.id,
      params.postId,
      req.userId!,
      req.userType!,
    );

    res.status(200).json(ApiResponse.success("Community post liked", result));
  }

  static async dislikePost(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.postDeleteParam.parse(req.params);
    const result = await CommunityService.dislikePost(
      params.id,
      params.postId,
      req.userId!,
      req.userType!,
    );

    res
      .status(200)
      .json(ApiResponse.success("Community post disliked", result));
  }

  static async createComment(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.postDeleteParam.parse(req.params);
    const input = CommunitySchema.createComment.parse(req.body);
    const result = await CommunityService.createComment(
      params.id,
      params.postId,
      input,
      req.userId!,
      req.userType!,
    );

    res.status(201).json(ApiResponse.success("Comment created", result));
  }

  static async replyToComment(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.commentDeleteParam.parse(req.params);
    const input = CommunitySchema.createComment.parse(req.body);
    const result = await CommunityService.replyToComment(
      params.id,
      params.postId,
      params.commentId,
      input,
      req.userId!,
      req.userType!,
    );

    res.status(201).json(ApiResponse.success("Reply created", result));
  }

  static async likeComment(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.commentDeleteParam.parse(req.params);
    const result = await CommunityService.likeComment(
      params.id,
      params.postId,
      params.commentId,
    );

    res.status(200).json(ApiResponse.success("Comment liked", result));
  }

  static async deleteComment(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.commentDeleteParam.parse(req.params);
    const result = await CommunityService.deleteComment(
      params.id,
      params.postId,
      params.commentId,
      req.userId!,
      req.userType!,
    );

    res.status(200).json(ApiResponse.success("Comment deleted", result));
  }
}
