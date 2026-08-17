import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AcademicTaxonomyService } from "@/modules/universities/services/academic-taxonomy.service";
import {
  matchGroupSchema,
  searchCoursesQuerySchema,
} from "../validators/group-finder.validator";
import { GroupFinderQuery } from "../queries/group-finder.query";

export class GroupFinderStudentController {
  static async match(req: Request, res: Response): Promise<void> {
    const body = matchGroupSchema.parse(req.body);
    const result = await GroupFinderQuery.match(body);
    res.status(200).json(ApiResponse.success("Group match results", result));
  }

  // "Course" dropdown (e.g. "B.Tech Computer Science Engineering") — the
  // platform course catalog, global taxonomy, not college-scoped. Each
  // friend picks one of these; its Discipline/Study Level is what's
  // actually matched against real per-college courses.
  static async searchCourses(req: Request, res: Response): Promise<void> {
    const query = searchCoursesQuerySchema.parse(req.query);
    const result =
      await AcademicTaxonomyService.listCourseMastersForPublic(query);
    res
      .status(200)
      .json(ApiResponse.success("Courses fetched", result.data, result.meta));
  }
}
