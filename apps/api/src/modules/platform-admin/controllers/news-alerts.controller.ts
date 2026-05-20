import { Request, Response, NextFunction } from "express";
import { NewsAlertsService } from "../services/news-alerts.service";
import { ApiResponse } from "@/shared/responses/api-response";

export class NewsAlertsController {
  static async listAll(req: Request, res: Response) {
    const newsAlerts = await NewsAlertsService.listAll();
    res.status(200).json(ApiResponse.success("News alerts", newsAlerts));
  }
}
