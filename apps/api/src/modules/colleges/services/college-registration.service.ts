import { NotFoundError, ConflictError } from "@/shared/errors";
import { prisma } from "@beaconu/db";
import { PaginationHelper } from "@/shared/responses/pagination";
import { CollegeRegistrationRepository } from "../repositories/college-registration.repository";
import {
  UpdateCollegeProfileData,
  SetSubdomainData,
  CreateCampusData,
  UpdateCampusData,
  CreateCourseData,
  UpdateCourseData,
} from "../validators/college-registration.validator";
import { InstitutionGroupService } from "./institution-group.service";
import { InstitutionDepartmentsQuery } from "../queries/institution-departments.query";
import {
  COURSE_SETUP_TAB_IDS,
  OPTIONAL_SETUP_TAB_IDS,
} from "../validators/course-tabs.validator";
import { AcademicTaxonomyService } from "@/modules/universities/services/academic-taxonomy.service";
import { CommuteService } from "@/modules/commute/services/commute.service";

// The tabs shown on the college-admin course-setup sidebar
// (apps/college-admin/components/academics/constants.ts's COURSE_TABS) that
// count towards completion: 1 always-complete ("basic", the course itself),
// the required COURSE_SETUP_TAB_IDS tracked live in Course.metadata.tabs by
// course-tabs.service.ts on every save, 2 backed by their own relational
// tables (course_quotas, fees), and 3 backed by dedicated Course columns that
// aren't part of the metadata.tabs tracking array. Optional tabs (commute)
// are excluded.
const REQUIRED_COURSE_SETUP_TAB_IDS: readonly string[] =
  COURSE_SETUP_TAB_IDS.filter(
    (tab) => !(OPTIONAL_SETUP_TAB_IDS as readonly string[]).includes(tab),
  );
const TOTAL_COURSE_SETUP_TABS =
  1 + REQUIRED_COURSE_SETUP_TAB_IDS.length + 2 + 3;

function isNonEmptyJsonArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isNonEmptyJsonObject(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length > 0
  );
}

function computeCourseSetupCompletion(course: {
  metadata: unknown;
  eligibilityCriteria: unknown;
  accreditations: unknown;
  entranceExamEligibility: unknown;
  _count?: { quotas: number; feeStructures: number };
}): number {
  const metadata =
    course.metadata && typeof course.metadata === "object"
      ? (course.metadata as Record<string, unknown>)
      : {};
  const savedTabs = Array.isArray(metadata.tabs)
    ? metadata.tabs.filter(
        (tab): tab is string =>
          typeof tab === "string" &&
          REQUIRED_COURSE_SETUP_TAB_IDS.includes(tab),
      )
    : [];

  let complete = 1; // "basic" — the course exists, so this is always done
  complete += new Set(savedTabs).size;
  complete += (course._count?.quotas ?? 0) > 0 ? 1 : 0;
  complete += (course._count?.feeStructures ?? 0) > 0 ? 1 : 0;
  complete += isNonEmptyJsonObject(course.eligibilityCriteria) ? 1 : 0;
  complete += isNonEmptyJsonArray(course.accreditations) ? 1 : 0;
  complete += isNonEmptyJsonArray(course.entranceExamEligibility) ? 1 : 0;

  return Math.round((complete / TOTAL_COURSE_SETUP_TABS) * 100);
}

