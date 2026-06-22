import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError, BadRequestError } from "@/shared/errors";
import { generateSlug } from "@/shared/utils";
import { HostelService } from "../services/hostel.service";
import {
  createHostelSchema,
  updateHostelSchema,
  roomTypeSchema,
  messPlanSchema,
  addonServiceSchema,
} from "../validators/hostel.validator";

export class CollegeFacilitiesController {
  // ── Hostels Occupancy Inventory ────────────────────────────────────────────

  static async listHostels(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostels = await prisma.hostel.findMany({
      where: { collegeId },
      include: {
        roomTypes: { where: { isActive: true } },
        messPlans: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        addonServices: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const serialized = hostels.map((hostel) => ({
      ...hostel,
      avgRating: Number(hostel.avgRating),
      roomTypes: hostel.roomTypes.map((rt) => ({
        ...rt,
        annualPlanPrice:
          rt.annualPlanPrice != null ? Number(rt.annualPlanPrice) : null,
        monthlyPlanPrice:
          rt.monthlyPlanPrice != null ? Number(rt.monthlyPlanPrice) : null,
        admissionFee: Number(rt.admissionFee),
        securityDeposit: Number(rt.securityDeposit),
      })),
      messPlans: hostel.messPlans.map((mp) => ({
        ...mp,
        priceMonthly: Number(mp.priceMonthly),
      })),
    }));
    return res
      .status(200)
      .json(ApiResponse.success("College hostels list fetched", serialized));
  }

  static async createHostel(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const body = createHostelSchema.parse(req.body);
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
          coverImageUrl: body.coverImageUrl || null,
          wardenInfo: body.wardenInfo ?? {},
          amenities: body.amenities ?? [],
          rules: body.rules ?? [],
          locationInfo: body.locationInfo ?? {},
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
            monthlyPlanPrice: rt.monthlyPlanPrice || 0,
            securityDeposit: rt.securityDeposit || 0,
            sortOrder: idx,
          })),
        });
      }

      if (body.messPlans && body.messPlans.length > 0) {
        await tx.hostelMessPlan.createMany({
          data: body.messPlans.map((mp, idx) => ({
            hostelId: hostel.id,
            name: mp.name,
            description: mp.description || null,
            mealsIncluded: mp.mealsIncluded,
            priceMonthly: mp.priceMonthly,
            duration: mp.duration,
            isCompulsory: mp.isCompulsory,
            dietaryOptions: mp.dietaryOptions,
            sortOrder: idx,
          })),
        });
      }

      if (body.addonServices && body.addonServices.length > 0) {
        await tx.hostelAddonService.createMany({
          data: body.addonServices.map((service, idx) => ({
            hostelId: hostel.id,
            serviceType: service.serviceType,
            name: service.name,
            description: service.description || null,
            isOptional: service.isOptional,
            plans: service.plans,
            notes: service.notes || null,
            sortOrder: idx,
          })),
        });
      }

      return tx.hostel.findUnique({
        where: { id: hostel.id },
        include: { roomTypes: true, messPlans: true, addonServices: true },
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

  static async getHostelDetail(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const hostel = await HostelService.getAdminHostelDetail(id, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Hostel facility fetched", hostel));
  }

  static async updateHostel(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const body = updateHostelSchema.parse(req.body);
    const hostel = await HostelService.updateHostel(id, collegeId, body);
    return res
      .status(200)
      .json(ApiResponse.success("Hostel facility updated", hostel));
  }

  static async createRoomType(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;

    const body = roomTypeSchema.parse(req.body);
    const roomType = await HostelService.createRoomType(hostelId, collegeId, {
      ...body,
      availableBeds: body.availableBeds ?? body.totalBeds,
    });
    return res
      .status(201)
      .json(ApiResponse.success("Room type added", roomType));
  }

  static async updateRoomType(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const body = roomTypeSchema.partial().parse(req.body);
    const roomType = await HostelService.updateRoomType(
      id,
      hostelId,
      collegeId,
      body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Room type updated", roomType));
  }

  static async deleteRoomType(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await HostelService.deleteRoomType(id, hostelId, collegeId);
    return res.status(200).json(ApiResponse.success("Room type removed", null));
  }

  static async createMessPlan(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;

    const body = messPlanSchema.parse(req.body);
    const messPlan = await HostelService.createMessPlan(
      hostelId,
      collegeId,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Mess plan added", messPlan));
  }

  static async updateMessPlan(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const body = messPlanSchema.partial().parse(req.body);
    const messPlan = await HostelService.updateMessPlan(
      id,
      hostelId,
      collegeId,
      body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Mess plan updated", messPlan));
  }

  static async deleteMessPlan(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await HostelService.deleteMessPlan(id, hostelId, collegeId);
    return res.status(200).json(ApiResponse.success("Mess plan removed", null));
  }

  static async createAddonService(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;

    const body = addonServiceSchema.parse(req.body);
    const addonService = await HostelService.createAddonService(
      hostelId,
      collegeId,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Addon service added", addonService));
  }

  static async updateAddonService(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const body = addonServiceSchema.partial().parse(req.body);
    const addonService = await HostelService.updateAddonService(
      id,
      hostelId,
      collegeId,
      body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Addon service updated", addonService));
  }

  static async deleteAddonService(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const hostelIdParam = req.params.hostelId;
    const hostelId = Array.isArray(hostelIdParam)
      ? hostelIdParam[0]
      : hostelIdParam;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await HostelService.deleteAddonService(id, hostelId, collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Addon service removed", null));
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
      isVerified: z.boolean().optional(),
      conductPolicy: z
        .array(
          z.object({
            title: z.string().trim().min(1),
            description: z.string().trim().min(1),
          }),
        )
        .optional(),
      stops: z
        .array(
          z.object({
            stopName: z.string().trim().min(2),
            landmark: z.string().optional().nullable(),
            morningTime: z.coerce.date().optional().nullable(),
            eveningTime: z.coerce.date().optional().nullable(),
            isPickupPoint: z.boolean().optional(),
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
            busModel: z.string().optional().nullable(),
            paymentStructureNotes: z.string().optional().nullable(),
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
          isVerified: body.isVerified || false,
          conductPolicy: body.conductPolicy || [],
        },
      });

      if (body.stops && body.stops.length > 0) {
        await tx.commuteRouteStop.createMany({
          data: body.stops.map((stop) => ({
            routeId: route.id,
            stopName: stop.stopName,
            landmark: stop.landmark || null,
            morningTime: stop.morningTime || null,
            eveningTime: stop.eveningTime || null,
            isPickupPoint: stop.isPickupPoint ?? true,
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
            busModel: bus.busModel || null,
            paymentStructureNotes: bus.paymentStructureNotes || null,
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
