import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { universityTypeSchemas } from "../validators/university-types.validator";
import { universitySchemas } from "../validators/universities.validator";
import { UniversityTypeService } from "../services/university-types.service";
import { UniversityService } from "../services/universities.service";
import { UniversityQuery } from "../queries/universities.query";

export class UniversityPlatformAdminController {
  // ── University types ──────────────────────────────────────────────────────

  static async listAllTypes(req: Request, res: Response): Promise<void> {
    const query = universityTypeSchemas.listQuery.parse(req.query);
    const types = await UniversityTypeService.listAll(query);
    res
      .status(200)
      .json(ApiResponse.success("University types fetched", types));
  }

  static async getTypeById(req: Request, res: Response): Promise<void> {
    const { id } = universityTypeSchemas.idParam.parse(req.params);
    const type = await UniversityTypeService.getById(id);
    res.status(200).json(ApiResponse.success("University type fetched", type));
  }

  static async createType(req: Request, res: Response): Promise<void> {
    const data = universityTypeSchemas.create.parse(req.body);
    const type = await UniversityTypeService.create(data);
    res.status(201).json(ApiResponse.success("University type created", type));
  }

  static async updateType(req: Request, res: Response): Promise<void> {
    const { id } = universityTypeSchemas.idParam.parse(req.params);
    const data = universityTypeSchemas.update.parse(req.body);
    const type = await UniversityTypeService.update(id, data);
    res.status(200).json(ApiResponse.success("University type updated", type));
  }

  static async disableType(req: Request, res: Response): Promise<void> {
    const { id } = universityTypeSchemas.idParam.parse(req.params);
    const type = await UniversityTypeService.disable(id);
    res.status(200).json(ApiResponse.success("University type disabled", type));
  }

  static async deleteType(req: Request, res: Response): Promise<void> {
    const { id } = universityTypeSchemas.idParam.parse(req.params);
    await UniversityTypeService.delete(id);
    res.status(200).json(ApiResponse.success("University type deleted", null));
  }

  // ── Universities ──────────────────────────────────────────────────────────

  static async listAll(req: Request, res: Response): Promise<void> {
    const query = universitySchemas.listQuery.parse(req.query);
    const universities = await UniversityQuery.listAll(query);
    res
      .status(200)
      .json(ApiResponse.success("Universities fetched", universities));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const university = await UniversityQuery.getById(id);
    res.status(200).json(ApiResponse.success("University fetched", university));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = universitySchemas.create.parse(req.body);
    const university = await UniversityService.create(data);
    res.status(201).json(ApiResponse.success("University created", university));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const data = universitySchemas.update.parse(req.body);
    const university = await UniversityService.update(id, data);
    res.status(200).json(ApiResponse.success("University updated", university));
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const university = await UniversityService.archive(id);
    res
      .status(200)
      .json(ApiResponse.success("University archived", university));
  }
}
