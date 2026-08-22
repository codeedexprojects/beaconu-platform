import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { starterGuideSchemas } from "../validators/starter-guide.validator";
import { StarterGuideQuery } from "../queries/starter-guide.query";

export class StarterGuidePublicController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = starterGuideSchemas.listQuery.parse(req.query);
    const result = await StarterGuideQuery.listActive(filters);
    res
      .status(200)
      .json(
        ApiResponse.success("Starter guides fetched", result.data, result.meta),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideSchemas.idParam.parse(req.params);
    const guide = await StarterGuideQuery.getActiveById(id);
    res.status(200).json(ApiResponse.success("Starter guide fetched", guide));
  }
}
