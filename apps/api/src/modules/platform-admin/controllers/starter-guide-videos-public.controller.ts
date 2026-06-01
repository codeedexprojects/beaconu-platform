import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { starterGuideVideoSchemas } from "../validators/starter-guide-videos.validator";
import { StarterGuideVideoQuery } from "../queries/starter-guide-videos.query";

export class StarterGuideVideosPublicController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = starterGuideVideoSchemas.listQuery.parse(req.query);
    const result = await StarterGuideVideoQuery.listActive(filters);
    res
      .status(200)
      .json(
        ApiResponse.success(
          "Starter guide videos fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideVideoSchemas.idParam.parse(req.params);
    const video = await StarterGuideVideoQuery.getActiveById(id);
    res
      .status(200)
      .json(ApiResponse.success("Starter guide video fetched", video));
  }
}
