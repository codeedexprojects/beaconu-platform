import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { universitySchemas } from "../validators/universities.validator";
import { academicTaxonomySchemas } from "../validators/academic-taxonomy.validator";
import { UniversityQuery } from "../queries/universities.query";
import { AcademicTaxonomyQuery } from "../queries/academic-taxonomy.query";

export class UniversityPublicController {
  static async listTypes(_req: Request, res: Response): Promise<void> {
    const result = await UniversityQuery.getFilters();
    res
      .status(200)
      .json(ApiResponse.success("University filters fetched", result));
  }

  static async listStreams(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.publicListQuery.parse(req.query);
    const result = await AcademicTaxonomyQuery.listStreams(query);
    res.status(200).json(ApiResponse.success("Streams fetched", result));
  }

  static async listDisciplines(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.publicListQuery.parse(req.query);
    const result = await AcademicTaxonomyQuery.listDisciplines(query);
    res.status(200).json(ApiResponse.success("Disciplines fetched", result));
  }

  static async listStudyLevels(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.publicListQuery.parse(req.query);
    const result = await AcademicTaxonomyQuery.listStudyLevels(query);
    res.status(200).json(ApiResponse.success("Study levels fetched", result));
  }

  static async listProgramTypes(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.publicListQuery.parse(req.query);
    const result = await AcademicTaxonomyQuery.listProgramTypes(query);
    res.status(200).json(ApiResponse.success("Program types fetched", result));
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
    res
      .status(200)
      .json(ApiResponse.success("University fetched", [university]));
  }
}
