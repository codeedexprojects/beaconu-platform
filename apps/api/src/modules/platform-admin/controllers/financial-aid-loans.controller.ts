import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { educationLoanSchemas } from "../validators/financial-aid-loans.validator";
import { EducationLoansService } from "../services/financial-aid-loans.service";
import { EducationLoanQuery } from "../queries/financial-aid-loans.query";

export class EducationLoansController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = educationLoanSchemas.listQuery.parse(req.query);
    const result = await EducationLoanQuery.listAll(filters);
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
    const loan = await EducationLoanQuery.getById(id);
    res.status(200).json(ApiResponse.success("Education loan fetched", loan));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = educationLoanSchemas.create.parse(req.body);
    const loan = await EducationLoansService.create(data);
    res.status(201).json(ApiResponse.success("Education loan created", loan));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = educationLoanSchemas.idParam.parse(req.params);
    const data = educationLoanSchemas.update.parse(req.body);
    const loan = await EducationLoansService.update(id, data);
    res.status(200).json(ApiResponse.success("Education loan updated", loan));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = educationLoanSchemas.idParam.parse(req.params);
    const loan = await EducationLoansService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("Education loan deactivated", loan));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = educationLoanSchemas.idParam.parse(req.params);
    const loan = await EducationLoansService.activate(id);
    res.status(200).json(ApiResponse.success("Education loan activated", loan));
  }
}