export class CollegeRegistrationService {
  private static readonly DEFAULT_HAPPENINGS_LIMIT = 10;

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private static asString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
  }

  private static normalizeStringList(value: unknown) {
    if (Array.isArray(value)) {
      return value.map((item) => this.asString(item)).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [] as string[];
  }

  private static filterHappeningsSection(
    section: Record<string, unknown>,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      categories?: string | string[];
    },
  ) {
    const happenings = Array.isArray(section.happenings)
      ? section.happenings.filter((item): item is Record<string, unknown> =>
          this.isRecord(item),
        )
      : [];

    const requestedCategories = Array.from(
      new Set(
        this.normalizeStringList(query?.categories).concat(
          this.normalizeStringList(query?.category),
        ),
      ),
    );

    const searchTerm = this.asString(query?.search).toLowerCase();

    const filteredHappenings = happenings.filter((item) => {
      const itemCategory = this.asString(item.category);

      if (
        requestedCategories.length > 0 &&
        !requestedCategories.some(
          (category) => category.toLowerCase() === itemCategory.toLowerCase(),
        )
      ) {
        return false;
      }

      if (!searchTerm) return true;

      const searchableText = [
        item.title,
        item.description,
        item.category,
        item.date,
      ]
        .map((value) => this.asString(value).toLowerCase())
        .join(" ");

      return searchableText.includes(searchTerm);
    });

    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.max(1, query?.limit ?? this.DEFAULT_HAPPENINGS_LIMIT);
    const total = filteredHappenings.length;
    const start = (page - 1) * limit;
    const paginatedHappenings = filteredHappenings.slice(start, start + limit);

    return {
      ...section,
      happenings: paginatedHappenings,
      pagination: PaginationHelper.createMeta(total, page, limit),
      filters: {
        ...(this.isRecord(section.filters)
          ? (section.filters as Record<string, unknown>)
          : {}),
        categories: requestedCategories,
        search: this.asString(query?.search),
      },
    };
  }

  private static buildTabIdList(profileSections: Record<string, unknown>) {
    return Object.entries(profileSections).reduce((acc, [tabKey, tabValue]) => {
      if (
        this.isRecord(tabValue) &&
        typeof tabValue.enabled === "boolean" &&
        !tabValue.enabled
      ) {
        return acc;
      }

      const tabId =
        this.isRecord(tabValue) &&
        typeof tabValue.id === "string" &&
        tabValue.id.trim() !== ""
          ? tabValue.id
          : tabKey;

      acc.push(tabId);
      return acc;
    }, [] as string[]);
  }

  private static buildProfileResponse(college: any) {
    const totalCourses = college._count?.courses ?? 0;
    const instituteType = college.university?.universityType?.name ?? null;
    const campusAmbassadors = (college.blinkUsers ?? []).map((u: any) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      avatarUrl: u.avatarUrl,
      phoneNumber: u.phoneNumber,
    }));

    const profileSections = this.isRecord(college.profileSections)
      ? (college.profileSections as Record<string, unknown>)
      : {};
    const tabs = this.buildTabIdList(profileSections);

    const collegeDetails = {
      ...(college as Record<string, unknown>),
    };
    delete collegeDetails.profileSections;

    return {
      collegeDetails,
      tabs,
      totalCourses,
      instituteType,
      campusAmbassadors,
    };
  }

  private static getProfileSectionsRecord(college: any) {
    return this.isRecord(college.profileSections)
      ? (college.profileSections as Record<string, unknown>)
      : {};
  }

  static async buildDynamicInstitutionsSection(collegeId: string) {
    const membership =
      await InstitutionGroupService.getMyGroupMembership(collegeId);

    if (!membership) {
      return {
        id: "institutions_across_world",
        enabled: true,
        title: "Institution Across the World",
        institutions: [],
        group: null,
      };
    }

    const group =
      membership.type === "owner"
        ? membership.group
        : membership.membership.group;

    const institutions = await Promise.all(
      (group.members ?? []).map(async (member) => {
        const isViewedCollege = member.college.id === collegeId;

        if (!isViewedCollege) {
          return {
            id: member.college.id,
            name: member.college.name,
            code: member.college.code,
            slug: member.college.slug,
            logoUrl: member.college.logoUrl,
            city: member.college.city,
            state: member.college.state,
            country: "India",
            role: "",
            selected: false,
            joinedAt: "",
            joinedVia: "",
            departments: [],
          };
        }

        const departments =
          await InstitutionDepartmentsQuery.getDepartmentsWithCoursesForCollege(
            collegeId,
          );

        return {
          id: member.college.id,
          name: member.college.name,
          code: member.college.code,
          slug: member.college.slug,
          logoUrl: member.college.logoUrl,
          city: member.college.city,
          state: member.college.state,
          country: "India",
          role: member.role,
          selected: true,
          joinedAt: member.joinedAt,
          joinedVia: member.joinedVia,
          departments,
        };
      }),
    );

    return {
      id: "institutions_across_world",
      enabled: true,
      title: "Institution Across the World",
      institutions,
      group: {
        id: group.id,
        name: group.name,
        groupCode: group.groupCode,
        status: group.status,
      },
    };
  }

  private static async hydrateRegistrationSections(
    collegeId: string,
    sections: Record<string, unknown>,
  ) {
    const [commuteSection, institutionsSection] = await Promise.all([
      CommuteService.buildPublicSection(collegeId),
      this.buildDynamicInstitutionsSection(collegeId),
    ]);

    // Commute always comes from commute_routes (Commute page); any legacy
    // profile_sections.commute blob is ignored.
    const storedSections = { ...sections };
    delete storedSections.commute;

    return {
      ...storedSections,
      ...(commuteSection ? { commute: commuteSection } : {}),
      institutions_across_world: {
        ...(this.isRecord(sections.institutions_across_world)
          ? (sections.institutions_across_world as Record<string, unknown>)
          : {}),
        ...institutionsSection,
      },
    };
  }

  private static asText(value: unknown) {
    return typeof value === "string" ? value : "";
  }

  private static asNumber(value: unknown) {
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : Number(this.asText(value)) || 0;
  }

  private static asStringArray(value: unknown) {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  }

  private static normalizeCourseInfoSection(section: Record<string, unknown>) {
    const legacy = this.isRecord(section.course_details)
      ? (section.course_details as Record<string, unknown>)
      : {};
    const courseHeader = this.isRecord(legacy.courseHeader)
      ? (legacy.courseHeader as Record<string, unknown>)
      : {};

    const existingAdmissions = Array.isArray(section.admissions)
      ? section.admissions
      : [];
    const legacyAdmissionYears = this.asStringArray(
      courseHeader.admissionCycle,
    );

    const admissions =
      existingAdmissions.length > 0
        ? existingAdmissions
        : legacyAdmissionYears.map((year, index) => ({
            year,
            status:
              index === 0
                ? this.asText(courseHeader.admissionStatus) || null
                : null,
            placement_rate:
              index === 0
                ? this.asText(courseHeader.seatAvailabilityPercent) || null
                : null,
            seats_note:
              index === 0
                ? this.asText(courseHeader.seatAvailabilityMessage) || null
                : null,
            basic_details: {
              duration: this.asText(courseHeader.duration),
              study_mode: this.asText(courseHeader.studyMode),
              academic_cycle: this.asText(courseHeader.academicCycle),
              total_credits: this.asNumber(courseHeader.credits),
              gender_accepted: this.asText(courseHeader.genderAccepted),
              course_category: this.asText(courseHeader.courseCategory),
            },
          }));

    const courseInfo: Record<string, unknown> = {
      ...section,
      course_name:
        this.asText(section.course_name) ||
        this.asText(courseHeader.courseName),
      admissions,
      program_highlights: Array.isArray(section.program_highlights)
        ? section.program_highlights
        : Array.isArray(legacy.programHighlights)
          ? (legacy.programHighlights as unknown[])
              .map((item) =>
                this.isRecord(item) ? this.asText(item.description) : "",
              )
              .filter(Boolean)
          : [],
      course_accolades: Array.isArray(section.course_accolades)
        ? section.course_accolades
        : [],
      key_dates: this.isRecord(section.key_dates)
        ? section.key_dates
        : {
            application_start: "",
            application_close: { date: "", urgency: "" },
            class_commencement: { date: "", note: "" },
          },
      curriculum: this.isRecord(section.curriculum)
        ? section.curriculum
        : {
            brochure_upload: this.asText(
              (legacy.curriculum as any)?.brochureUrl,
            ),
            brochure_available: false,
            semesters: [],
            course_structure: { total_credits: 0, breakdown: [] },
          },
      value_added_course: this.isRecord(section.value_added_course)
        ? section.value_added_course
        : { name: "", delivery_mode: "", credits: 0 },
      career_opportunities: Array.isArray(section.career_opportunities)
        ? section.career_opportunities
        : [],
      higher_education_and_certifications: this.isRecord(
        section.higher_education_and_certifications,
      )
        ? section.higher_education_and_certifications
        : {
            global_certifications: this.asStringArray(
              (legacy.higherEducation as any)?.globalCertifications,
            ),
            postgraduation: this.asStringArray(
              (legacy.higherEducation as any)?.higherStudies,
            ),
          },
      flexible_exit_options: Array.isArray(section.flexible_exit_options)
        ? section.flexible_exit_options
        : [],
      class_timings: this.isRecord(section.class_timings)
        ? section.class_timings
        : { mode: "", schedule: [] },
      industry_tools: Array.isArray(section.industry_tools)
        ? section.industry_tools
        : this.asStringArray(legacy.industryTools),
      lab_facilities: Array.isArray(section.lab_facilities)
        ? section.lab_facilities
        : this.asStringArray(legacy.labFacilities),
      classroom_facilities: Array.isArray(section.classroom_facilities)
        ? section.classroom_facilities
        : this.asStringArray(legacy.classroomFacilities),
      bonus_certification: this.isRecord(section.bonus_certification)
        ? section.bonus_certification
        : {
            name: this.asText((legacy.bonusCertification as any)?.title),
            note: this.asText((legacy.bonusCertification as any)?.description),
            certificate_details_available: false,
          },
      featured_alumni: Array.isArray(section.featured_alumni)
        ? section.featured_alumni
        : [],
      faqs: Array.isArray(section.faqs)
        ? section.faqs
        : Array.isArray(legacy.faqs)
          ? (legacy.faqs as unknown[])
              .map((item) =>
                this.isRecord(item)
                  ? this.asText(item.question) || this.asText(item.answer)
                  : "",
              )
              .filter(Boolean)
          : [],
      student_forum: this.isRecord(section.student_forum)
        ? section.student_forum
        : {
            description: this.asText((legacy.studentForum as any)?.description),
            cta: this.asText((legacy.studentForum as any)?.ctaLabel),
          },
    };

    delete courseInfo.course_details;
    return courseInfo;
  }

  private static normalizeProfileSectionsPayload(
    data: UpdateCollegeProfileData,
  ) {
    if (!this.isRecord(data.profileSections)) {
      return data;
    }

    const profileSections = {
      ...(data.profileSections as Record<string, unknown>),
    };

    if (this.isRecord(profileSections.course_info)) {
      profileSections.course_info = this.normalizeCourseInfoSection(
        profileSections.course_info as Record<string, unknown>,
      );
    }

    return {
      ...data,
      profileSections,
    };
  }

  private static async ensureDisciplineAllowedForCollege(
    collegeId: string,
    disciplineId: string,
  ) {
    const discipline =
      await CollegeRegistrationRepository.getDisciplineById(disciplineId);

    if (!discipline || !discipline.isActive) {
      throw new NotFoundError("Discipline not found");
    }

    // Keep college-admin course setup aligned with lookup behavior:
    // any active discipline returned from global taxonomy is allowed.
    void collegeId;
  }

  // ── College Profile ────────────────────────────────────────────────────────

  static async getProfile(collegeId: string) {
    const college =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");

    return this.buildProfileResponse(college);
  }

  static async getProfileSections(collegeId: string) {
    const college =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");

    const sections = this.getProfileSectionsRecord(college);
    return this.hydrateRegistrationSections(collegeId, sections);
  }

  static async getProfileSection(
    collegeId: string,
    tabId: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      categories?: string | string[];
    },
  ) {
    const sections = (await this.getProfileSections(collegeId)) as Record<
      string,
      unknown
    >;
    const section = sections[tabId];

    if (!section) {
      throw new NotFoundError("College profile section not found");
    }

    if (tabId === "happenings" && this.isRecord(section)) {
      return this.filterHappeningsSection(section, query);
    }

    return section;
  }

  static async updateProfile(
    collegeId: string,
    data: UpdateCollegeProfileData,
  ) {
    const college =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");
    const normalizedData = this.normalizeProfileSectionsPayload(data);
    const existingProfileSections = this.isRecord(college.profileSections)
      ? (college.profileSections as Record<string, unknown>)
      : {};
    const mergedProfileSections = this.isRecord(normalizedData.profileSections)
      ? {
          ...existingProfileSections,
          ...(normalizedData.profileSections as Record<string, unknown>),
        }
      : undefined;

    const existingSettings = this.isRecord(college.settings)
      ? (college.settings as Record<string, unknown>)
      : {};

    const registrationMetaPatch: Record<string, unknown> = {};
    if (normalizedData.leadId !== undefined) {
      registrationMetaPatch.leadId = normalizedData.leadId;
    }
    if (normalizedData.addressFromLead !== undefined) {
      registrationMetaPatch.addressFromLead = normalizedData.addressFromLead;
    }
    if (normalizedData.registrationTabs !== undefined) {
      registrationMetaPatch.registrationTabs = normalizedData.registrationTabs;
    }
    const hasRegistrationMetaPatch =
      Object.keys(registrationMetaPatch).length > 0;

    // Always merge onto the college's CURRENT settings from the DB — never
    // onto just the incoming payload — so a save that only touches
    // registrationMeta (or only `settings`) can't blow away unrelated keys
    // like `isListed` that already live in the settings JSON blob.
    const mergedSettings =
      this.isRecord(normalizedData.settings) || hasRegistrationMetaPatch
        ? {
            ...existingSettings,
            ...(this.isRecord(normalizedData.settings)
              ? (normalizedData.settings as Record<string, unknown>)
              : {}),
            ...(hasRegistrationMetaPatch
              ? {
                  registrationMeta: {
                    ...(this.isRecord(existingSettings.registrationMeta)
                      ? (existingSettings.registrationMeta as Record<
                          string,
                          unknown
                        >)
                      : {}),
                    ...registrationMetaPatch,
                  },
                }
              : {}),
          }
        : undefined;

    await CollegeRegistrationRepository.updateCollegeProfile(collegeId, {
      ...normalizedData,
      ...(mergedProfileSections
        ? { profileSections: mergedProfileSections }
        : {}),
      ...(mergedSettings ? { settings: mergedSettings } : {}),
    });

    const updatedCollege =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!updatedCollege) throw new NotFoundError("College not found");

    return this.buildProfileResponse(updatedCollege);
  }

  static async checkSubdomainAvailability(slug: string, collegeId: string) {
    const available = await CollegeRegistrationRepository.checkSlugAvailability(
      slug,
      collegeId,
    );
    return { slug, available };
  }

  static async setSubdomain(collegeId: string, data: SetSubdomainData) {
    const available = await CollegeRegistrationRepository.checkSlugAvailability(
      data.slug,
      collegeId,
    );
    if (!available) {
      throw new ConflictError(
        `Subdomain "${data.slug}" is already taken. Please choose a different one.`,
      );
    }
    return CollegeRegistrationRepository.updateCollegeSlug(
      collegeId,
      data.slug,
    );
  }

  static async finalize(collegeId: string) {
    const college =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");

    const finalizedCollege =
      await CollegeRegistrationRepository.finalizeCollege(collegeId);

    if (college.requestedGroupCode) {
      await InstitutionGroupService.joinGroupByCode(
        collegeId,
        college.requestedGroupCode,
      );
    }

    return finalizedCollege;
  }

  // ── Campuses ───────────────────────────────────────────────────────────────

  static async listCampuses(collegeId: string) {
    return CollegeRegistrationRepository.getCampuses(collegeId);
  }

  static async addCampus(collegeId: string, data: CreateCampusData) {
    return CollegeRegistrationRepository.createCampus(collegeId, data);
  }

  static async updateCampus(
    campusId: string,
    collegeId: string,
    data: UpdateCampusData,
  ) {
    const campus = await CollegeRegistrationRepository.updateCampus(
      campusId,
      collegeId,
      data,
    );
    if (!campus) throw new NotFoundError("Campus not found");
    return campus;
  }

  static async removeCampus(campusId: string, collegeId: string) {
    const campus = await CollegeRegistrationRepository.deleteCampus(
      campusId,
      collegeId,
    );
    if (!campus) throw new NotFoundError("Campus not found");
    return { id: campusId, deleted: true };
  }

  // ── Courses ────────────────────────────────────────────────────────────────

  static async listCourses(collegeId: string) {
    const courses = await CollegeRegistrationRepository.getCourses(collegeId);
    return courses.map((course) => ({
      ...course,
      setupCompletionPercent: computeCourseSetupCompletion(course),
    }));
  }

  static async listCoursesMinimal(collegeId: string) {
    return CollegeRegistrationRepository.getCoursesMinimal(collegeId);
  }

  static async addCourse(collegeId: string, data: CreateCourseData) {
    const taxonomy =
      await AcademicTaxonomyService.resolveCollegeCourseTaxonomy(data);
    const disciplineId = taxonomy.disciplineId ?? data.disciplineId;
    await this.ensureDisciplineAllowedForCollege(collegeId, disciplineId);
    return CollegeRegistrationRepository.createCourse(collegeId, {
      ...data,
      disciplineId,
      studyLevelId: taxonomy.studyLevelId ?? data.studyLevelId,
      programTypeId: taxonomy.programTypeId ?? data.programTypeId,
    });
  }

  static async updateCourse(
    courseId: string,
    collegeId: string,
    data: UpdateCourseData,
  ) {
    const current = await CollegeRegistrationRepository.findCourseTaxonomy(
      courseId,
      collegeId,
    );
    if (!current) throw new NotFoundError("Course not found");

    const taxonomy = await AcademicTaxonomyService.resolveCollegeCourseTaxonomy(
      data,
      current,
    );
    if (
      taxonomy.disciplineId &&
      taxonomy.disciplineId !== current.disciplineId
    ) {
      await this.ensureDisciplineAllowedForCollege(
        collegeId,
        taxonomy.disciplineId,
      );
    }

    const course = await CollegeRegistrationRepository.updateCourse(
      courseId,
      collegeId,
      { ...data, ...taxonomy },
    );
    if (!course) throw new NotFoundError("Course not found");
    return course;
  }

  static async removeCourse(courseId: string, collegeId: string) {
    const course = await CollegeRegistrationRepository.deleteCourse(
      courseId,
      collegeId,
    );
    if (!course) throw new NotFoundError("Course not found");
    return { id: courseId, deleted: true };
  }

  // ── Lookups ────────────────────────────────────────────────────────────────

  static async getStreams(collegeId: string) {
    void collegeId;
    return CollegeRegistrationRepository.getStreamsWithDisciplines();
  }

  static async getDepartments(collegeId: string) {
    return CollegeRegistrationRepository.getActiveDepartmentsByCollegeId(
      collegeId,
    );
  }

  static async getStudyLevels() {
    return CollegeRegistrationRepository.getStudyLevels();
  }

  static async getProgramTypes() {
    return CollegeRegistrationRepository.getProgramTypes();
  }

  static async getUniversities() {
    return CollegeRegistrationRepository.getUniversities();
  }
}
