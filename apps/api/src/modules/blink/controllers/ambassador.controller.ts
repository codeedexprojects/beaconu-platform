import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { BlinkService } from "../services/blink.service";
import { BlinkQuery } from "../queries/blink.query";
import {
  ambassadorProfileUpdateSchema,
  type CollegeListQuery,
} from "../validators/blink.validator";

export class AmbassadorController {
  static async register(req: Request, res: Response) {
    const result = await BlinkService.registerAmbassador(
      req.body,
      req.userId!,
      req.collegeId!,
    );
    return res
      .status(201)
      .json(
        ApiResponse.success("Campus ambassador created successfully", result),
      );
  }

  static async getProfile(req: Request, res: Response) {
    const result = await BlinkService.getAmbassadorProfile(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Profile fetched successfully", result));
  }

  static async updateProfile(req: Request, res: Response) {
    const data = ambassadorProfileUpdateSchema.parse(req.body);
    const result = await BlinkService.updateAmbassadorProfile(
      req.userId!,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Profile updated successfully", result));
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
    const result = await BlinkQuery.getCourseDetailForAmbassador(
      collegeId,
      courseId,
    );
    if (!result) throw new NotFoundError("Course not found");
    return res
      .status(200)
      .json(ApiResponse.success("Course fetched successfully", result));
  }
}
