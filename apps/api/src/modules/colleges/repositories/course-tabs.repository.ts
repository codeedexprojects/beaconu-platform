import { prisma } from "@beaconu/db";

// All tab JSON fields on the Course model that we expose as tabs
const TAB_FIELDS_SELECT = {
  highlights: true,
  curriculum: true,
  courseStructure: true,
  valueAddedCourses: true,
  careerOpportunities: true,
  higherEducationCertifications: true,
  flexibleExitOptions: true,
  classTimings: true,
  industryTools: true,
  labFacilities: true,
  roomFacilities: true,
  featuredAlumni: true,
  faqs: true,
  examPolicy: true,
  entranceExamEligibility: true,
  eligibilityCriteria: true,
  accreditations: true,
  keyDates: true,
  demographics: true,
} as const;

const COURSE_DETAIL_INCLUDE = {
  discipline: {
    select: {
      id: true,
      name: true,
      slug: true,
      stream: { select: { id: true, name: true, slug: true } },
    },
  },
  studyLevel: { select: { id: true, name: true, slug: true } },
  programType: { select: { id: true, name: true, slug: true } },
  campus: {
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
    },
  },
  department: { select: { id: true, name: true, slug: true } },
} as const;

export class CourseTabsRepository {
  /**
   * Fetch a course with all tab JSON fields + relation data.
   * Used by college-admin (scoped by collegeId).
   */
  static async findCourseWithTabs(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId, status: "active" },
      select: {
        id: true,
        name: true,
        code: true,
        duration: true,
        eligibility: true,
        intakeCapacity: true,
        studyMode: true,
        status: true,
        metadata: true,
        ...TAB_FIELDS_SELECT,
        ...COURSE_DETAIL_INCLUDE,
      },
    });
  }

  /**
   * Fetch a single tab field for a course (admin, scoped by collegeId).
   */
  static async findCourseTabField(
    courseId: string,
    collegeId: string,
    prismaFieldName: string,
  ) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId, status: "active" },
      select: {
        id: true,
        name: true,
        [prismaFieldName]: true,
      },
    });
  }

  /**
   * Update a single tab JSON column for a course.
   */
  static async updateCourseTab(
    courseId: string,
    collegeId: string,
    prismaFieldName: string,
    data: unknown,
  ) {
    // Verify course belongs to this college first
    const existing = await prisma.course.findFirst({
      where: { id: courseId, collegeId, status: "active" },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.course.update({
      where: { id: courseId },
      data: { [prismaFieldName]: data as any },
      select: {
        id: true,
        name: true,
        [prismaFieldName]: true,
      },
    });
  }

  /**
   * Fetch a course for public view — verifies it belongs to a college by slug.
   */
  static async findPublicCourseByIdAndSlug(
    courseId: string,
    collegeSlug: string,
  ) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: {
        id: true,
        name: true,
        code: true,
        duration: true,
        eligibility: true,
        intakeCapacity: true,
        studyMode: true,
        metadata: true,
        ...TAB_FIELDS_SELECT,
        ...COURSE_DETAIL_INCLUDE,
      },
    });
  }

  static async findCourseMetadata(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId, status: "active" },
      select: {
        id: true,
        name: true,
        metadata: true,
      },
    });
  }

  static async findPublicCourseMetadataByIdAndSlug(
    courseId: string,
    collegeSlug: string,
  ) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: {
        id: true,
        name: true,
        metadata: true,
      },
    });
  }

  static async updateCourseSetupTabData(
    courseId: string,
    collegeId: string,
    tabName: string,
    data: unknown,
  ) {
    const existing = await prisma.course.findFirst({
      where: { id: courseId, collegeId, status: "active" },
      select: { id: true, metadata: true },
    });
    if (!existing) return null;

    const currentMetadata =
      existing.metadata && typeof existing.metadata === "object"
        ? (existing.metadata as Record<string, unknown>)
        : {};

    const currentTabData =
      currentMetadata.tabData && typeof currentMetadata.tabData === "object"
        ? (currentMetadata.tabData as Record<string, unknown>)
        : {};

    const currentTabs = Array.isArray(currentMetadata.tabs)
      ? (currentMetadata.tabs as string[])
      : [];

    const tabs = currentTabs.includes(tabName)
      ? currentTabs
      : [...currentTabs, tabName];

    const metadata = {
      ...currentMetadata,
      tabs,
      tabData: {
        ...currentTabData,
        [tabName]: data,
      },
    };

    return prisma.course.update({
      where: { id: courseId },
      data: { metadata: metadata as any },
      select: {
        id: true,
        name: true,
        metadata: true,
      },
    });
  }

  /**
   * Fetch a single tab field for public view (verifies college slug).
   */
  static async findPublicCourseTabField(
    courseId: string,
    collegeSlug: string,
    prismaFieldName: string,
  ) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: {
        id: true,
        [prismaFieldName]: true,
      },
    });
  }
}
