import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AdmissionCycleService } from "../services/admission-cycle.service";
import { AdmissionCycleQuery } from "../queries/admission-cycle.query";
import { AdmissionCycleCourseService } from "../services/admission-cycle-course.service";
import { SeatMatrixService } from "../services/seat-matrix.service";
import {
  createAdmissionCycleSchema,
  updateAdmissionCycleSchema,
  admissionCycleListQuerySchema,
} from "../validators/admission-cycle.validator";
import {
  attachAdmissionCycleCourseSchema,
  updateAdmissionCycleCourseSchema,
} from "../validators/admission-cycle-course.validator";
import {
  createSeatPoolSchema,
  updateSeatPoolSchema,
} from "../validators/seat-matrix.validator";

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

  // ── Courses attached to this application form ─────────────────────────────

  static async listCourses(req: Request, res: Response) {
    const result = await AdmissionCycleCourseService.listCourses(
      req.params.id as string,
      req.collegeId!,
    );
    return res.json(
      ApiResponse.success("Application form courses fetched", result),
    );
  }

  static async attachCourse(req: Request, res: Response) {
    const data = attachAdmissionCycleCourseSchema.parse(req.body);
    const result = await AdmissionCycleCourseService.attachCourse(
      req.params.id as string,
      req.collegeId!,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Course attached to application form", result));
  }

  static async updateCourse(req: Request, res: Response) {
    const data = updateAdmissionCycleCourseSchema.parse(req.body);
    const result = await AdmissionCycleCourseService.updateCourse(
      req.params.id as string,
      req.collegeId!,
      req.params.courseId as string,
      data,
    );
    return res.json(
      ApiResponse.success("Application form course updated", result),
    );
  }

  static async detachCourse(req: Request, res: Response) {
    const result = await AdmissionCycleCourseService.detachCourse(
      req.params.id as string,
      req.collegeId!,
      req.params.courseId as string,
    );
    return res.json(
      ApiResponse.success("Course detached from application form", result),
    );
  }

  // ── Seat pools for this application form ───────────────────────────────────

  static async listSeatPools(req: Request, res: Response) {
    const result = await SeatMatrixService.listPools(
      req.params.id as string,
      req.collegeId!,
    );
    return res.json(ApiResponse.success("Seat pools fetched", result));
  }

  static async createSeatPool(req: Request, res: Response) {
    const data = createSeatPoolSchema.parse(req.body);
    const result = await SeatMatrixService.createPool(
      req.params.id as string,
      req.collegeId!,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Seat pool created", result));
  }

  static async updateSeatPool(req: Request, res: Response) {
    const data = updateSeatPoolSchema.parse(req.body);
    const result = await SeatMatrixService.updatePool(
      req.params.id as string,
      req.collegeId!,
      req.params.poolId as string,
      data,
    );
    return res.json(ApiResponse.success("Seat pool updated", result));
  }

  static async deleteSeatPool(req: Request, res: Response) {
    const result = await SeatMatrixService.deletePool(
      req.params.id as string,
      req.collegeId!,
      req.params.poolId as string,
    );
    return res.json(ApiResponse.success("Seat pool removed", result));
  }
}
