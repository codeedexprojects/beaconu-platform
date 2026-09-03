import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { feedSchemas } from "../validators/feed.validator";
import { FeedQuery } from "../queries/feed.query";

export class FeedPublicController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = feedSchemas.listQuery.parse(req.query);
    const result = await FeedQuery.listActive(filters);
    res
      .status(200)
      .json(ApiResponse.success("Feed fetched", result.data, result.meta));
  }
}
