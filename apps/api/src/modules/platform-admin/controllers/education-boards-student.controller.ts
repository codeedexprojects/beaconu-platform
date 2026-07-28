import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { educationBoardSchemas } from "../validators/education-boards.validator";
import { EducationBoardsService } from "../services/education-boards.service";

export class EducationBoardsStudentController {
  static async listNames(req: Request, res: Response): Promise<void> {
    const { grade, search } = educationBoardSchemas.listNamesQuery.parse(
      req.query,
    );
    const boards = await EducationBoardsService.listNamesForStudent(
      grade,
      search,
    );
    res
      .status(200)
      .json(ApiResponse.success("Education boards fetched", boards));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = educationBoardSchemas.idParam.parse(req.params);
    const board = await EducationBoardsService.getActiveById(id);
    res.status(200).json(ApiResponse.success("Education board fetched", board));
  }
}
