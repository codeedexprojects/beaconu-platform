import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { MediaKitQuery } from "../queries/media-kit.query";
import { mediaKitAssociateListQuerySchema } from "../validators/media-kit.validator";

export class AssociateMediaKitController {
  static async list(req: Request, res: Response) {
    const filters = mediaKitAssociateListQuerySchema.parse(req.query);
    const result = await MediaKitQuery.listAcrossColleges(filters);
    return res.json(
      ApiResponse.success("Media kit fetched", {
        items: result.items,
        meta: result.meta,
      }),
    );
  }
}
