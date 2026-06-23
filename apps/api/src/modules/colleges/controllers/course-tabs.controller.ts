import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CourseTabsService } from "../services/course-tabs.service";
import {
  courseTabParamSchema,
  courseIdParamSchema,
  publicCourseTabParamSchema,
  publicCourseDetailParamSchema,
  updateCourseTabSchema,
  eligibilityCriteriaQuerySchema,
  reviewsQuerySchema,
  otherCoursesOfferedQuerySchema,
} from "../validators/course-tabs.validator";

export class CourseTabsController {
  // ── College-Admin Endpoints ──────────────────────────────────────────────

  /**
   * GET /college-admin/courses/:id/tabs
   * Returns all tab data for a course (admin view).
   */
  static async getTabsAdmin(req: Request, res: Response) {
    const { id } = courseIdParamSchema.parse(req.params);
    const collegeId = req.collegeId!;

    const result = await CourseTabsService.getCourseTabsForAdmin(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Course tabs fetched", result));
  }

  /**
   * GET /college-admin/courses/:id/tabs/:tabName
   * Returns a single tab's data (admin view).
   */
  static async getTabAdmin(req: Request, res: Response) {
    const { id, tabName } = courseTabParamSchema.parse(req.params);
    const collegeId = req.collegeId!;

    const result = await CourseTabsService.getCourseTab(id, collegeId, tabName);
    return res
      .status(200)
      .json(
        ApiResponse.success("College section fetched successfully", result),
      );
  }

  /**
   * PATCH /college-admin/courses/:id/tabs/:tabName
   * Updates a single tab's data.
   */
  static async updateTabAdmin(req: Request, res: Response) {
    const { id, tabName } = courseTabParamSchema.parse(req.params);
    const { data } = updateCourseTabSchema.parse(req.body);
    const collegeId = req.collegeId!;

    const result = await CourseTabsService.updateCourseTab(
      id,
      collegeId,
      tabName,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Course tab updated", result));
  }

  // ── Public Endpoints ─────────────────────────────────────────────────────

  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId
   * Returns course detail page with available tabs list.
   */
  static async getPublicCourseDetail(req: Request, res: Response) {
    const { slug, courseId } = publicCourseDetailParamSchema.parse(req.params);

    const result = await CourseTabsService.getPublicCourseDetail(
      courseId,
      slug,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Course detail fetched", result));
  }

  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId/tabs/:tabName
   * Returns a single tab's data (public view).
   */
  static async getPublicCourseTab(req: Request, res: Response) {
    const { slug, courseId, tabName } = publicCourseTabParamSchema.parse(
      req.params,
    );

    const result = await CourseTabsService.getPublicCourseTab(
      courseId,
      slug,
      tabName,
    );

    let message = "Course tab fetched";
    if (tabName === "clubs_associations") {
      message = "Club detail fetched successfully";
    } else if (tabName === "alliance") {
      message = "Alliance detail fetched successfully";
    }

    return res.status(200).json(ApiResponse.success(message, result));
  }

  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId/eligibility-criteria
   * Returns eligibility criteria with filters_applied resolved from the
   * query string (public view).
   */
  static async getPublicEligibilityCriteria(req: Request, res: Response) {
    const { slug, courseId } = publicCourseDetailParamSchema.parse(req.params);
    const { student_type, quota_category } =
      eligibilityCriteriaQuerySchema.parse(req.query);

    const result = await CourseTabsService.getPublicEligibilityCriteria(
      courseId,
      slug,
      { student_type, quota_category },
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Eligibility criteria fetched successfully",
          result,
        ),
      );
  }
  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId/reviews
   * Paginated list of reviews for a course (public).
   */
  static async listPublicCourseReviews(req: Request, res: Response) {
    const { slug, courseId } = publicCourseDetailParamSchema.parse(req.params);
    const { page, per_page } = reviewsQuerySchema.parse(req.query);

    const result = await CourseTabsService.listPublicCourseReviews(
      courseId,
      slug,
      page,
      per_page,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Reviews fetched successfully", result));
  }

  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId/other-courses-offered
   * Paginated + searchable list of other courses offered by the college
   * (public).
   */
  static async listPublicOtherCoursesOffered(req: Request, res: Response) {
    const { slug, courseId } = publicCourseDetailParamSchema.parse(req.params);
    const { page, per_page, search } = otherCoursesOfferedQuerySchema.parse(
      req.query,
    );

    const result = await CourseTabsService.listPublicOtherCoursesOffered(
      courseId,
      slug,
      page,
      per_page,
      search,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Other courses offered fetched", result));
  }
}
