import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { educationLoanSchemas } from "../validators/financial-aid-loans.validator";
import { EducationLoanQuery } from "../queries/financial-aid-loans.query";

export class EducationLoansPublicController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = educationLoanSchemas.listQuery.parse(req.query);
    const result = await EducationLoanQuery.listActive(filters);
    res
      .status(200)
      .json(
        ApiResponse.success(
          "Education loans fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = educationLoanSchemas.idParam.parse(req.params);
    const loan = await EducationLoanQuery.getActiveById(id);
    res.status(200).json(ApiResponse.success("Education loan fetched", loan));
  }
}
