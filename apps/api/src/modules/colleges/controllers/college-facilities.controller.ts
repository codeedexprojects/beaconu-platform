import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError, BadRequestError } from "@/shared/errors";
import { generateSlug } from "@/shared/utils";

export class CollegeFacilitiesController {
  // ── Hostels Occupancy Inventory ────────────────────────────────────────────

  static async listHostels(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostels = await prisma.hostel.findMany({
      where: { collegeId },
      include: { roomTypes: true },
      orderBy: { createdAt: "desc" },
    });
    return res
      .status(200)
      .json(ApiResponse.success("College hostels list fetched", hostels));
  }

  static async createHostel(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const schema = z.object({
      name: z.string().trim().min(2).max(255),
      hostelType: z.enum(["boys", "girls", "co-ed"]),
      isOnCampus: z.boolean().default(true),
      distanceFromCampus: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      totalBeds: z.number().int().positive().optional().nullable(),
      roomTypes: z
        .array(
          z.object({
            name: z.string().trim().min(2),
            totalBeds: z.number().int().positive(),
            annualPlanPrice: z.number().positive().optional(),
            securityDeposit: z.number().nonnegative().optional(),
          }),
        )
        .optional(),
    });

    const body = schema.parse(req.body);
    const slug = generateSlug(body.name);

    const result = await prisma.$transaction(async (tx) => {
      const hostel = await tx.hostel.create({
        data: {
          collegeId,
          name: body.name,
          slug,
          hostelType: body.hostelType,
          isOnCampus: body.isOnCampus,
          distanceFromCampus: body.distanceFromCampus || null,
          description: body.description || null,
          totalBeds: body.totalBeds || 0,
          status: "active",
        },
      });

      if (body.roomTypes && body.roomTypes.length > 0) {
        await tx.hostelRoomType.createMany({
          data: body.roomTypes.map((rt, idx) => ({
            hostelId: hostel.id,
            name: rt.name,
            totalBeds: rt.totalBeds,
            availableBeds: rt.totalBeds,
            annualPlanPrice: rt.annualPlanPrice || 0,
            securityDeposit: rt.securityDeposit || 0,
            sortOrder: idx,
          })),
        });
      }

      return tx.hostel.findUnique({
        where: { id: hostel.id },
        include: { roomTypes: true },
      });
    });

    return res
      .status(201)
      .json(ApiResponse.success("Hostel facility provisioned", result));
  }

  static async deleteHostel(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const hostel = await prisma.hostel.findFirst({
      where: { id, collegeId },
    });
    if (!hostel) {
      throw new NotFoundError("Hostel facility not found");
    }

    await prisma.hostel.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(ApiResponse.success("Hostel facility removed successfully", null));
  }

  // ── Commute transit routes ──────────────────────────────────────────────────

  static async listRoutes(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const routes = await prisma.commuteRoute.findMany({
      where: { collegeId },
      include: { stops: true, buses: true },
      orderBy: { createdAt: "desc" },
    });
    return res
      .status(200)
      .json(ApiResponse.success("Commuter routes listed", routes));
  }

  static async createRoute(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const schema = z.object({
      name: z.string().trim().min(2).max(255),
      description: z.string().optional().nullable(),
      stops: z
        .array(
          z.object({
            stopName: z.string().trim().min(2),
            landmark: z.string().optional().nullable(),
            stopOrder: z.number().int().nonnegative(),
          }),
        )
        .optional(),
      buses: z
        .array(
          z.object({
            busNumber: z.string().trim().min(2),
            busName: z.string().optional().nullable(),
            totalSeats: z.number().int().positive(),
            driverName: z.string().optional().nullable(),
            driverPhone: z.string().optional().nullable(),
            monthlyFee: z.number().positive().optional(),
          }),
        )
        .optional(),
    });

    const body = schema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const route = await tx.commuteRoute.create({
        data: {
          collegeId,
          name: body.name,
          description: body.description || null,
          isActive: true,
        },
      });

      if (body.stops && body.stops.length > 0) {
        await tx.commuteRouteStop.createMany({
          data: body.stops.map((stop) => ({
            routeId: route.id,
            stopName: stop.stopName,
            landmark: stop.landmark || null,
            stopOrder: stop.stopOrder,
          })),
        });
      }

      if (body.buses && body.buses.length > 0) {
        await tx.commuteBus.createMany({
          data: body.buses.map((bus) => ({
            routeId: route.id,
            busNumber: bus.busNumber,
            busName: bus.busName || null,
            totalSeats: bus.totalSeats,
            availableSeats: bus.totalSeats,
            driverName: bus.driverName || null,
            driverPhone: bus.driverPhone || null,
            monthlyFee: bus.monthlyFee || 0,
            isActive: true,
          })),
        });
      }

      return tx.commuteRoute.findUnique({
        where: { id: route.id },
        include: { stops: true, buses: true },
      });
    });

    return res
      .status(201)
      .json(ApiResponse.success("Commuter route registered", result));
  }

  static async deleteRoute(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const route = await prisma.commuteRoute.findFirst({
      where: { id, collegeId },
    });
    if (!route) {
      throw new NotFoundError("Commuter transit route not found");
    }

    await prisma.commuteRoute.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(ApiResponse.success("Commuter transit route removed", null));
  }
}
