import { prisma } from "@beaconu/db";
import {
  UpdateCollegeProfileData,
  CreateCampusData,
  UpdateCampusData,
  CreateCourseData,
  UpdateCourseData,
} from "../validators/college-registration.validator";

export class CollegeRegistrationRepository {
  // ── College Profile ────────────────────────────────────────────────────────

  static async findCollegeById(collegeId: string) {
    return prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        university: { select: { id: true, name: true } },
        campuses: {
          where: { status: "active" },
          orderBy: { createdAt: "asc" },
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
    const payload: Record<string, unknown> = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.universityId !== undefined
        ? { universityId: data.universityId }
        : {}),
      ...(data.domain !== undefined ? { domain: data.domain } : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
      ...(data.coverImageUrl !== undefined
        ? { coverImageUrl: data.coverImageUrl }
        : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.district !== undefined ? { district: data.district } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.pinCode !== undefined ? { pinCode: data.pinCode } : {}),
      ...(data.profileSections !== undefined
        ? { profileSections: data.profileSections }
        : {}),
      ...(data.settings !== undefined ? { settings: data.settings } : {}),
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
    const existing = await prisma.campus.findFirst({
      where: { id: campusId, collegeId },
    });
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
    const existing = await prisma.campus.findFirst({
      where: { id: campusId, collegeId },
    });
    if (!existing) return null;

    return prisma.campus.update({
      where: { id: campusId },
      data: { status: "inactive" },
    });
  }

  // ── Courses ────────────────────────────────────────────────────────────────

  static async getCourses(collegeId: string) {
    return prisma.course.findMany({
      where: { collegeId, status: "active" },
      include: {
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
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async createCourse(collegeId: string, data: CreateCourseData) {
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
        status: "active",
      },
      include: {
        discipline: {
          select: {
            id: true,
            name: true,
            stream: { select: { id: true, name: true } },
          },
        },
        studyLevel: { select: { id: true, name: true } },
        programType: { select: { id: true, name: true } },
      },
    });
  }

  static async updateCourse(
    courseId: string,
    collegeId: string,
    data: UpdateCourseData,
  ) {
    const existing = await prisma.course.findFirst({
      where: { id: courseId, collegeId },
    });
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
    const existing = await prisma.course.findFirst({
      where: { id: courseId, collegeId },
    });
    if (!existing) return null;

    return prisma.course.update({
      where: { id: courseId },
      data: { status: "inactive" },
    });
  }

  // ── Lookups ────────────────────────────────────────────────────────────────

  static async getStreamsWithDisciplines() {
    return prisma.stream.findMany({
      where: { isActive: true },
      include: {
        disciplines: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
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
