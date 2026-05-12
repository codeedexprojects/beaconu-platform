import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { universitySchemas } from "../validators/universities.validator";
import { UniversityQuery } from "../queries/universities.query";
import { UniversityTypeQuery } from "../queries/university-types.query";

export class UniversityPublicController {
  static async listTypes(_req: Request, res: Response): Promise<void> {
    const types = await UniversityTypeQuery.listActive();
    res
      .status(200)
      .json(ApiResponse.success("University types fetched", types));
  }

  static async listAll(req: Request, res: Response): Promise<void> {
    const query = universitySchemas.listQuery.parse(req.query);
    const universities = await UniversityQuery.listActive(query);
    res
      .status(200)
      .json(ApiResponse.success("Universities fetched", universities));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const university = await UniversityQuery.getActiveById(id);
    res.status(200).json(ApiResponse.success("University fetched", university));
  }
}
