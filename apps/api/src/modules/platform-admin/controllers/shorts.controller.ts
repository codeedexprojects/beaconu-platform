import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { shortSchemas } from "../validators/shorts.validator";
import { ShortsService } from "../services/shorts.service";
import { ShortsQuery } from "../queries/shorts.query";

export class ShortsController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = shortSchemas.listQuery.parse(req.query);
    const result = await ShortsQuery.listAll(filters);
    res
      .status(200)
      .json(ApiResponse.success("Shorts fetched", result.data, result.meta));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = shortSchemas.idParam.parse(req.params);
    const short = await ShortsQuery.getById(id);
    res.status(200).json(ApiResponse.success("Short fetched", short));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = shortSchemas.create.parse(req.body);
    const short = await ShortsService.create(data);
    res.status(201).json(ApiResponse.success("Short created", short));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = shortSchemas.idParam.parse(req.params);
    const data = shortSchemas.update.parse(req.body);
    const short = await ShortsService.update(id, data);
    res.status(200).json(ApiResponse.success("Short updated", short));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = shortSchemas.idParam.parse(req.params);
    const short = await ShortsService.deactivate(id);
    res.status(200).json(ApiResponse.success("Short deactivated", short));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = shortSchemas.idParam.parse(req.params);
    const short = await ShortsService.activate(id);
    res.status(200).json(ApiResponse.success("Short activated", short));
  }
}
