import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { newsAlertSchemas } from "../validators/news-alerts.validator";
import { NewsAlertQuery } from "../queries/news-alerts.query";

export class NewsAlertsPublicController {
  static async listPublished(req: Request, res: Response): Promise<void> {
    const filters = newsAlertSchemas.publicListQuery.parse(req.query);
    const result = await NewsAlertQuery.listPublished(filters);
    res
      .status(200)
      .json(
        ApiResponse.success("News alerts fetched", result.data, result.meta),
      );
  }

  static async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = newsAlertSchemas.slugParam.parse(req.params);
    const newsAlert = await NewsAlertQuery.getPublishedBySlug(slug);
    res.status(200).json(ApiResponse.success("News alert fetched", newsAlert));
  }
}
