import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { starterGuideSchemas } from "../validators/starter-guide.validator";
import { StarterGuideService } from "../services/starter-guide.service";
import { StarterGuideQuery } from "../queries/starter-guide.query";

export class StarterGuideController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = starterGuideSchemas.listQuery.parse(req.query);
    const result = await StarterGuideQuery.listAll(filters);
    res
      .status(200)
      .json(
        ApiResponse.success("Starter guides fetched", result.data, result.meta),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideSchemas.idParam.parse(req.params);
    const guide = await StarterGuideQuery.getById(id);
    res.status(200).json(ApiResponse.success("Starter guide fetched", guide));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = starterGuideSchemas.create.parse(req.body);
    const guide = await StarterGuideService.create(data);
    res.status(201).json(ApiResponse.success("Starter guide created", guide));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideSchemas.idParam.parse(req.params);
    const data = starterGuideSchemas.update.parse(req.body);
    const guide = await StarterGuideService.update(id, data);
    res.status(200).json(ApiResponse.success("Starter guide updated", guide));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideSchemas.idParam.parse(req.params);
    const guide = await StarterGuideService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("Starter guide deactivated", guide));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideSchemas.idParam.parse(req.params);
    const guide = await StarterGuideService.activate(id);
    res.status(200).json(ApiResponse.success("Starter guide activated", guide));
  }
}
