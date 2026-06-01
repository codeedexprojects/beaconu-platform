import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { generateUploadUrl } from "@/shared/lib/s3";
import { starterGuideVideoSchemas } from "../validators/starter-guide-videos.validator";
import { StarterGuideVideosService } from "../services/starter-guide-videos.service";
import { StarterGuideVideoQuery } from "../queries/starter-guide-videos.query";

export class StarterGuideVideosController {
  static async presignUpload(req: Request, res: Response): Promise<void> {
    const { mime_type } = starterGuideVideoSchemas.presignBody.parse(req.body);
    const ext = mime_type === "video/webm" ? "webm" : "mp4";
    const key = `starter-guide/videos/${randomUUID()}.${ext}`;
    const uploadUrl = await generateUploadUrl(key, mime_type, 300);
    res.status(200).json(
      ApiResponse.success("Upload URL generated", {
        uploadUrl,
        key,
        expiresIn: 300,
      }),
    );
  }

  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = starterGuideVideoSchemas.listQuery.parse(req.query);
    const result = await StarterGuideVideoQuery.listAll(filters);
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
    const video = await StarterGuideVideoQuery.getById(id);
    res
      .status(200)
      .json(ApiResponse.success("Starter guide video fetched", video));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = starterGuideVideoSchemas.create.parse(req.body);
    const video = await StarterGuideVideosService.create(data);
    res
      .status(201)
      .json(ApiResponse.success("Starter guide video created", video));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideVideoSchemas.idParam.parse(req.params);
    const data = starterGuideVideoSchemas.update.parse(req.body);
    const video = await StarterGuideVideosService.update(id, data);
    res
      .status(200)
      .json(ApiResponse.success("Starter guide video updated", video));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideVideoSchemas.idParam.parse(req.params);
    const video = await StarterGuideVideosService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("Starter guide video deactivated", video));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = starterGuideVideoSchemas.idParam.parse(req.params);
    const video = await StarterGuideVideosService.activate(id);
    res
      .status(200)
      .json(ApiResponse.success("Starter guide video activated", video));
  }
}
