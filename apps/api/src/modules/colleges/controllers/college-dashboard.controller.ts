import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { CollegeDashboardRepository } from "../repositories/college-dashboard.repository";

export class CollegeDashboardController {
  static async listColleges(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await CollegeDashboardRepository.listColleges({
        search,
        status,
        page,
        limit,
      });

      return res
        .status(200)
        .json(ApiResponse.success("Colleges fetched", result));
    } catch (error) {
      next(error);
    }
  }

  static async getCollegeDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const college = await CollegeDashboardRepository.getCollegeDetail(id);
      if (!college) throw new NotFoundError("College not found");
      return res
        .status(200)
        .json(ApiResponse.success("College detail fetched", college));
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await CollegeDashboardRepository.getCollegeStats();
      return res
        .status(200)
        .json(ApiResponse.success("College stats fetched", stats));
    } catch (error) {
      next(error);
    }
  }
}
