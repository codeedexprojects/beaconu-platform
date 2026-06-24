import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { universitySchemas } from "../validators/universities.validator";
import { academicTaxonomySchemas } from "../validators/academic-taxonomy.validator";
import { UniversityQuery } from "../queries/universities.query";
import { AcademicTaxonomyQuery } from "../queries/academic-taxonomy.query";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function normalizeOverviewStreams(metadata: unknown): Record<string, unknown> {
  if (!isRecord(metadata)) return {};
  const next = { ...metadata };
  if (!isRecord(next.overview)) return next;

  const overview = { ...next.overview };
  if (!Array.isArray(overview.streams) && Array.isArray(overview.discipline)) {
    overview.streams = overview.discipline;
  }
  if ("discipline" in overview) {
    delete overview.discipline;
  }

  next.overview = overview;
  return next;
}

function normalizeUniversityResponse<T extends { metadata?: unknown }>(
  university: T,
): T {
  return {
    ...university,
    metadata: normalizeOverviewStreams(university.metadata),
  };
}

export class UniversityPublicController {
  static async listTypes(_req: Request, res: Response): Promise<void> {
    const result = await UniversityQuery.getFilters();
    res
      .status(200)
      .json(ApiResponse.success("University filters fetched", result));
  }

  static async listStreams(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.publicListQuery.parse(req.query);
    const result = await AcademicTaxonomyQuery.listStreamsForPublic(query);
    res
      .status(200)
      .json(ApiResponse.success("Streams fetched", result.data, result.meta));
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
    const normalized = universities.map(normalizeUniversityResponse);
    res
      .status(200)
      .json(ApiResponse.success("Universities fetched", normalized));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const university = await UniversityQuery.getActiveById(id);
    res
      .status(200)
      .json(
        ApiResponse.success(
          "University fetched",
          normalizeUniversityResponse(university),
        ),
      );
  }
}
