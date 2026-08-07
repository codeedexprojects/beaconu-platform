import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { FeeStructureService } from "../services/fee-structure.service";
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  feeStructureParamSchema,
  courseIdOnlyParamSchema,
} from "../validators/fee-structure.validator";

export class FeeStructuresController {
  static async listFeeStructures(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = courseIdOnlyParamSchema.parse(req.params);
    const rows = await FeeStructureService.listForCourse(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Fee structures fetched", rows));
  }

  static async createFeeStructure(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = courseIdOnlyParamSchema.parse(req.params);
    const body = createFeeStructureSchema.parse(req.body);
    const row = await FeeStructureService.create(id, collegeId, body);
    return res
      .status(201)
      .json(ApiResponse.success("Fee structure created", row));
  }

  static async updateFeeStructure(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id, feeStructureId } = feeStructureParamSchema.parse(req.params);
    const body = updateFeeStructureSchema.parse(req.body);
    const row = await FeeStructureService.update(
      id,
      collegeId,
      feeStructureId,
      body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Fee structure updated", row));
  }

  static async deleteFeeStructure(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id, feeStructureId } = feeStructureParamSchema.parse(req.params);
    await FeeStructureService.remove(id, collegeId, feeStructureId);
    return res
      .status(200)
      .json(ApiResponse.success("Fee structure removed", null));
  }
}
