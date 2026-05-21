import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { entranceExamSchemas } from "../validators/entrance-exams.validator";
import { EntranceExamsService } from "../services/entrance-exams.service";
import { EntranceExamQuery } from "../queries/entrance-exams.query";

export class EntranceExamsController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = entranceExamSchemas.listQuery.parse(req.query);
    const result = await EntranceExamQuery.listAll(filters);
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

  static async create(req: Request, res: Response): Promise<void> {
    const data = entranceExamSchemas.create.parse(req.body);
    const exam = await EntranceExamsService.create(data, req.userId!);
    res.status(201).json(ApiResponse.success("Entrance exam created", exam));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = entranceExamSchemas.idParam.parse(req.params);
    const data = entranceExamSchemas.update.parse(req.body);
    const exam = await EntranceExamsService.update(id, data);
    res.status(200).json(ApiResponse.success("Entrance exam updated", exam));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = entranceExamSchemas.idParam.parse(req.params);
    const exam = await EntranceExamsService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("Entrance exam deactivated", exam));
  }
}
