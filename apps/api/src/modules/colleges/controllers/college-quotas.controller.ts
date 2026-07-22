import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { QuotaService } from "../services/quota.service";
import {
  createQuotaSchema,
  updateQuotaSchema,
  quotaIdParamSchema,
  listQuotasQuerySchema,
} from "../validators/quota.validator";

export class CollegeQuotasController {
  static async listQuotas(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const query = listQuotasQuerySchema.parse(req.query);
    const quotas = await QuotaService.listQuotas(collegeId, query);
    return res
      .status(200)
      .json(ApiResponse.success("College quotas fetched", quotas));
  }

  static async getQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = quotaIdParamSchema.parse(req.params);
    const quota = await QuotaService.getQuota(id, collegeId);
    return res.status(200).json(ApiResponse.success("Quota fetched", quota));
  }

  static async createQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const body = createQuotaSchema.parse(req.body);
    const quota = await QuotaService.createQuota(collegeId, body);
    return res.status(201).json(ApiResponse.success("Quota created", quota));
  }

  static async updateQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = quotaIdParamSchema.parse(req.params);
    const body = updateQuotaSchema.parse(req.body);
    const quota = await QuotaService.updateQuota(id, collegeId, body);
    return res.status(200).json(ApiResponse.success("Quota updated", quota));
  }

  static async deleteQuota(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = quotaIdParamSchema.parse(req.params);
    await QuotaService.deleteQuota(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Quota removed successfully", null));
  }

  static async getQuotaUsage(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const { id } = quotaIdParamSchema.parse(req.params);
    const usage = await QuotaService.getQuotaUsage(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Quota usage fetched", usage));
  }
}
