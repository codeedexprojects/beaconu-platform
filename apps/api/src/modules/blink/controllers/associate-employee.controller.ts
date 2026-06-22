import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { BlinkService } from "../services/blink.service";
import { BlinkQuery } from "../queries/blink.query";
import type {
  ReferralListQuery,
  CollegeListQuery,
  UniversityListQuery,
  StreamListQuery,
} from "../validators/blink.validator";

export class AssociateEmployeeController {
  static async getProfile(req: Request, res: Response) {
    const result = await BlinkService.getProfile(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Profile fetched successfully", result));
  }

  static async getPerformance(req: Request, res: Response) {
    const result = await BlinkService.getOwnPerformance(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Performance fetched successfully", result));
  }

  static async listReferrals(req: Request, res: Response) {
    const { status, search, page, limit } =
      req.query as unknown as ReferralListQuery;
    const result = await BlinkQuery.listReferralsByEmployee(req.userId!, {
      status,
      search,
      page,
      limit,
    });
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Referrals fetched successfully",
          result.referrals,
          result.meta,
        ),
      );
  }

  static async getStudentByReferral(req: Request, res: Response) {
    const referralId = req.params["referralId"] as string;
    const result = await BlinkService.getStudentByReferralForEmployee(
      req.userId!,
      referralId,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Student profile fetched successfully", result),
      );
  }

  static async listColleges(req: Request, res: Response) {
    const filters = req.query as unknown as CollegeListQuery;
    const result = await BlinkQuery.listCollegesForEmployee(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Colleges fetched successfully",
          result.colleges,
          result.meta,
        ),
      );
  }

  static async listUniversities(req: Request, res: Response) {
    const filters = req.query as unknown as UniversityListQuery;
    const result = await BlinkQuery.listUniversitiesForEmployee(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Universities fetched successfully",
          result.universities,
          result.meta,
        ),
      );
  }

  static async getUniversityDetail(req: Request, res: Response) {
    const universityId = req.params["universityId"] as string;
    const filters = req.query as unknown as CollegeListQuery;
    const result = await BlinkQuery.getUniversityDetailForEmployee(
      universityId,
      filters,
    );
    return res.status(200).json(
      ApiResponse.success(
        "University fetched successfully",
        {
          university: result.university,
          colleges: result.colleges,
        },
        result.meta,
      ),
    );
  }

  static async listStreams(req: Request, res: Response) {
    const filters = req.query as unknown as StreamListQuery;
    const result =
      await BlinkQuery.listStreamsWithDisciplinesForEmployee(filters);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Streams fetched successfully",
          result.streams,
          result.meta,
        ),
      );
  }

  static async getStreamDetail(req: Request, res: Response) {
    const streamId = req.params["streamId"] as string;
    const filters = req.query as unknown as StreamListQuery;
    const result = await BlinkQuery.getStreamDetailForEmployee(
      streamId,
      filters,
    );
    return res.status(200).json(
      ApiResponse.success(
        "Stream fetched successfully",
        {
          stream: result.stream,
          disciplines: result.disciplines,
        },
        result.meta,
      ),
    );
  }

  static async listCoursesByCollege(req: Request, res: Response) {
    const collegeId = req.params["collegeId"] as string;
    const result = await BlinkQuery.listCoursesForEmployee(collegeId);
    if (!result) throw new NotFoundError("College not found");
    return res
      .status(200)
      .json(ApiResponse.success("Courses fetched successfully", result));
  }

  static async getCourseDetail(req: Request, res: Response) {
    const { collegeId, courseId } = req.params as {
      collegeId: string;
      courseId: string;
    };
    const result = await BlinkQuery.getCourseDetailForEmployee(
      collegeId,
      courseId,
    );
    if (!result) throw new NotFoundError("Course not found");
    return res
      .status(200)
      .json(ApiResponse.success("Course fetched successfully", result));
  }
}
