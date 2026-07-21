import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { MediaKitQuery } from "../queries/media-kit.query";
import { mediaKitAmbassadorListQuerySchema } from "../validators/media-kit.validator";

export class AmbassadorMediaKitController {
  static async list(req: Request, res: Response) {
    const filters = mediaKitAmbassadorListQuerySchema.parse(req.query);
    const result = await MediaKitQuery.listByCollege(req.collegeId!, filters);
    return res.json(
      ApiResponse.success("Media kit fetched", {
        items: result.items,
        meta: result.meta,
      }),
    );
  }
}
