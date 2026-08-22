import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { instituteOfNationalImportanceSchemas } from "../validators/institutes-of-national-importance.validator";
import { InstitutesOfNationalImportanceService } from "../services/institutes-of-national-importance.service";

export class InstitutesOfNationalImportanceController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = instituteOfNationalImportanceSchemas.listQuery.parse(
      req.query,
    );
    const result = await InstitutesOfNationalImportanceService.listAll(filters);
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

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = instituteOfNationalImportanceSchemas.idParam.parse(
      req.params,
    );
    const row = await InstitutesOfNationalImportanceService.getById(id);
    res.status(200).json(ApiResponse.success("Institute fetched", row));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = instituteOfNationalImportanceSchemas.create.parse(req.body);
    const row = await InstitutesOfNationalImportanceService.create(data);
    res.status(201).json(ApiResponse.success("Institute created", row));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = instituteOfNationalImportanceSchemas.idParam.parse(
      req.params,
    );
    const data = instituteOfNationalImportanceSchemas.update.parse(req.body);
    const row = await InstitutesOfNationalImportanceService.update(id, data);
    res.status(200).json(ApiResponse.success("Institute updated", row));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = instituteOfNationalImportanceSchemas.idParam.parse(
      req.params,
    );
    const row = await InstitutesOfNationalImportanceService.deactivate(id);
    res.status(200).json(ApiResponse.success("Institute deactivated", row));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = instituteOfNationalImportanceSchemas.idParam.parse(
      req.params,
    );
    const row = await InstitutesOfNationalImportanceService.activate(id);
    res.status(200).json(ApiResponse.success("Institute activated", row));
  }
}
