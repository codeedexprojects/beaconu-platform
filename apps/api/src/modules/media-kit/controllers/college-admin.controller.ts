import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { MediaKitQuery } from "../queries/media-kit.query";
import { MediaKitService } from "../services/media-kit.service";
import {
  createMediaKitSchema,
  updateMediaKitSchema,
  mediaKitCollegeAdminListQuerySchema,
} from "../validators/media-kit.validator";

export class CollegeAdminMediaKitController {
  static async create(req: Request, res: Response) {
    const data = createMediaKitSchema.parse(req.body);
    const mediaKit = await MediaKitService.create(req.collegeId!, data);
    return res
      .status(201)
      .json(ApiResponse.success("Media kit item created", mediaKit));
  }

  static async list(req: Request, res: Response) {
    const filters = mediaKitCollegeAdminListQuerySchema.parse(req.query);
    const result = await MediaKitQuery.listByCollege(req.collegeId!, filters);
    return res.json(
      ApiResponse.success("Media kit fetched", {
        items: result.items,
        meta: result.meta,
      }),
    );
  }

  static async update(req: Request, res: Response) {
    const data = updateMediaKitSchema.parse(req.body);
    const mediaKit = await MediaKitService.update(
      req.params.id as string,
      req.collegeId!,
      data,
    );
    return res.json(ApiResponse.success("Media kit item updated", mediaKit));
  }

  static async remove(req: Request, res: Response) {
    await MediaKitService.remove(req.params.id as string, req.collegeId!);
    return res.json(ApiResponse.success("Media kit item removed", null));
  }
}
