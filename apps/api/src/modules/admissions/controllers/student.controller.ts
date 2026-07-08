import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AdmissionCycleQuery } from "../queries/admission-cycle.query";
import { studentAdmissionCycleListQuerySchema } from "../validators/admission-cycle.validator";

export class StudentAdmissionCycleController {
  static async list(req: Request, res: Response) {
    const filters = studentAdmissionCycleListQuerySchema.parse(req.query);
    const result = await AdmissionCycleQuery.listForStudent(filters);
    return res.json(ApiResponse.success("Application forms fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await AdmissionCycleQuery.getByIdForStudent(
      req.params.id as string,
    );
    if (!result) throw new NotFoundError("Application form not found");
    return res.json(ApiResponse.success("Application form fetched", result));
  }
}
