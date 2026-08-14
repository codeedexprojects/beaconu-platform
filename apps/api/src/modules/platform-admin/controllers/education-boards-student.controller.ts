import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { educationBoardSchemas } from "../validators/education-boards.validator";
import { EducationBoardsService } from "../services/education-boards.service";

export class EducationBoardsStudentController {
  static async listNames(req: Request, res: Response): Promise<void> {
    const { grade, search, page, limit } =
      educationBoardSchemas.listNamesQuery.parse(req.query);
    const result = await EducationBoardsService.listNamesForStudent(
      grade,
      search,
      page,
      limit,
    );
    res
      .status(200)
      .json(
        ApiResponse.success(
          "Education boards fetched",
          result.boards,
          result.meta,
        ),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = educationBoardSchemas.idParam.parse(req.params);
    const { course } = educationBoardSchemas.detailQuery.parse(req.query);
    const board = await EducationBoardsService.getActiveById(id, course);
    res.status(200).json(ApiResponse.success("Education board fetched", board));
  }
}
