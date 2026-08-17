import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AcademicTaxonomyService } from "@/modules/universities/services/academic-taxonomy.service";
import type { ListCoursesQueryInput } from "../validators/courses.validator";

export class CoursesController {
  static async list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListCoursesQueryInput;

    const result = await AcademicTaxonomyService.listCourseMastersForPublic({
      search,
      page,
      limit,
    });

    return res
      .status(200)
      .json(ApiResponse.success("Courses retrieved", result.data, result.meta));
  }
}
