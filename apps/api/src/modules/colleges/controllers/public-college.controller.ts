import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";

export class PublicCollegeController {
  static async getCollegeBySlug(req: Request, res: Response) {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    const college = await prisma.college.findUnique({
      where: { slug },
      include: {
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
      },
    });

    if (!college) {
      throw new NotFoundError("College not found");
    }

    // Hide sensitive data
    const { settings, ...publicData } = college;

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
