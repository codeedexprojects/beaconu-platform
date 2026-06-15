import { NotFoundError } from "@/shared/errors";
import { CourseTabsRepository } from "../repositories/course-tabs.repository";
import {
  TAB_FIELD_MAP,
  VALID_TAB_NAMES,
} from "../validators/course-tabs.validator";

function isNonEmptyTabData(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function mapTabNameToField(tabName: string): string {
  const field = TAB_FIELD_MAP[tabName];
  if (!field) {
    throw new NotFoundError(
      `Invalid tab name "${tabName}". Valid tabs: ${VALID_TAB_NAMES.join(", ")}`,
    );
  }
  return field;
}

function buildTabsObject(course: Record<string, unknown>) {
  const tabs: Record<string, unknown> = {};
  for (const [tabSlug, prismaField] of Object.entries(TAB_FIELD_MAP)) {
    tabs[tabSlug] = course[prismaField] ?? getDefaultForTab(tabSlug);
  }
  return tabs;
}

function getDefaultForTab(tabSlug: string): unknown {
  // Object-type tabs
  const objectTabs = [
    "course_structure",
    "higher_education_certifications",
    "class_timings",
    "exam_policy",
    "eligibility_criteria",
    "demographics",
  ];
  if (objectTabs.includes(tabSlug)) return {};
  return [];
}

function getAvailableTabs(course: Record<string, unknown>): string[] {
  const available: string[] = [];
  for (const [tabSlug, prismaField] of Object.entries(TAB_FIELD_MAP)) {
    const value = course[prismaField];
    if (isNonEmptyTabData(value)) {
      available.push(tabSlug);
    }
  }
  return available;
}

export class CourseTabsService {
  // ── College-Admin Endpoints ──────────────────────────────────────────────

  /**
   * Get all tab data for a course (admin view — includes empty tabs).
   */
  static async getCourseTabsForAdmin(courseId: string, collegeId: string) {
    const course = await CourseTabsRepository.findCourseWithTabs(
      courseId,
      collegeId,
    );
    if (!course) throw new NotFoundError("Course not found");

    const tabs = buildTabsObject(course as unknown as Record<string, unknown>);

    return {
      courseId: course.id,
      courseName: course.name,
      tabs,
    };
  }

  /**
   * Get a single tab's data (admin).
   */
  static async getCourseTab(
    courseId: string,
    collegeId: string,
    tabName: string,
  ) {
    const prismaField = mapTabNameToField(tabName);

    const course = await CourseTabsRepository.findCourseTabField(
      courseId,
      collegeId,
      prismaField,
    );
    if (!course) throw new NotFoundError("Course not found");

    return {
      tabName,
      data:
        (course as Record<string, unknown>)[prismaField] ??
        getDefaultForTab(tabName),
    };
  }

  /**
   * Update a single tab's data (admin).
   */
  static async updateCourseTab(
    courseId: string,
    collegeId: string,
    tabName: string,
    data: unknown,
  ) {
    const prismaField = mapTabNameToField(tabName);

    const updated = await CourseTabsRepository.updateCourseTab(
      courseId,
      collegeId,
      prismaField,
      data,
    );
    if (!updated) throw new NotFoundError("Course not found");

    return {
      tabName,
      data: (updated as Record<string, unknown>)[prismaField],
    };
  }

  // ── Public Endpoints ─────────────────────────────────────────────────────

  /**
   * Get course detail page with available tabs list (public).
   * Only lists tabs that have non-empty data.
   */
  static async getPublicCourseDetail(courseId: string, collegeSlug: string) {
    const course = await CourseTabsRepository.findPublicCourseByIdAndSlug(
      courseId,
      collegeSlug,
    );
    if (!course) throw new NotFoundError("Course not found");

    const courseRecord = course as unknown as Record<string, unknown>;
    const tabs = getAvailableTabs(courseRecord);

    // Strip tab JSON fields from the course object — only return metadata + relations
    const {
      highlights: _1,
      curriculum: _2,
      courseStructure: _3,
      valueAddedCourses: _4,
      careerOpportunities: _5,
      higherEducationCertifications: _6,
      flexibleExitOptions: _7,
      classTimings: _8,
      industryTools: _9,
      labFacilities: _10,
      roomFacilities: _11,
      featuredAlumni: _12,
      faqs: _13,
      examPolicy: _14,
      entranceExamEligibility: _15,
      eligibilityCriteria: _16,
      accreditations: _17,
      keyDates: _18,
      demographics: _19,
      ...courseMeta
    } = course;

    return {
      course: courseMeta,
      tabs,
    };
  }

  /**
   * Get a single tab's data (public).
   */
  static async getPublicCourseTab(
    courseId: string,
    collegeSlug: string,
    tabName: string,
  ) {
    const prismaField = mapTabNameToField(tabName);

    const course = await CourseTabsRepository.findPublicCourseTabField(
      courseId,
      collegeSlug,
      prismaField,
    );
    if (!course) throw new NotFoundError("Course not found");

    return {
      tabName,
      data:
        (course as Record<string, unknown>)[prismaField] ??
        getDefaultForTab(tabName),
    };
  }
}
