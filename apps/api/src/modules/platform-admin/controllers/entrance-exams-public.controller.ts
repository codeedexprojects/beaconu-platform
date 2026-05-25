import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { entranceExamSchemas } from "../validators/entrance-exams.validator";
import { EntranceExamQuery } from "../queries/entrance-exams.query";

export class EntranceExamsPublicController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = entranceExamSchemas.listQuery.parse(req.query);
    const result = await EntranceExamQuery.listActive(filters);
    res
      .status(200)
      .json(
        ApiResponse.success("Entrance exams fetched", result.data, result.meta),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = entranceExamSchemas.idParam.parse(req.params);
    const exam = await EntranceExamQuery.getById(id);
    res.status(200).json(ApiResponse.success("Entrance exam fetched", exam));
  }
}
