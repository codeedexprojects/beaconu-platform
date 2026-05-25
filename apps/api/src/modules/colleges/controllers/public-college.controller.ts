import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";

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

export class PublicCollegeController {
  static async getColleges(req: Request, res: Response) {
    const { streamId, disciplineId, studyLevelId, programTypeId } = req.query;

    const filters: any = { status: "active" };

    if (streamId || disciplineId || studyLevelId || programTypeId) {
      filters.courses = {
        some: {
          status: "active",
          ...(streamId && { discipline: { streamId: streamId as string } }),
          ...(disciplineId && { disciplineId: disciplineId as string }),
          ...(studyLevelId && { studyLevelId: studyLevelId as string }),
          ...(programTypeId && { programTypeId: programTypeId as string }),
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

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

  static async getCollegeBySlug(req: Request, res: Response) {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

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
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

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
