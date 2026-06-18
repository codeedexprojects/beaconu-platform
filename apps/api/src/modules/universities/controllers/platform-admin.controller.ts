import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { universityTypeSchemas } from "../validators/university-types.validator";
import { universitySchemas } from "../validators/universities.validator";
import { academicTaxonomySchemas } from "../validators/academic-taxonomy.validator";
import { UniversityTypeService } from "../services/university-types.service";
import { UniversityService } from "../services/universities.service";
import { AcademicTaxonomyService } from "../services/academic-taxonomy.service";
import { UniversityQuery } from "../queries/universities.query";

export class UniversityPlatformAdminController {
  // ── Academic taxonomy ────────────────────────────────────────────────────

  static async listStreams(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.adminListQuery.parse(req.query);
    const streams = await AcademicTaxonomyService.listStreams(query);
    res.status(200).json(ApiResponse.success("Streams fetched", streams));
  }

  static async createStream(req: Request, res: Response): Promise<void> {
    const data = academicTaxonomySchemas.createStream.parse(req.body);
    const stream = await AcademicTaxonomyService.createStream(data);
    res.status(201).json(ApiResponse.success("Stream created", stream));
  }

  static async updateStream(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const data = academicTaxonomySchemas.updateStream.parse(req.body);
    const stream = await AcademicTaxonomyService.updateStream(id, data);
    res.status(200).json(ApiResponse.success("Stream updated", stream));
  }

  static async disableStream(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const stream = await AcademicTaxonomyService.disableStream(id);
    res.status(200).json(ApiResponse.success("Stream disabled", stream));
  }

  static async deleteStream(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    await AcademicTaxonomyService.removeStream(id);
    res.status(200).json(ApiResponse.success("Stream deleted", null));
  }

  static async listDisciplines(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.adminListQuery.parse(req.query);
    const disciplines = await AcademicTaxonomyService.listDisciplines(query);
    res
      .status(200)
      .json(ApiResponse.success("Disciplines fetched", disciplines));
  }

  static async createDiscipline(req: Request, res: Response): Promise<void> {
    const data = academicTaxonomySchemas.createDiscipline.parse(req.body);
    const discipline = await AcademicTaxonomyService.createDiscipline(data);
    res.status(201).json(ApiResponse.success("Discipline created", discipline));
  }

  static async updateDiscipline(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const data = academicTaxonomySchemas.updateDiscipline.parse(req.body);
    const discipline = await AcademicTaxonomyService.updateDiscipline(id, data);
    res.status(200).json(ApiResponse.success("Discipline updated", discipline));
  }

  static async disableDiscipline(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const discipline = await AcademicTaxonomyService.disableDiscipline(id);
    res
      .status(200)
      .json(ApiResponse.success("Discipline disabled", discipline));
  }

  static async deleteDiscipline(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    await AcademicTaxonomyService.removeDiscipline(id);
    res.status(200).json(ApiResponse.success("Discipline deleted", null));
  }

  static async listStudyLevels(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.adminListQuery.parse(req.query);
    const levels = await AcademicTaxonomyService.listStudyLevels(query);
    res.status(200).json(ApiResponse.success("Study levels fetched", levels));
  }

  static async createStudyLevel(req: Request, res: Response): Promise<void> {
    const data = academicTaxonomySchemas.createStudyLevel.parse(req.body);
    const level = await AcademicTaxonomyService.createStudyLevel(data);
    res.status(201).json(ApiResponse.success("Study level created", level));
  }

  static async updateStudyLevel(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const data = academicTaxonomySchemas.updateStudyLevel.parse(req.body);
    const level = await AcademicTaxonomyService.updateStudyLevel(id, data);
    res.status(200).json(ApiResponse.success("Study level updated", level));
  }

  static async disableStudyLevel(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const level = await AcademicTaxonomyService.disableStudyLevel(id);
    res.status(200).json(ApiResponse.success("Study level disabled", level));
  }

  static async deleteStudyLevel(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    await AcademicTaxonomyService.removeStudyLevel(id);
    res.status(200).json(ApiResponse.success("Study level deleted", null));
  }

  static async listProgramTypes(req: Request, res: Response): Promise<void> {
    const query = academicTaxonomySchemas.adminListQuery.parse(req.query);
    const types = await AcademicTaxonomyService.listProgramTypes(query);
    res.status(200).json(ApiResponse.success("Program types fetched", types));
  }

  static async createProgramType(req: Request, res: Response): Promise<void> {
    const data = academicTaxonomySchemas.createProgramType.parse(req.body);
    const type = await AcademicTaxonomyService.createProgramType(data);
    res.status(201).json(ApiResponse.success("Program type created", type));
  }

  static async updateProgramType(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const data = academicTaxonomySchemas.updateProgramType.parse(req.body);
    const type = await AcademicTaxonomyService.updateProgramType(id, data);
    res.status(200).json(ApiResponse.success("Program type updated", type));
  }

  static async disableProgramType(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    const type = await AcademicTaxonomyService.disableProgramType(id);
    res.status(200).json(ApiResponse.success("Program type disabled", type));
  }

  static async deleteProgramType(req: Request, res: Response): Promise<void> {
    const { id } = academicTaxonomySchemas.idParam.parse(req.params);
    await AcademicTaxonomyService.removeProgramType(id);
    res.status(200).json(ApiResponse.success("Program type deleted", null));
  }

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
    const result = await UniversityQuery.listAll(query);
    const universities = Array.isArray(result)
      ? result
      : result
        ? [result]
        : [];
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

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const university = await UniversityService.activate(id);
    res
      .status(200)
      .json(ApiResponse.success("University activated", university));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = universitySchemas.idParam.parse(req.params);
    const university = await UniversityService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("University deactivated", university));
  }
}
