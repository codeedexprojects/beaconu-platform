import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { StudentsQuery } from "../queries/students.query";
import { StudentDetailQuery } from "../queries/student-detail.query";
import { studentSchemas } from "../validators/students.validator";

export class CollegeAdminStudentsController {
  static async listMinimal(req: Request, res: Response) {
    const query = studentSchemas.collegeStudentListQuery.parse(req.query);
    const result = await StudentsQuery.listMinimalForCollege(req.collegeId!, {
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return res
      .status(200)
      .json(ApiResponse.success("Students fetched", result));
  }

  static async listEnrolled(req: Request, res: Response) {
    const query = studentSchemas.collegeStudentListQuery.parse(req.query);
    const result = await StudentsQuery.listEnrolledForCollege(req.collegeId!, {
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return res
      .status(200)
      .json(ApiResponse.success("Enrolled students fetched", result));
  }

  static async getDetail(req: Request, res: Response) {
    const result = await StudentDetailQuery.getForCollege(
      req.collegeId!,
      req.params.id as string,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Student detail fetched", result));
  }
}
