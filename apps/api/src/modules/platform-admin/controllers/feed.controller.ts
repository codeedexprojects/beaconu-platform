import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { feedSchemas } from "../validators/feed.validator";
import { FeedService } from "../services/feed.service";
import { FeedQuery } from "../queries/feed.query";

export class FeedController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = feedSchemas.listQuery.parse(req.query);
    const result = await FeedQuery.listAll(filters);
    res
      .status(200)
      .json(ApiResponse.success("Feed fetched", result.data, result.meta));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = feedSchemas.idParam.parse(req.params);
    const feed = await FeedQuery.getById(id);
    res.status(200).json(ApiResponse.success("Feed item fetched", feed));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = feedSchemas.create.parse(req.body);
    const feed = await FeedService.create(data);
    res.status(201).json(ApiResponse.success("Feed item created", feed));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = feedSchemas.idParam.parse(req.params);
    const data = feedSchemas.update.parse(req.body);
    const feed = await FeedService.update(id, data);
    res.status(200).json(ApiResponse.success("Feed item updated", feed));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = feedSchemas.idParam.parse(req.params);
    const feed = await FeedService.deactivate(id);
    res.status(200).json(ApiResponse.success("Feed item deactivated", feed));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = feedSchemas.idParam.parse(req.params);
    const feed = await FeedService.activate(id);
    res.status(200).json(ApiResponse.success("Feed item activated", feed));
  }
}
