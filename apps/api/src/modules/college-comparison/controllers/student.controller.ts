import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ComparisonService } from "../services/comparison.service";
import {
  compareCollegeParamSchema,
  compareCourseParamSchema,
  eligibilityQuerySchema,
  heroQuerySchema,
} from "../validators/comparison.validator";

export class CollegeComparisonStudentController {
  static async getHero(req: Request, res: Response) {
    const { collegeId } = compareCollegeParamSchema.parse(req.params);
    const { course_id } = heroQuerySchema.parse(req.query);
    const data = await ComparisonService.getHero(collegeId, course_id);
    return res.json(ApiResponse.success("Hero fetched", data));
  }

  static async getCampusDetails(req: Request, res: Response) {
    const { collegeId } = compareCollegeParamSchema.parse(req.params);
    const data = await ComparisonService.getCampusDetails(collegeId);
    return res.json(ApiResponse.success("Campus details fetched", data));
  }

  static async getAccreditationAffiliation(req: Request, res: Response) {
    const { collegeId } = compareCollegeParamSchema.parse(req.params);
    const data = await ComparisonService.getAccreditationAffiliation(collegeId);
    return res.json(
      ApiResponse.success("Accreditation & affiliation fetched", data),
    );
  }

  static async getUniversityDetails(req: Request, res: Response) {
    const { collegeId } = compareCollegeParamSchema.parse(req.params);
    const data = await ComparisonService.getUniversityDetails(collegeId);
    return res.json(ApiResponse.success("University details fetched", data));
  }

  static async getStudentLife(req: Request, res: Response) {
    const { collegeId } = compareCollegeParamSchema.parse(req.params);
    const data = await ComparisonService.getStudentLife(collegeId);
    return res.json(ApiResponse.success("Student life fetched", data));
  }

  static async getCourseDetails(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getCourseDetails(collegeId, courseId);
    return res.json(ApiResponse.success("Course details fetched", data));
  }

  static async getEligibility(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const query = eligibilityQuerySchema.parse(req.query);
    const data = await ComparisonService.getEligibility(
      collegeId,
      courseId,
      query,
    );
    return res.json(ApiResponse.success("Eligibility fetched", data));
  }

  static async getEntranceExams(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getEntranceExams(collegeId, courseId);
    return res.json(ApiResponse.success("Entrance exams fetched", data));
  }

  static async getCurriculum(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getCurriculum(collegeId, courseId);
    return res.json(ApiResponse.success("Curriculum fetched", data));
  }

  static async getValueAdded(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getValueAdded(collegeId, courseId);
    return res.json(ApiResponse.success("Value added programs fetched", data));
  }

  static async getFees(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getFees(collegeId, courseId);
    return res.json(ApiResponse.success("Course fees fetched", data));
  }

  static async getPlacements(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getPlacements(collegeId, courseId);
    return res.json(ApiResponse.success("Placement statistics fetched", data));
  }

  static async getHousing(req: Request, res: Response) {
    const { collegeId, courseId } = compareCourseParamSchema.parse(req.params);
    const data = await ComparisonService.getHousing(collegeId, courseId);
    return res.json(ApiResponse.success("Student housing fetched", data));
  }
}
