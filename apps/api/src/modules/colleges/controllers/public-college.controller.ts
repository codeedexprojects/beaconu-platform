import { Request, Response } from "express";
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
  blinkUsers: {
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      phoneNumber: true,
    },
  },
  _count: {
    select: { courses: true },
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

function normalizeStringParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const TAB_LABELS: Record<string, string> = {
  college_overview: "College Overview",
  course_info: "Course Info",
  admission_policy: "Admission Policy",
  placements: "Placements",
  fees: "Fees",
  financial_aid: "Financial Aid",
  student_housing: "Student Housing",
  exam_policy: "Exam Policy",
  faculty: "Faculty",
  review: "Review",
  commute: "Commute",
  library: "Library",
  clubs_associations: "Club & Associations",
  student_code_of_conduct: "Student Code of Conduct",
  happenings: "Happenings",
  institutions_across_world: "Institutions Across the World",
  alliance: "Alliance",
  other_courses_offered: "Other Courses Offered",
  demo_graphics: "Demographics",
};

function toIdStyleTabName(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function toTabDisplayName(tabId: string): string {
  return (
    TAB_LABELS[tabId] ??
    tabId
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

function buildTabList(profileSections: Record<string, unknown>) {
  const seen = new Set<string>();
  const tabs: { id: string; name: string }[] = [];

  for (const [tabKey, tabValue] of Object.entries(profileSections)) {
    if (
      isRecord(tabValue) &&
      typeof tabValue.enabled === "boolean" &&
      !tabValue.enabled
    ) {
      continue;
    }

    const tabIdRaw =
      isRecord(tabValue) &&
      typeof tabValue.id === "string" &&
      tabValue.id.trim() !== ""
        ? tabValue.id
        : tabKey;

    const tabId = toIdStyleTabName(tabIdRaw);

    if (tabId !== "" && !seen.has(tabId)) {
      seen.add(tabId);
      tabs.push({ id: tabId, name: toTabDisplayName(tabId) });
    }
  }

  return tabs;
}

function buildPublicProfileResponse(college: any) {
  const totalCourses = college._count?.courses ?? 0;
  const instituteType = college.university?.universityType?.name ?? null;
  const campusAmbassadors = (college.blinkUsers ?? []).map((u: any) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    avatarUrl: u.avatarUrl,
    phoneNumber: u.phoneNumber,
  }));

  const profileSections = isRecord(college.profileSections)
    ? (college.profileSections as Record<string, unknown>)
    : {};
  const tabs = buildTabList(profileSections);

  const {
    settings: _s,
    blinkUsers: _bu,
    _count,
    registrationTabs: _rt,
    ...collegeDetails
  } = college;

  return {
    collegeDetails: {
      ...collegeDetails,
      profileSections,
    },
    tabs,
    totalCourses,
    instituteType,
    campusAmbassadors,
  };
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
      sortBy,
      sort,
      filter,
      state,
      district,
    } = publicCollegeSchemas.listQuery.parse(req.query);

    const sortOption = sortBy ?? sort ?? filter;
    const isFeeSort =
      sortOption === "fees_high_to_low" || sortOption === "fees_low_to_high";

    const filters: any = { status: "active" };

    if (universityId) {
      filters.universityId = universityId as string;
    }

    if (state) {
      filters.state = { equals: state, mode: "insensitive" };
    }

    if (district) {
      filters.district = { equals: district, mode: "insensitive" };
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

    let colleges = (await prisma.college.findMany({
      where: filters,
      select: {
        id: true,
        universityId: true,
        name: true,
        slug: true,
        code: true,
        domain: true,
        logoUrl: true,
        coverImageUrl: true,
        state: true,
        city: true,
        district: true,
        address: true,
        pinCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
          orderBy: [{ isMainCampus: "desc" }, { name: "asc" }],
          select: {
            id: true,
            collegeId: true,
            name: true,
            address: true,
            city: true,
            state: true,
            pinCode: true,
            latitude: true,
            longitude: true,
            isMainCampus: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ...(isFeeSort
          ? {
              feeStructures: {
                where: { isActive: true },
                select: { amount: true },
              },
            }
          : {}),
      },
      orderBy:
        sortOption === "popularity"
          ? [{ avgRating: "desc" }, { reviewCount: "desc" }, { name: "asc" }]
          : { name: "asc" },
    })) as any[];

    if (isFeeSort) {
      const direction = sortOption === "fees_high_to_low" ? "desc" : "asc";

      const getMinActiveFee = (college: any) => {
        const structures = Array.isArray(college.feeStructures)
          ? college.feeStructures
          : [];

        if (structures.length === 0) return null;

        const amounts = structures
          .map((fs: any) => Number(fs.amount))
          .filter((value: number) => Number.isFinite(value));

        if (amounts.length === 0) return null;

        return Math.min(...amounts);
      };

      colleges = colleges
        .sort((a, b) => {
          const aFee = getMinActiveFee(a);
          const bFee = getMinActiveFee(b);

          if (aFee === null && bFee === null)
            return a.name.localeCompare(b.name);
          if (aFee === null) return 1;
          if (bFee === null) return -1;

          const delta = direction === "desc" ? bFee - aFee : aFee - bFee;

          if (delta !== 0) return delta;

          return a.name.localeCompare(b.name);
        })
        .map(({ feeStructures: _feeStructures, ...college }) => college);
    }

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

    return res
      .status(200)
      .json(
        ApiResponse.success(
          "College fetched successfully",
          buildPublicProfileResponse(college),
        ),
      );
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

  static async getCollegeBySlug(req: Request, res: Response) {
    const slug = normalizeStringParam(req.params.slug);

    const college = await prisma.college.findUnique({
      where: { slug },
      include: PUBLIC_COLLEGE_INCLUDES,
    });

    if (!college) {
      throw new NotFoundError("College not found");
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(
          "College fetched successfully",
          buildPublicProfileResponse(college),
        ),
      );
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

    const mappedCourses = courses.map((course: any) => {
      const rawMeta =
        course.metadata && typeof course.metadata === "object"
          ? (course.metadata as Record<string, unknown>)
          : {};
      const tabStrings: string[] = Array.isArray(rawMeta.tabs)
        ? (rawMeta.tabs as unknown[]).filter(
            (v): v is string => typeof v === "string",
          )
        : [];
      const tabs = tabStrings.map((id) => ({
        id,
        name: toTabDisplayName(id),
      }));
      const { tabData: _td, tabs: _ts, ...restMeta } = rawMeta;
      return { ...course, metadata: { ...restMeta, tabs } };
    });

    return res
      .status(200)
      .json(ApiResponse.success("Courses fetched successfully", mappedCourses));
  }
}
