import { NotFoundError, ConflictError } from "@/shared/errors";
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

export class CollegeRegistrationService {
  // ── College Profile ────────────────────────────────────────────────────────

  static async getProfile(collegeId: string) {
    const college =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");

    // Dynamically compute institutional overview details from DB relation counts/values
    const totalCourses = college._count?.courses ?? 0;
    const instituteType = college.university?.universityType?.name ?? null;
    const campusAmbassadors = (college.blinkUsers ?? []).map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      avatarUrl: u.avatarUrl,
      phoneNumber: u.phoneNumber,
    }));

    return {
      ...college,
      totalCourses,
      instituteType,
      campusAmbassadors,
    };
  }

  static async updateProfile(
    collegeId: string,
    data: UpdateCollegeProfileData,
  ) {
    const college =
      await CollegeRegistrationRepository.findCollegeById(collegeId);
    if (!college) throw new NotFoundError("College not found");
    return CollegeRegistrationRepository.updateCollegeProfile(collegeId, data);
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
    return CollegeRegistrationRepository.getCourses(collegeId);
  }

  static async addCourse(collegeId: string, data: CreateCourseData) {
    return CollegeRegistrationRepository.createCourse(collegeId, data);
  }

  static async updateCourse(
    courseId: string,
    collegeId: string,
    data: UpdateCourseData,
  ) {
    const course = await CollegeRegistrationRepository.updateCourse(
      courseId,
      collegeId,
      data,
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

  static async getStreams() {
    return CollegeRegistrationRepository.getStreamsWithDisciplines();
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
