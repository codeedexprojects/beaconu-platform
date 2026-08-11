import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { StudentsQuery } from "../queries/students.query";
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
}
