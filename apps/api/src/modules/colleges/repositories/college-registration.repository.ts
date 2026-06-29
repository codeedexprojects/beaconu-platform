import { prisma, Prisma } from "@beaconu/db";
import {
  UpdateCollegeProfileData,
  CreateCampusData,
  UpdateCampusData,
  CreateCourseData,
  UpdateCourseData,
} from "../validators/college-registration.validator";

const DEFAULT_COURSE_CREATE_TABS = [
  "course_info",
  "admission_policy",
  "placements",
  "fees",
  "financial_aid",
  "student_housing",
  "exam_policy",
  "faculty",
  "review",
  "library",
  "clubs_associations",
  "alliance",
  "other_courses_offered",
  "demo_graphics",
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeToArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function extractAllowedStreamIdsFromMetadata(metadata: unknown): string[] {
  if (!isRecord(metadata)) return [];
  const overview = isRecord(metadata.overview) ? metadata.overview : {};
  const discipline = normalizeToArray(overview.discipline);

  const ids = discipline
    .map((entry) => {
      if (typeof entry === "string") {
        return UUID_REGEX.test(entry) ? entry : null;
      }

      if (!isRecord(entry)) {
        return null;
      }

      const candidate =
        asString(entry.id) ||
        asString(entry.streamId) ||
        asString(entry.stream_id);

      return UUID_REGEX.test(candidate) ? candidate : null;
    })
    .filter((id): id is string => Boolean(id));

  return Array.from(new Set(ids));
}

export class CollegeRegistrationRepository {
  private static readonly COURSE_RELATIONS_INCLUDE = {
    discipline: {
      select: {
        id: true,
        name: true,
        stream: { select: { id: true, name: true } },
      },
    },
    studyLevel: { select: { id: true, name: true } },
    programType: { select: { id: true, name: true } },
    campus: { select: { id: true, name: true } },
  };

  private static readonly COURSE_RELATIONS_INCLUDE_NO_CAMPUS = {
    discipline: {
      select: {
        id: true,
        name: true,
        stream: { select: { id: true, name: true } },
      },
    },
    studyLevel: { select: { id: true, name: true } },
    programType: { select: { id: true, name: true } },
  };

  private static async existsCampusInCollege(
    campusId: string,
    collegeId: string,
  ) {
    return prisma.campus.findFirst({ where: { id: campusId, collegeId } });
  }

  private static async existsCourseInCollege(
    courseId: string,
    collegeId: string,
  ) {
    return prisma.course.findFirst({ where: { id: courseId, collegeId } });
  }

  private static async softDeleteCampus(campusId: string) {
    return prisma.campus.update({
      where: { id: campusId },
      data: { status: "inactive" },
    });
  }

  private static async softDeleteCourse(courseId: string) {
    return prisma.course.update({
      where: { id: courseId },
      data: { status: "inactive" },
    });
  }

  // ── College Profile ────────────────────────────────────────────────────────

  static async findCollegeById(collegeId: string) {
    return prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            universityType: { select: { name: true } },
          },
        },
        campuses: {
          where: { status: "active" },
          orderBy: { createdAt: "asc" },
        },
        blinkUsers: {
          where: { status: "active" },
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
          },
        },
        _count: {
          select: { courses: true, staffMembers: true },
        },
      },
    });
  }

  static async updateCollegeProfile(
    collegeId: string,
    data: UpdateCollegeProfileData,
  ) {
    const registrationMetaPatch: Record<string, unknown> = {};

    if (data.leadId !== undefined) {
      registrationMetaPatch.leadId = data.leadId;
    }

    if (data.addressFromLead !== undefined) {
      registrationMetaPatch.addressFromLead = data.addressFromLead;
    }

    if (data.registrationTabs !== undefined) {
      registrationMetaPatch.registrationTabs = data.registrationTabs;
    }

    const hasRegistrationMetaPatch =
      Object.keys(registrationMetaPatch).length > 0;

    const incomingSettings = isRecord(data.settings)
      ? { ...(data.settings as Record<string, unknown>) }
      : {};

    const existingRegistrationMeta = isRecord(incomingSettings.registrationMeta)
      ? (incomingSettings.registrationMeta as Record<string, unknown>)
      : {};

    const mergedSettings = hasRegistrationMetaPatch
      ? {
          ...incomingSettings,
          registrationMeta: {
            ...existingRegistrationMeta,
            ...registrationMetaPatch,
          },
        }
      : data.settings;

    const payload: Record<string, unknown> = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.universityId !== undefined
        ? { universityId: data.universityId }
        : {}),
      ...(data.domain !== undefined ? { domain: data.domain } : {}),
      ...(data.logoUrl !== undefined
        ? { logoUrl: data.logoUrl === "" ? null : data.logoUrl }
        : {}),
      ...(data.coverImageUrl !== undefined
        ? {
            coverImageUrl:
              data.coverImageUrl === "" ? null : data.coverImageUrl,
          }
        : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.district !== undefined ? { district: data.district } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.pinCode !== undefined ? { pinCode: data.pinCode } : {}),
      ...(data.requestedGroupCode !== undefined
        ? {
            requestedGroupCode:
              data.requestedGroupCode === "" ? null : data.requestedGroupCode,
          }
        : {}),
      ...(data.profileSections !== undefined
        ? { profileSections: data.profileSections }
        : {}),
      ...(data.registrationTabs !== undefined
        ? { registrationTabs: data.registrationTabs }
        : {}),
      ...(mergedSettings !== undefined ? { settings: mergedSettings } : {}),
    };

    return prisma.college.update({
      where: { id: collegeId },
      data: payload as any,
    });
  }

  static async checkSlugAvailability(slug: string, excludeCollegeId?: string) {
    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) return true;
    if (excludeCollegeId && college.id === excludeCollegeId) return true;
    return false;
  }

  static async updateCollegeSlug(collegeId: string, slug: string) {
    return prisma.college.update({
      where: { id: collegeId },
      data: { slug },
    });
  }

  static async finalizeCollege(collegeId: string) {
    return prisma.college.update({
      where: { id: collegeId },
      data: { status: "active" },
    });
  }

  // ── Campuses ───────────────────────────────────────────────────────────────

  static async getCampuses(collegeId: string) {
    return prisma.campus.findMany({
      where: { collegeId, status: "active" },
      orderBy: [{ isMainCampus: "desc" }, { createdAt: "asc" }],
    });
  }

  static async createCampus(collegeId: string, data: CreateCampusData) {
    // If setting as main campus, unset all others first
    if (data.isMainCampus) {
      await prisma.campus.updateMany({
        where: { collegeId, isMainCampus: true },
        data: { isMainCampus: false },
      });
    }

    return prisma.campus.create({
      data: {
        collegeId,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        latitude: data.latitude,
        longitude: data.longitude,
        isMainCampus: data.isMainCampus,
        status: "active",
      },
    });
  }

  static async updateCampus(
    campusId: string,
    collegeId: string,
    data: UpdateCampusData,
  ) {
    // Verify campus belongs to this college
    const existing = await this.existsCampusInCollege(campusId, collegeId);
    if (!existing) return null;

    if (data.isMainCampus) {
      await prisma.campus.updateMany({
        where: { collegeId, isMainCampus: true, NOT: { id: campusId } },
        data: { isMainCampus: false },
      });
    }

    return prisma.campus.update({
      where: { id: campusId },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        latitude: data.latitude,
        longitude: data.longitude,
        isMainCampus: data.isMainCampus,
      },
    });
  }

  static async deleteCampus(campusId: string, collegeId: string) {
    const existing = await this.existsCampusInCollege(campusId, collegeId);
    if (!existing) return null;

    return this.softDeleteCampus(campusId);
  }

  // ── Courses ────────────────────────────────────────────────────────────────

  static async getCourses(collegeId: string) {
    return prisma.course.findMany({
      where: { collegeId, status: "active" },
      include: this.COURSE_RELATIONS_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
  }

  static async createCourse(collegeId: string, data: CreateCourseData) {
    const payloadTabData =
      data.tabData && typeof data.tabData === "object"
        ? (data.tabData as Record<string, unknown>)
        : {};
    const tabDataKeys = Object.keys(payloadTabData);
    const baseTabs = Array.isArray(data.tabs)
      ? data.tabs
      : DEFAULT_COURSE_CREATE_TABS;
    const tabs = Array.from(new Set([...baseTabs, ...tabDataKeys]));

    return prisma.course.create({
      data: {
        collegeId,
        campusId: data.campusId,
        disciplineId: data.disciplineId,
        studyLevelId: data.studyLevelId,
        programTypeId: data.programTypeId,
        name: data.name,
        code: data.code,
        duration: data.duration,
        eligibility: data.eligibility,
        intakeCapacity: data.intakeCapacity,
        studyMode: data.studyMode,
        metadata: {
          tabs,
          tabData: payloadTabData as Prisma.InputJsonValue,
        },
        highlights: [],
        curriculum: [],
        courseStructure: {},
        valueAddedCourses: [],
        careerOpportunities: [],
        higherEducationCertifications: {},
        flexibleExitOptions: [],
        classTimings: {},
        industryTools: [],
        labFacilities: [],
        roomFacilities: [],
        featuredAlumni: [],
        faqs: [],
        examPolicy: {},
        entranceExamEligibility: [],
        eligibilityCriteria: {},
        accreditations: [],
        keyDates: [],
        demographics: {},
        status: "active",
      },
      include: this.COURSE_RELATIONS_INCLUDE_NO_CAMPUS,
    });
  }

  static async getDisciplineById(disciplineId: string) {
    return prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: {
        id: true,
        streamId: true,
        isActive: true,
      },
    });
  }

  static async updateCourse(
    courseId: string,
    collegeId: string,
    data: UpdateCourseData,
  ) {
    const existing = await this.existsCourseInCollege(courseId, collegeId);
    if (!existing) return null;

    return prisma.course.update({
      where: { id: courseId },
      data: {
        campusId: data.campusId,
        disciplineId: data.disciplineId,
        studyLevelId: data.studyLevelId,
        programTypeId: data.programTypeId,
        name: data.name,
        code: data.code,
        duration: data.duration,
        eligibility: data.eligibility,
        intakeCapacity: data.intakeCapacity,
        studyMode: data.studyMode,
      },
    });
  }

  static async deleteCourse(courseId: string, collegeId: string) {
    const existing = await this.existsCourseInCollege(courseId, collegeId);
    if (!existing) return null;

    return this.softDeleteCourse(courseId);
  }

  // ── Lookups ────────────────────────────────────────────────────────────────

  static async getActiveDepartmentsByCollegeId(collegeId: string) {
    void collegeId;
    return prisma.discipline.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  static async getStreamsWithDisciplines(allowedStreamIds?: string[]) {
    if (allowedStreamIds && allowedStreamIds.length === 0) {
      return [];
    }

    const streamsWithActiveDisciplines = await prisma.stream.findMany({
      where: {
        isActive: true,
        ...(allowedStreamIds ? { id: { in: allowedStreamIds } } : {}),
      },
      include: {
        disciplines: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const hasAnyDisciplines = streamsWithActiveDisciplines.some(
      (stream) => stream.disciplines.length > 0,
    );

    if (hasAnyDisciplines) {
      return streamsWithActiveDisciplines;
    }

    // Fallback for legacy/inconsistent seed data where isActive flags are not set as expected.
    const streamsWithAllDisciplines = await prisma.stream.findMany({
      where: {
        isActive: true,
        ...(allowedStreamIds ? { id: { in: allowedStreamIds } } : {}),
      },
      include: {
        disciplines: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const hasAnyDisciplinesAfterRelaxedFilter = streamsWithAllDisciplines.some(
      (stream) => stream.disciplines.length > 0,
    );

    if (hasAnyDisciplinesAfterRelaxedFilter || !allowedStreamIds) {
      return streamsWithAllDisciplines;
    }

    // Final fallback: if university-level stream restrictions point to empty/misconfigured streams,
    // return all active streams so course discipline selection is still usable.
    const globalStreamsWithActiveDisciplines = await prisma.stream.findMany({
      where: { isActive: true },
      include: {
        disciplines: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const hasAnyGlobalDisciplines = globalStreamsWithActiveDisciplines.some(
      (stream) => stream.disciplines.length > 0,
    );

    if (hasAnyGlobalDisciplines) {
      return globalStreamsWithActiveDisciplines;
    }

    return prisma.stream.findMany({
      where: { isActive: true },
      include: {
        disciplines: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getAllowedStreamIdsForCollege(collegeId: string) {
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: {
        university: {
          select: {
            metadata: true,
          },
        },
      },
    });

    return extractAllowedStreamIdsFromMetadata(college?.university?.metadata);
  }

  static async getStudyLevels() {
    return prisma.studyLevel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getProgramTypes() {
    return prisma.programType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getUniversities() {
    return prisma.university.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        state: true,
        universityType: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });
  }
}
