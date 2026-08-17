import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { ListCoursesQueryInput } from "../validators/courses.validator";

import allCourses from "@/shared/data/courses.json";

export class CoursesController {
  static list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListCoursesQueryInput;

    const filtered = search
      ? allCourses.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allCourses;

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const meta = PaginationHelper.createMeta(total, page, limit);

    return res
      .status(200)
      .json(ApiResponse.success("Courses retrieved", data, meta));
  }
}
