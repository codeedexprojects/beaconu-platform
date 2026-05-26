import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { publicCollegeSchemas } from "../validators/public-college.validator";

const PUBLIC_COLLEGE_INCLUDES = {
  university: {
    select: {
      id: true,
      name: true,
      logoUrl: true,
      universityType: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  campuses: {
    where: { status: "active" },
    orderBy: { isMainCampus: "desc" },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      pinCode: true,
      isMainCampus: true,
    },
  },
  courses: {
    where: { status: "active" },
    include: {
      discipline: {
        include: { stream: true },
      },
      studyLevel: true,
      programType: true,
    },
  },
  institutionGroupMember: {
    include: {
      group: {
        include: {
          members: {
            include: {
              college: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          createdByCollege: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              city: true,
              state: true,
            },
          },
        },
      },
    },
  },
  institutionGroups: {
    where: { status: "active" },
    include: {
      members: {
        include: {
          college: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              city: true,
              state: true,
            },
          },
        },
      },
    },
  },
} as const;

const PUBLIC_COLLEGE_SUMMARY_SELECT = {
  id: true,
  name: true,
  slug: true,
  code: true,
  logoUrl: true,
  coverImageUrl: true,
  domain: true,
  address: true,
  city: true,
  state: true,
  district: true,
  pinCode: true,
  profileSections: true,
  university: {
    select: {
      id: true,
      name: true,
      logoUrl: true,
      universityType: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
} as const;

const PUBLIC_COURSE_SUMMARY_SELECT = {
  id: true,
  name: true,
  code: true,
  duration: true,
  eligibility: true,
  intakeCapacity: true,
  studyMode: true,
  discipline: {
    select: {
      id: true,
      name: true,
      slug: true,
      stream: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  studyLevel: {
    select: { id: true, name: true, slug: true },
  },
  programType: {
    select: { id: true, name: true, slug: true },
  },
  campus: {
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
    },
  },
} as const;

function normalizeStringParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function findSectionByIdentifier(
  profileSections: Record<string, unknown>,
  sectionIdentifier: string,
) {
  for (const [sectionKey, sectionValue] of Object.entries(profileSections)) {
    if (sectionKey === sectionIdentifier) {
      return { sectionKey, section: sectionValue };
    }

    if (
      sectionValue &&
      typeof sectionValue === "object" &&
      !Array.isArray(sectionValue) &&
      "id" in sectionValue &&
      (sectionValue as { id?: unknown }).id === sectionIdentifier
    ) {
      return { sectionKey, section: sectionValue };
    }
  }

  return null;
}

export class PublicCollegeController {
  static async getColleges(req: Request, res: Response) {
    const {
      universityId,
      streamId,
      disciplineId,
      studyLevelId,
      programTypeId,
    } = publicCollegeSchemas.listQuery.parse(req.query);

    const filters: any = { status: "active" };

    if (universityId) {
      filters.universityId = universityId as string;
    }

    if (streamId || disciplineId || studyLevelId || programTypeId) {
      filters.courses = {
        some: {
          status: "active",
          // If disciplineId is present, it already implies stream and avoids over-constraining.
          ...(!disciplineId && streamId && { discipline: { streamId } }),
          ...(disciplineId && { disciplineId }),
          ...(studyLevelId && { studyLevelId }),
          ...(programTypeId && { programTypeId }),
        },
      };
    }

    const colleges = await prisma.college.findMany({
      where: filters,
      include: {
        university: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        campuses: {
          where: { isMainCampus: true, status: "active" },
          take: 1,
          select: { city: true, state: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return res
      .status(200)
      .json(ApiResponse.success("Colleges fetched successfully", colleges));
  }

  static async getCollegeById(req: Request, res: Response) {
    const id = normalizeStringParam(req.params.id);

    const college = await prisma.college.findUnique({
      where: { id },
      include: PUBLIC_COLLEGE_INCLUDES,
    });

    if (!college) {
      throw new NotFoundError("College not found");
    }

    const { settings, ...publicData } = college as any;

    return res
      .status(200)
      .json(ApiResponse.success("College fetched successfully", publicData));
  }

  static async getCollegeSection(req: Request, res: Response) {
    const { collegeId, sectionName: sectionIdentifier } =
      publicCollegeSchemas.sectionParam.parse(req.params);

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { profileSections: true },
    });

    if (!college) {
      throw new NotFoundError("College not found");
    }

    const profileSections =
      (college.profileSections as Record<string, unknown> | null) || {};

    const matchedSection = findSectionByIdentifier(
      profileSections,
      sectionIdentifier,
    );

    if (!matchedSection) {
      throw new NotFoundError("Section not found");
    }

    const sectionEnabled = (matchedSection.section as { enabled?: unknown })
      .enabled;

    if (typeof sectionEnabled === "boolean" && !sectionEnabled) {
      throw new NotFoundError("Section not found");
    }

    return res.status(200).json(
      ApiResponse.success("College section fetched successfully", {
        sectionName: matchedSection.sectionKey,
        sectionId: sectionIdentifier,
        sectionKey: matchedSection.sectionKey,
        data: matchedSection.section,
      }),
    );
  }

  static async getCollegeSummary(req: Request, res: Response) {
    const { collegeId } = publicCollegeSchemas.collegeIdParam.parse(req.params);
    const filters = publicCollegeSchemas.summaryQuery.parse(req.query);

    const college = await prisma.college.findFirst({
      where: {
        id: collegeId,
        status: "active",
        ...(filters.universityId ? { universityId: filters.universityId } : {}),
      },
      select: PUBLIC_COLLEGE_SUMMARY_SELECT,
    });

    if (!college) {
      throw new NotFoundError("College not found");
    }

    const courseWhere: any = {
      collegeId,
      status: "active",
      ...(!filters.disciplineId && filters.streamId
        ? { discipline: { streamId: filters.streamId } }
        : {}),
      ...(filters.disciplineId ? { disciplineId: filters.disciplineId } : {}),
      ...(filters.studyLevelId ? { studyLevelId: filters.studyLevelId } : {}),
      ...(filters.programTypeId
        ? { programTypeId: filters.programTypeId }
        : {}),
    };

    const course = await prisma.course.findFirst({
      where: courseWhere,
      select: PUBLIC_COURSE_SUMMARY_SELECT,
      orderBy: { createdAt: "asc" },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const profileSections =
      (college.profileSections as Record<string, unknown> | null) || {};
    const tabListing = Object.entries(profileSections)
      .filter(([, sectionValue]) => {
        if (
          sectionValue &&
          typeof sectionValue === "object" &&
          !Array.isArray(sectionValue) &&
          "enabled" in sectionValue
        ) {
          return (sectionValue as { enabled?: unknown }).enabled !== false;
        }

        return true;
      })
      .map(([sectionKey, sectionValue]) => {
        if (
          sectionValue &&
          typeof sectionValue === "object" &&
          !Array.isArray(sectionValue) &&
          typeof (sectionValue as { id?: unknown }).id === "string"
        ) {
          return (sectionValue as { id: string }).id;
        }

        return sectionKey;
      });

    const { profileSections: _profileSections, ...collegeMeta } =
      college as any;

    return res.status(200).json(
      ApiResponse.success("College summary fetched successfully", {
        college: {
          ...collegeMeta,
          location: {
            address: college.address,
            city: college.city,
            state: college.state,
            district: college.district,
            pinCode: college.pinCode,
          },
        },
        course,
        tabListing,
      }),
    );
  }

  static async getCollegeBySlug(req: Request, res: Response) {
    const slug = normalizeStringParam(req.params.slug);

    const college = await prisma.college.findUnique({
      where: { slug },
      include: PUBLIC_COLLEGE_INCLUDES,
    });

    if (!college) {
      throw new NotFoundError("College not found");
    }

    // Hide sensitive data
    const { settings, ...publicData } = college as any;

    return res
      .status(200)
      .json(ApiResponse.success("College fetched successfully", publicData));
  }

  static async getCollegeCourses(req: Request, res: Response) {
    const slug = normalizeStringParam(req.params.slug);

    const college = await prisma.college.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!college) throw new NotFoundError("College not found");

    const courses = await prisma.course.findMany({
      where: { collegeId: college.id, status: "active" },
      include: {
        discipline: { include: { stream: true } },
        studyLevel: true,
        programType: true,
      },
    });

    return res
      .status(200)
      .json(ApiResponse.success("Courses fetched successfully", courses));
  }
}
