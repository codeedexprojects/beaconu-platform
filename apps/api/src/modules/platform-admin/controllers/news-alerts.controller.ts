import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { newsAlertSchemas } from "../validators/news-alerts.validator";
import { NewsAlertsService } from "../services/news-alerts.service";
import { NewsAlertQuery } from "../queries/news-alerts.query";

export class NewsAlertsController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = newsAlertSchemas.listQuery.parse(req.query);
    const result = await NewsAlertQuery.listAll(filters);
    res
      .status(200)
      .json(ApiResponse.success("News alerts fetched", result.data, result.meta));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = newsAlertSchemas.idParam.parse(req.params);
    const newsAlert = await NewsAlertQuery.getById(id);
    res.status(200).json(ApiResponse.success("News alert fetched", newsAlert));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = newsAlertSchemas.create.parse(req.body);
    const newsAlert = await NewsAlertsService.create(data);
    res.status(201).json(ApiResponse.success("News alert created", newsAlert));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = newsAlertSchemas.idParam.parse(req.params);
    const data = newsAlertSchemas.update.parse(req.body);
    const newsAlert = await NewsAlertsService.update(id, data);
    res.status(200).json(ApiResponse.success("News alert updated", newsAlert));
  }

  static async publish(req: Request, res: Response): Promise<void> {
    const { id } = newsAlertSchemas.idParam.parse(req.params);
    const newsAlert = await NewsAlertsService.publish(id, req.userId!);
    res.status(200).json(ApiResponse.success("News alert published", newsAlert));
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const { id } = newsAlertSchemas.idParam.parse(req.params);
    const newsAlert = await NewsAlertsService.archive(id);
    res.status(200).json(ApiResponse.success("News alert archived", newsAlert));
  }
}
