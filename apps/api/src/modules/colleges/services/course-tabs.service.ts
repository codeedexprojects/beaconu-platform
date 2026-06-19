import { NotFoundError } from "@/shared/errors";
import { CourseTabsRepository } from "../repositories/course-tabs.repository";
import {
  COURSE_SETUP_TAB_IDS,
  TAB_FIELD_MAP,
  VALID_TAB_NAMES,
} from "../validators/course-tabs.validator";

const DEFAULT_SETUP_TABS = [...COURSE_SETUP_TAB_IDS];

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

function isSetupTabName(tabName: string): boolean {
  return DEFAULT_SETUP_TABS.includes(tabName as any);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getAdmissionBatches(courseInfo: Record<string, unknown>): unknown[] {
  if (Array.isArray(courseInfo.admission_batches)) {
    return courseInfo.admission_batches;
  }

  const admissions = Array.isArray(courseInfo.admissions)
    ? (courseInfo.admissions as unknown[])
    : [];
  if (admissions.length === 0) return [];

  const sharedBanner = asRecord(courseInfo.admission_status);

  return admissions.map((item) => {
    const admission = asRecord(item);
    const admissionBanner = asRecord(admission.banner);

    const label = asText(admission.label) || asText(admission.year);
    const tag =
      asText(admissionBanner.tag) || asText(sharedBanner.tag) || "UPCOMING";
    const message =
      asText(admissionBanner.message) ||
      asText(sharedBanner.message) ||
      asText(sharedBanner.urgency_label) ||
      asText(admission.seats_note);
    const progress =
      asNumber(admissionBanner.progress_percentage) ||
      asNumber(sharedBanner.progress_percentage) ||
      asNumber(sharedBanner.seat_availability_percent) ||
      asNumber(admission.placement_rate);

    return {
      label,
      status: asText(admission.status) || "upcoming",
      banner: {
        enabled:
          typeof admissionBanner.enabled === "boolean"
            ? admissionBanner.enabled
            : progress > 0 || Boolean(message) || Boolean(tag),
        tag,
        message,
        progress_percentage: progress,
      },
    };
  });
}

function getQuickInfo(courseInfo: Record<string, unknown>): unknown[] {
  if (Array.isArray(courseInfo.quick_info)) {
    return courseInfo.quick_info;
  }

  const overview = asRecord(courseInfo.overview);
  const admissions = Array.isArray(courseInfo.admissions)
    ? (courseInfo.admissions as unknown[])
    : [];
  const firstAdmission = admissions.length > 0 ? asRecord(admissions[0]) : {};
  const basicDetails = asRecord(firstAdmission.basic_details);

  const duration = asText(overview.duration) || asText(basicDetails.duration);
  const studyMode =
    asText(overview.study_mode) || asText(basicDetails.study_mode);
  const academicCycle =
    asText(overview.academic_cycle) || asText(basicDetails.academic_cycle);
  const credits =
    asText(overview.credits) || asText(basicDetails.total_credits);
  const gender =
    asText(overview.gender_accepted) || asText(basicDetails.gender_accepted);
  const category =
    asText(overview.course_category) || asText(basicDetails.course_category);

  return [
    { label: "DURATION", value: duration },
    { label: "STUDY MODE", value: studyMode },
    { label: "ACADEMIC CYCLE", value: academicCycle },
    {
      label: "STUDY CREDITS",
      value: credits
        ? credits.toLowerCase().includes("credit")
          ? credits
          : `${credits} Credits`
        : "",
    },
    { label: "GENDER ADMITTED", value: gender },
    { label: "CAMPUS CATEGORY", value: category },
  ];
}

function getCourseSetupTabsFromMetadata(metadata: unknown): string[] {
  const record = asRecord(metadata);
  const tabs = Array.isArray(record.tabs)
    ? record.tabs.filter((v): v is string => typeof v === "string")
    : [];

  const validTabs = tabs.filter((tab) =>
    DEFAULT_SETUP_TABS.includes(tab as any),
  );
  return validTabs.length > 0
    ? Array.from(new Set(validTabs))
    : DEFAULT_SETUP_TABS;
}

function getSetupTabDataFromMetadata(
  metadata: unknown,
  tabName: string,
): unknown {
  const record = asRecord(metadata);
  const tabData = asRecord(record.tabData);
  return tabData[tabName] ?? {};
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
    const course = await CourseTabsRepository.findCourseMetadata(
      courseId,
      collegeId,
    );
    if (!course) throw new NotFoundError("Course not found");
    const tabs = getCourseSetupTabsFromMetadata(course.metadata);

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
    if (isSetupTabName(tabName)) {
      const course = await CourseTabsRepository.findCourseMetadata(
        courseId,
        collegeId,
      );
      if (!course) throw new NotFoundError("Course not found");

      return {
        tabName,
        data: getSetupTabDataFromMetadata(course.metadata, tabName),
      };
    }

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
    if (isSetupTabName(tabName)) {
      const updated = await CourseTabsRepository.updateCourseSetupTabData(
        courseId,
        collegeId,
        tabName,
        data,
      );
      if (!updated) throw new NotFoundError("Course not found");

      return {
        tabName,
        data: getSetupTabDataFromMetadata(updated.metadata, tabName),
      };
    }

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

    const tabs = getCourseSetupTabsFromMetadata(course.metadata);
    const courseInfo = asRecord(
      getSetupTabDataFromMetadata(course.metadata, "course_info"),
    );
    const admissionBatches = getAdmissionBatches(courseInfo);
    const quickInfo = getQuickInfo(courseInfo);

    const studentForum =
      asRecord(courseInfo.student_forum).enabled !== undefined ||
      Object.keys(asRecord(courseInfo.student_forum)).length > 0
        ? asRecord(courseInfo.student_forum)
        : asRecord(courseInfo.studentForum);

    const bonusCertification = asRecord(courseInfo.bonus_certification);
    const certifications =
      Object.keys(bonusCertification).length > 0
        ? {
            title: "Certifications",
            items: [
              {
                tag: asText(bonusCertification.tag),
                title:
                  asText(bonusCertification.title) ||
                  asText(bonusCertification.name),
                description:
                  asText(bonusCertification.description) ||
                  asText(bonusCertification.note),
                cta_label:
                  asText(bonusCertification.cta_label) ||
                  asText(bonusCertification.ctaLabel),
                link:
                  asText(bonusCertification.link) ||
                  asText(bonusCertification.certificate_link),
              },
            ],
          }
        : {};

    return {
      id: course.id,
      name: course.name,
      admission_batches: admissionBatches,
      quick_info: quickInfo,
      tabs,
      highlights: course.highlights ?? {},
      accreditations: course.accreditations ?? {},
      keyDates: course.keyDates ?? {},
      curriculum: course.curriculum ?? {},
      courseStructure: course.courseStructure ?? {},
      valueAddedCourses: course.valueAddedCourses ?? {},
      careerOpportunities: course.careerOpportunities ?? {},
      higherEducationCertifications: course.higherEducationCertifications ?? {},
      flexibleExitOptions: course.flexibleExitOptions ?? {},
      classTimings: course.classTimings ?? {},
      industryTools: course.industryTools ?? {},
      labFacilities: course.labFacilities ?? {},
      roomFacilities: course.roomFacilities ?? {},
      featuredAlumni: course.featuredAlumni ?? {},
      faqs: course.faqs ?? {},
      studentForum,
      certifications,
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
    if (isSetupTabName(tabName)) {
      const course =
        await CourseTabsRepository.findPublicCourseMetadataByIdAndSlug(
          courseId,
          collegeSlug,
        );
      if (!course) throw new NotFoundError("Course not found");

      return {
        tabName,
        data: getSetupTabDataFromMetadata(course.metadata, tabName),
      };
    }

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
