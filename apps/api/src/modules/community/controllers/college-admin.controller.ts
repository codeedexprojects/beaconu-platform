import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CommunityService } from "../services/community.service";
import { CommunitySchema } from "../validators/community.validator";

export class CommunityCollegeAdminController {
  static async list(req: Request, res: Response): Promise<void> {
    const filters = CommunitySchema.listQuery.parse(req.query);
    const result = await CommunityService.list(filters);

    res
      .status(200)
      .json(
        ApiResponse.success("Communities fetched", result.data, result.meta),
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
}
