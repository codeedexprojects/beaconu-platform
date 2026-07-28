import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { educationBoardSchemas } from "../validators/education-boards.validator";
import { EducationBoardsService } from "../services/education-boards.service";

export class EducationBoardsController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = educationBoardSchemas.listQuery.parse(req.query);
    const result = await EducationBoardsService.listAll(filters);
    res
      .status(200)
      .json(
        ApiResponse.success(
          "Education boards fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = educationBoardSchemas.idParam.parse(req.params);
    const board = await EducationBoardsService.getById(id);
    res.status(200).json(ApiResponse.success("Education board fetched", board));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = educationBoardSchemas.create.parse(req.body);
    const board = await EducationBoardsService.create(data);
    res.status(201).json(ApiResponse.success("Education board created", board));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = educationBoardSchemas.idParam.parse(req.params);
    const data = educationBoardSchemas.update.parse(req.body);
    const board = await EducationBoardsService.update(id, data);
    res.status(200).json(ApiResponse.success("Education board updated", board));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = educationBoardSchemas.idParam.parse(req.params);
    const board = await EducationBoardsService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("Education board deactivated", board));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = educationBoardSchemas.idParam.parse(req.params);
    const board = await EducationBoardsService.activate(id);
    res
      .status(200)
      .json(ApiResponse.success("Education board activated", board));
  }
}
