import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { universityTypeSchemas } from "../validators/university-types.validator";
import { UniversityTypePlatformAdminService } from "../services/university-types.service";

export class UniversityTypePlatformAdminController {
  static async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = universityTypeSchemas.listQuery.parse(req.query);
      const types = await UniversityTypePlatformAdminService.listAll(query);
      return res
        .status(200)
        .json(
          ApiResponse.success("University types fetched successfully", types),
        );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = universityTypeSchemas.idParam.parse(req.params);
      const type = await UniversityTypePlatformAdminService.getById(params.id);
      return res
        .status(200)
        .json(
          ApiResponse.success("University type fetched successfully", type),
        );
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = universityTypeSchemas.create.parse(req.body);
      const type = await UniversityTypePlatformAdminService.create(data);
      return res
        .status(201)
        .json(
          ApiResponse.success("University type created successfully", type),
        );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = universityTypeSchemas.idParam.parse(req.params);
      const data = universityTypeSchemas.update.parse(req.body);
      const type = await UniversityTypePlatformAdminService.update(
        params.id,
        data,
      );
      return res
        .status(200)
        .json(
          ApiResponse.success("University type updated successfully", type),
        );
    } catch (error) {
      next(error);
    }
  }

  static async disable(req: Request, res: Response, next: NextFunction) {
    try {
      const params = universityTypeSchemas.idParam.parse(req.params);
      const type = await UniversityTypePlatformAdminService.disable(params.id);
      return res
        .status(200)
        .json(
          ApiResponse.success("University type disabled successfully", type),
        );
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const params = universityTypeSchemas.idParam.parse(req.params);
      await UniversityTypePlatformAdminService.delete(params.id);
      return res
        .status(200)
        .json(
          ApiResponse.success("University type deleted successfully", null),
        );
    } catch (error) {
      next(error);
    }
  }
}
