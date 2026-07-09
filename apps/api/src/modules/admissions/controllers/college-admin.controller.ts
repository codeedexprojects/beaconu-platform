import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AdmissionCycleService } from "../services/admission-cycle.service";
import { AdmissionCycleQuery } from "../queries/admission-cycle.query";
import {
  createAdmissionCycleSchema,
  updateAdmissionCycleSchema,
  admissionCycleListQuerySchema,
} from "../validators/admission-cycle.validator";

export class CollegeAdminAdmissionCycleController {
  static async create(req: Request, res: Response) {
    const data = createAdmissionCycleSchema.parse(req.body);
    const result = await AdmissionCycleService.create(req.collegeId!, data);
    return res
      .status(201)
      .json(ApiResponse.success("Application form created", result));
  }

  static async list(req: Request, res: Response) {
    const filters = admissionCycleListQuerySchema.parse(req.query);
    const result = await AdmissionCycleQuery.listForCollegeAdmin(
      req.collegeId!,
      filters,
    );
    return res.json(ApiResponse.success("Application forms fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await AdmissionCycleQuery.getByIdForCollegeAdmin(
      req.params.id as string,
      req.collegeId!,
    );
    if (!result) throw new NotFoundError("Application form not found");
    return res.json(ApiResponse.success("Application form fetched", result));
  }

  static async update(req: Request, res: Response) {
    const data = updateAdmissionCycleSchema.parse(req.body);
    const result = await AdmissionCycleService.update(
      req.params.id as string,
      req.collegeId!,
      data,
    );
    return res.json(ApiResponse.success("Application form updated", result));
  }

  static async remove(req: Request, res: Response) {
    const result = await AdmissionCycleService.remove(
      req.params.id as string,
      req.collegeId!,
    );
    return res.json(ApiResponse.success("Application form deleted", result));
  }
}
