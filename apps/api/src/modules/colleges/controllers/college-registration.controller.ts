import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CollegeRegistrationService } from "../services/college-registration.service";
import {
  updateCollegeProfileSchema,
  setSubdomainSchema,
  createCampusSchema,
  updateCampusSchema,
  createCourseSchema,
  updateCourseSchema,
} from "../validators/college-registration.validator";
import { z } from "zod";

export class CollegeRegistrationController {
  // ── Profile ────────────────────────────────────────────────────────────────

  static async getProfile(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.getProfile(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("College profile fetched", result));
  }

  static async updateProfile(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = updateCollegeProfileSchema.parse(req.body);
    const result = await CollegeRegistrationService.updateProfile(
      collegeId,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("College profile updated", result));
  }

  static async checkSubdomain(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const slugParam = req.params.slug;
    const slug = (Array.isArray(slugParam) ? slugParam[0] : slugParam)
      .toLowerCase()
      .trim();
    const result = await CollegeRegistrationService.checkSubdomainAvailability(
      slug,
      collegeId,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Subdomain availability checked", result));
  }

  static async setSubdomain(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = setSubdomainSchema.parse(req.body);
    const result = await CollegeRegistrationService.setSubdomain(
      collegeId,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Subdomain updated successfully", result));
  }

  static async finalize(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.finalize(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("College portal is now live!", result));
  }

  // ── Campuses ───────────────────────────────────────────────────────────────

  static async listCampuses(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.listCampuses(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Campuses fetched", result));
  }

  static async addCampus(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = createCampusSchema.parse(req.body);
    const result = await CollegeRegistrationService.addCampus(collegeId, data);
    return res.status(201).json(ApiResponse.success("Campus added", result));
  }

  static async updateCampus(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const campusId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const data = updateCampusSchema.parse(req.body);
    const result = await CollegeRegistrationService.updateCampus(
      campusId,
      collegeId,
      data,
    );
    return res.status(200).json(ApiResponse.success("Campus updated", result));
  }

  static async deleteCampus(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const campusId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const result = await CollegeRegistrationService.removeCampus(
      campusId,
      collegeId,
    );
    return res.status(200).json(ApiResponse.success("Campus removed", result));
  }

  // ── Courses ────────────────────────────────────────────────────────────────

  static async listCourses(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.listCourses(collegeId);
    return res.status(200).json(ApiResponse.success("Courses fetched", result));
  }

  static async addCourse(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = createCourseSchema.parse(req.body);
    const result = await CollegeRegistrationService.addCourse(collegeId, data);
    return res.status(201).json(ApiResponse.success("Course added", result));
  }

  static async updateCourse(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const courseId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const data = updateCourseSchema.parse(req.body);
    const result = await CollegeRegistrationService.updateCourse(
      courseId,
      collegeId,
      data,
    );
    return res.status(200).json(ApiResponse.success("Course updated", result));
  }

  static async deleteCourse(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const courseId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const result = await CollegeRegistrationService.removeCourse(
      courseId,
      collegeId,
    );
    return res.status(200).json(ApiResponse.success("Course removed", result));
  }

  // ── Lookups ────────────────────────────────────────────────────────────────

  static async getStreams(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getStreams();
    return res.status(200).json(ApiResponse.success("Streams fetched", result));
  }

  static async getStudyLevels(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getStudyLevels();
    return res
      .status(200)
      .json(ApiResponse.success("Study levels fetched", result));
  }

  static async getProgramTypes(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getProgramTypes();
    return res
      .status(200)
      .json(ApiResponse.success("Program types fetched", result));
  }

  static async getUniversities(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getUniversities();
    return res
      .status(200)
      .json(ApiResponse.success("Universities fetched", result));
  }
}
