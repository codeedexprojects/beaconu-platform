import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { instituteOfNationalImportanceSchemas } from "../validators/institutes-of-national-importance.validator";
import { InstitutesOfNationalImportanceService } from "../services/institutes-of-national-importance.service";

export class InstitutesOfNationalImportanceStudentController {
  static async list(req: Request, res: Response): Promise<void> {
    const { search, page, limit } =
      instituteOfNationalImportanceSchemas.listQuery.parse(req.query);
    const result = await InstitutesOfNationalImportanceService.listForStudent({
      search,
      page,
      limit,
    });
    res
      .status(200)
      .json(
        ApiResponse.success(
          "Institutes of National Importance fetched",
          result.data,
          result.meta,
        ),
      );
  }
}
