import { NotFoundError } from "@/shared/errors";
import { CollegeRegistrationService } from "@/modules/colleges/services/college-registration.service";
import { CourseTabsService } from "@/modules/colleges/services/course-tabs.service";
import type {
  CompareAccreditationAffiliation,
  CompareCampusDetails,
  CompareCourseDetails,
  CompareCurriculum,
  CompareEligibilityCriteria,
  CompareEntranceExams,
  CompareFees,
  CompareHero,
  ComparePlacements,
  CompareStudentLife,
  CompareUniversityDetails,
  CompareValueAdded,
} from "@beaconu/types";
import { ComparisonRepository } from "../repositories/comparison.repository";

type CollegeBasics = NonNullable<
  Awaited<ReturnType<typeof ComparisonRepository.findCollegeBasics>>
>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export class ComparisonService {
  private static async loadCollege(collegeId: string): Promise<CollegeBasics> {
    const college = await ComparisonRepository.findCollegeBasics(collegeId);
    if (!college) throw new NotFoundError("College not found");
    return college;
  }

  private static async loadCollegeOverviewSection(collegeId: string) {
    try {
      return asRecord(
        await CollegeRegistrationService.getProfileSection(
          collegeId,
          "college_overview",
        ),
      );
    } catch {
      // Section not configured for this college yet — compare screens should
      // still render (empty state), not error the whole comparison out.
      return {};
    }
  }

  static async getHero(
    collegeId: string,
    courseId?: string,
  ): Promise<CompareHero> {
    const college = await this.loadCollege(collegeId);
    const course = courseId
      ? await ComparisonRepository.findCourseName(courseId, collegeId)
      : null;
    if (courseId && !course) {
      throw new NotFoundError("Course not found at this college");
    }

    return {
      collegeId: college.id,
      name: college.name,
      slug: college.slug,
      coverImageUrl: college.coverImageUrl,
      logoUrl: college.logoUrl,
      avgRating: Number(college.avgRating),
      reviewCount: college.reviewCount,
      establishedYear: college.establishedYear,
      ownershipType: college.collegeType,
      campusType: college.collegeType,
      city: college.city,
      district: college.district,
      state: college.state,
      courseId: course?.id ?? null,
      courseName: course?.name ?? null,
    };
  }

  static async getCampusDetails(
    collegeId: string,
  ): Promise<CompareCampusDetails> {
    const college = await this.loadCollege(collegeId);
    const overview = await this.loadCollegeOverviewSection(collegeId);

    return {
      campusSizeAcres: college.campusSizeAcres
        ? college.campusSizeAcres.toString()
        : null,
      amenities: Array.isArray(overview.amenities)
        ? (overview.amenities as CompareCampusDetails["amenities"])
        : [],
      insideCampusFacilities: Array.isArray(overview.inside_campus_facilities)
        ? (overview.inside_campus_facilities as CompareCampusDetails["insideCampusFacilities"])
        : [],
      location: (overview.location as CompareCampusDetails["location"]) ?? null,
      view360Url: college.view360Url,
    };
  }

  static async getAccreditationAffiliation(
    collegeId: string,
  ): Promise<CompareAccreditationAffiliation> {
    const college = await this.loadCollege(collegeId);
    const group = college.institutionGroupMember?.group ?? null;
    const overview = await this.loadCollegeOverviewSection(collegeId);

    return {
      universityName: college.university?.name ?? null,
      universityType: college.university?.universityType?.name ?? null,
      accreditation: college.university?.accreditation ?? null,
      institutionGroupName: group?.name ?? null,
      affiliatedColleges: (group?.members ?? [])
        .map((m) => m.college)
        .filter((c) => c.id !== collegeId),
      courseAccreditations: null,
      accolades: Array.isArray(overview.accolades)
        ? (overview.accolades as CompareAccreditationAffiliation["accolades"])
        : [],
    };
  }

  static async getUniversityDetails(
    collegeId: string,
  ): Promise<CompareUniversityDetails> {
    await this.loadCollege(collegeId);
    const overview = await this.loadCollegeOverviewSection(collegeId);

    return {
      universityDetails: Array.isArray(overview.university_details)
        ? (overview.university_details as CompareUniversityDetails["universityDetails"])
        : [],
      accolades: Array.isArray(overview.accolades)
        ? (overview.accolades as CompareUniversityDetails["accolades"])
        : [],
    };
  }

  static async getStudentLife(collegeId: string): Promise<CompareStudentLife> {
    const college = await this.loadCollege(collegeId);
    const gallery = await ComparisonRepository.findGalleryItems(collegeId);

    return {
      gallery,
      clubs: Array.isArray(college.clubs) ? (college.clubs as unknown[]) : [],
      reviewsSummary: {
        avgRating: Number(college.avgRating),
        reviewCount: college.reviewCount,
      },
    };
  }

  private static async requireCourse(collegeId: string, courseId: string) {
    const course = await ComparisonRepository.findCourseName(
      courseId,
      collegeId,
    );
    if (!course) throw new NotFoundError("Course not found at this college");
    return course;
  }

  static async getCourseDetails(
    collegeId: string,
    courseId: string,
  ): Promise<CompareCourseDetails> {
    const college = await this.loadCollege(collegeId);
    const course = await this.requireCourse(collegeId, courseId);
    const detail = await CourseTabsService.getPublicCourseDetail(
      courseId,
      college.slug,
    );

    return {
      courseId: course.id,
      courseName: course.name,
      duration: course.duration,
      studyMode: course.studyMode,
      highlights: detail.highlights ?? {},
      courseStructure:
        (detail.courseStructure as CompareCourseDetails["courseStructure"]) ??
        null,
      careerOpportunities: detail.careerOpportunities ?? {},
      industryTools: detail.industryTools ?? {},
      labFacilities: detail.labFacilities ?? {},
      roomFacilities: detail.roomFacilities ?? {},
    };
  }

  static async getEligibility(
    collegeId: string,
    courseId: string,
    query: { student_type?: "indian" | "foreign"; quota_category?: string },
  ): Promise<CompareEligibilityCriteria> {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    return CourseTabsService.getPublicEligibilityCriteria(
      courseId,
      college.slug,
      query,
    ) as Promise<CompareEligibilityCriteria>;
  }

  static async getEntranceExams(
    collegeId: string,
    courseId: string,
  ): Promise<CompareEntranceExams> {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    const [admissionPolicy, detail] = await Promise.all([
      CourseTabsService.getPublicCourseTab(
        courseId,
        college.slug,
        "admission_policy",
      ),
      CourseTabsService.getPublicCourseDetail(courseId, college.slug),
    ]);

    const admissionData = asRecord(
      (admissionPolicy as { data?: unknown }).data,
    );

    return {
      entranceExamsAccepted:
        (admissionData.entrance_exams_accepted as CompareEntranceExams["entranceExamsAccepted"]) ??
        null,
      keyDates: (detail.keyDates as CompareEntranceExams["keyDates"]) ?? null,
    };
  }

  static async getCurriculum(
    collegeId: string,
    courseId: string,
  ): Promise<CompareCurriculum> {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    const detail = await CourseTabsService.getPublicCourseDetail(
      courseId,
      college.slug,
    );

    return {
      curriculum:
        (detail.curriculum as CompareCurriculum["curriculum"]) ?? null,
      courseStructure:
        (detail.courseStructure as CompareCurriculum["courseStructure"]) ??
        null,
    };
  }

  static async getValueAdded(
    collegeId: string,
    courseId: string,
  ): Promise<CompareValueAdded> {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    const detail = await CourseTabsService.getPublicCourseDetail(
      courseId,
      college.slug,
    );

    return {
      valueAddedCourses:
        (detail.valueAddedCourses as CompareValueAdded["valueAddedCourses"]) ??
        null,
      flexibleExitOptions:
        (detail.flexibleExitOptions as CompareValueAdded["flexibleExitOptions"]) ??
        null,
      classTimings:
        (detail.classTimings as CompareValueAdded["classTimings"]) ?? null,
    };
  }

  static async getFees(
    collegeId: string,
    courseId: string,
  ): Promise<CompareFees> {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    return CourseTabsService.getPublicCourseTab(
      courseId,
      college.slug,
      "fees",
    ) as Promise<CompareFees>;
  }

  static async getPlacements(
    collegeId: string,
    courseId: string,
  ): Promise<ComparePlacements> {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    const tab = await CourseTabsService.getPublicCourseTab(
      courseId,
      college.slug,
      "placements",
    );
    return (tab as { data?: unknown }).data ?? [];
  }

  static async getHousing(collegeId: string, courseId: string) {
    const college = await this.loadCollege(collegeId);
    await this.requireCourse(collegeId, courseId);
    const tab = await CourseTabsService.getPublicCourseTab(
      courseId,
      college.slug,
      "student_housing",
    );
    return (tab as { data?: unknown }).data ?? null;
  }
}
