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
  clubsAssociationsQuerySchema,
  clubDetailParamSchema,
} from "../validators/course-tabs.validator";

// ── helpers ──────────────────────────────────────────────────────────────────

function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function bool(v: unknown, def = false): boolean {
  return typeof v === "boolean" ? v : def;
}

function arr<T>(v: unknown, map: (item: unknown) => T): T[] {
  return Array.isArray(v) ? v.map(map) : [];
}

// ── course_info formatter ─────────────────────────────────────────────────────

function formatCourseInfoTab(raw: unknown): Record<string, unknown> {
  const d = isRec(raw) ? raw : {};

  // overview
  const ov = isRec(d.overview) ? d.overview : {};
  const overview = {
    credits: num(ov.credits),
    duration: str(ov.duration),
    study_mode: str(ov.study_mode),
    academic_cycle: str(ov.academic_cycle),
    course_category: str(ov.course_category),
    gender_accepted: str(ov.gender_accepted),
  };

  // admissions
  const admissions = arr(d.admissions, (item) => {
    const a = isRec(item) ? item : {};
    return {
      label: str(a.label) || str(a.year),
      status: str(a.status) || "upcoming",
    };
  });

  // admission_status
  const as_ = isRec(d.admission_status) ? d.admission_status : {};
  const admissionStatus = {
    tag: str(as_.tag),
    urgency_label: str(as_.urgency_label),
    seat_availability_percent: num(as_.seat_availability_percent),
  };

  // admission_batches — derive from admissions[] when not stored explicitly
  const rawBatches = Array.isArray(d.admission_batches)
    ? d.admission_batches
    : Array.isArray(d.admissions)
      ? d.admissions
      : [];
  const sharedStatus = isRec(d.admission_status) ? d.admission_status : {};
  const admissionBatches = rawBatches.map((item: unknown) => {
    const b = isRec(item) ? item : {};
    const banner = isRec(b.banner) ? b.banner : {};
    const progress =
      num(banner.progress_percentage) ||
      num(sharedStatus.seat_availability_percent);
    const tag =
      str(banner.tag) ||
      (str(b.status).toLowerCase() === "open" ? "ADMISSIONS OPEN" : "UPCOMING");
    const message = str(banner.message) || str(sharedStatus.urgency_label);
    const enabled =
      typeof banner.enabled === "boolean"
        ? banner.enabled
        : str(b.status).toLowerCase() === "open";
    return {
      label: str(b.label) || str((b as any).year),
      status: str(b.status) || "upcoming",
      banner: { tag, enabled, message, progress_percentage: progress },
    };
  });

  // curriculum
  const cur = isRec(d.curriculum) ? d.curriculum : {};
  const curriculum = {
    semesters: Array.isArray(cur.semesters) ? cur.semesters : [],
    brochure_link: str(cur.brochure_link) || str(cur.brochure_upload),
  };

  // student_forum — also maps legacy keys {admission_team_contact, ex_student_chat}
  const sf = isRec(d.student_forum) ? d.student_forum : {};
  const studentForum = {
    icon: str(sf.icon),
    link: str(sf.link) || str(sf.admission_team_contact),
    title: str(sf.title) || "Student Forum",
    enabled: bool(sf.enabled, true),
    cta_icon: str(sf.cta_icon),
    cta_label: str(sf.cta_label),
    description: str(sf.description),
  };

  // bonus_certification
  const bc = isRec(d.bonus_certification) ? d.bonus_certification : {};
  const bonusCertification = {
    tag: str(bc.tag),
    link: str(bc.link) || str(bc.certificate_link),
    title: str(bc.title) || str(bc.name),
    cta_label: str(bc.cta_label) || str(bc.ctaLabel),
    description: str(bc.description) || str(bc.note),
  };

  // higher_education
  const he = isRec(d.higher_education) ? d.higher_education : {};
  const higherEd = isRec(d.higher_education_and_certifications)
    ? d.higher_education_and_certifications
    : {};
  const higherEducation = {
    postgraduation: Array.isArray(he.postgraduation)
      ? he.postgraduation
      : Array.isArray((higherEd as any).postgraduation)
        ? (higherEd as any).postgraduation
        : [],
    global_certifications: Array.isArray(he.global_certifications)
      ? he.global_certifications
      : Array.isArray((higherEd as any).global_certifications)
        ? (higherEd as any).global_certifications
        : [],
  };

  return {
    tab: "course_info",
    course_name: str(d.course_name),
    total_credits: num(d.total_credits) || num(overview.credits),
    overview,
    admissions,
    admission_status: admissionStatus,
    admission_batches: admissionBatches,
    curriculum,
    key_dates: Array.isArray(d.key_dates) ? d.key_dates : [],
    class_timings: Array.isArray(d.class_timings) ? d.class_timings : [],
    program_highlights: Array.isArray(d.program_highlights)
      ? d.program_highlights
      : [],
    course_accolades: Array.isArray(d.course_accolades)
      ? d.course_accolades
      : [],
    course_structure: Array.isArray(d.course_structure)
      ? d.course_structure
      : [],
    industry_tools: Array.isArray(d.industry_tools) ? d.industry_tools : [],
    lab_facilities: Array.isArray(d.lab_facilities) ? d.lab_facilities : [],
    classroom_facilities: Array.isArray(d.classroom_facilities)
      ? d.classroom_facilities
      : [],
    career_opportunities: Array.isArray(d.career_opportunities)
      ? d.career_opportunities
      : [],
    flexible_exit_options: Array.isArray(d.flexible_exit_options)
      ? d.flexible_exit_options
      : [],
    higher_education: higherEducation,
    value_added_courses: Array.isArray(d.value_added_courses)
      ? d.value_added_courses
      : Array.isArray(d.value_added_course)
        ? [d.value_added_course]
        : [],
    student_forum: studentForum,
    bonus_certification: bonusCertification,
    featured_alumni: Array.isArray(d.featured_alumni) ? d.featured_alumni : [],
    faqs: Array.isArray(d.faqs) ? d.faqs : [],
  };
}

