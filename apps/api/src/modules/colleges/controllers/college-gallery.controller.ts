import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CollegeGalleryService } from "../services/college-gallery.service";
import {
  createGalleryItemSchema,
  reorderGallerySchema,
} from "../validators/college-gallery.validator";

export class CollegeGalleryController {
  static async list(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeGalleryService.list(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Gallery items fetched", result));
  }

  static async create(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const body = createGalleryItemSchema.parse(req.body);
    const result = await CollegeGalleryService.create(collegeId, body);
    return res
      .status(201)
      .json(ApiResponse.success("Gallery item added", result));
  }

  static async remove(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await CollegeGalleryService.remove(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Gallery item removed", null));
  }

  static async reorder(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const body = reorderGallerySchema.parse(req.body);
    const result = await CollegeGalleryService.reorder(
      collegeId,
      body.orderedIds,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Gallery order updated", result));
  }
}
