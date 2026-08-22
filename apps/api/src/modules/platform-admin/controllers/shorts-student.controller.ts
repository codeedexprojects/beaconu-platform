import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { shortSchemas } from "../validators/shorts.validator";
import { ShortsQuery } from "../queries/shorts.query";

export class ShortsStudentController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = shortSchemas.listQuery.parse(req.query);
    const result = await ShortsQuery.listActive(filters);
    res
      .status(200)
      .json(ApiResponse.success("Shorts fetched", result.data, result.meta));
  }
}