// ── admission_policy formatter ────────────────────────────────────────────────

function formatAdmissionPolicyTab(raw: unknown): Record<string, unknown> {
  const d = isRec(raw) ? raw : {};

  // seat_matrix
  const sm = isRec(d.seat_matrix) ? d.seat_matrix : {};
  const smRows = arr(sm.rows, (item) => {
    const r = isRec(item) ? item : {};
    return {
      quota_category: str(r.quota_category) || str((r as any).quota),
      total: num(r.total) || num((r as any).total_seats),
      open: num(r.open) || num((r as any).open_seats),
    };
  });
  const seatMatrix = {
    title: str(sm.title) || "Seat Matrix",
    columns: Array.isArray(sm.columns)
      ? sm.columns
      : ["Quota Category", "Total", "Open"],
    rows: smRows,
  };

  // quota_options
  const qo = isRec(d.quota_options) ? d.quota_options : {};
  const quotaOptions = {
    title: str(qo.title) || "Select Quota Category",
    options: arr(qo.options, (item) => {
      const o = isRec(item) ? item : {};
      return { label: str(o.label), value: str(o.value) };
    }),
  };

  // entrance_exams_accepted
  const ee = isRec(d.entrance_exams_accepted) ? d.entrance_exams_accepted : {};
  const levels = arr(ee.levels, (item) => {
    const lv = isRec(item) ? item : {};
    return {
      level_label: str(lv.level_label),
      exams: arr(lv.exams, (ex) => {
        const e = isRec(ex) ? ex : {};
        return {
          name: str(e.name),
          exam_code: str(e.exam_code),
          code_badge: str(e.code_badge),
          min_criteria_label: str(e.min_criteria_label),
          min_criteria_value: str(e.min_criteria_value),
        };
      }),
    };
  });
  const entranceExams = {
    title: str(ee.title) || "Entrance Exams Accepted",
    levels,
  };

  return {
    id: "admission_policy",
    title: str(d.title) || "Admission Policy",
    enabled: bool(d.enabled, true),
    seat_matrix: seatMatrix,
    quota_options: quotaOptions,
    entrance_exams_accepted: entranceExams,
  };
}

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

    let formattedData: unknown = result.data;
    if (tabName === "course_info") {
      formattedData = formatCourseInfoTab(result.data);
    } else if (tabName === "admission_policy") {
      formattedData = formatAdmissionPolicyTab(result.data);
    }

    return res.status(200).json(
      ApiResponse.success("Course tab fetched", {
        sectionName: result.sectionName,
        sectionId: result.sectionId,
        sectionKey: result.sectionKey,
        data: formattedData,
      }),
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

  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId/clubs-associations
   * Paginated + searchable list of clubs & associations (public).
   */
  static async listPublicClubsAssociations(req: Request, res: Response) {
    const { slug, courseId } = publicCourseDetailParamSchema.parse(req.params);
    const { page, per_page, search } = clubsAssociationsQuerySchema.parse(
      req.query,
    );

    const result = await CourseTabsService.listPublicClubsAssociations(
      courseId,
      slug,
      page,
      per_page,
      search,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Clubs & associations fetched", result));
  }

  /**
   * GET /public/colleges/by-slug/:slug/courses/:courseId/clubs-associations/:clubId
   * Single club's full detail view (public).
   */
  static async getPublicClubDetail(req: Request, res: Response) {
    const { slug, courseId, clubId } = clubDetailParamSchema.parse(req.params);

    const result = await CourseTabsService.getPublicClubDetail(
      courseId,
      slug,
      clubId,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Club detail fetched successfully", result));
  }
}
