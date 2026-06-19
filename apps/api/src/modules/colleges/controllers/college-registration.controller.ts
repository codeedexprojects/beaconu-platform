import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CollegeRegistrationService } from "../services/college-registration.service";
import {
  updateCollegeProfileSchema,
  setSubdomainSchema,
  createCampusSchema,
  updateCampusSchema,
  createCourseSchema,
  updateCourseSchema,
} from "../validators/college-registration.validator";
import { z } from "zod";

const happeningsSectionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  categories: z.union([z.string(), z.array(z.string())]).optional(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatStudentCodeOfConductSection(section: unknown) {
  if (!isRecord(section)) return section;

  const rules = Array.isArray(section.rules)
    ? section.rules
        .filter((rule): rule is Record<string, unknown> => isRecord(rule))
        .map((rule, index) => ({
          number:
            typeof rule.number === "number" && Number.isFinite(rule.number)
              ? rule.number
              : index + 1,
          rule: typeof rule.rule === "string" ? rule.rule : "",
        }))
    : [];

  return {
    id:
      typeof section.id === "string" && section.id.trim() !== ""
        ? section.id
        : "student_code_of_conduct",
    tab:
      typeof section.tab === "string" && section.tab.trim() !== ""
        ? section.tab
        : "student_code_of_conduct",
    section_title:
      typeof section.section_title === "string" ? section.section_title : "",
    enabled: typeof section.enabled === "boolean" ? section.enabled : true,
    rules,
  };
}

function parseTimingRange(value: unknown): { start: string; end: string } {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { start: "", end: "" };

  const parts = text.split("-").map((item) => item.trim());
  if (parts.length < 2) return { start: text, end: "" };

  return { start: parts[0], end: parts.slice(1).join(" - ") };
}

function parseTransportAmount(value: unknown): {
  amount: string;
  currency: string;
  period: string;
} {
  const text = typeof value === "string" ? value : "";
  const amountMatch = text.match(/\d[\d,]*/);
  const periodMatch = text.match(/\/\s*([A-Za-z]+)/);

  return {
    amount: amountMatch ? amountMatch[0].replace(/,/g, "") : "",
    currency: text.includes("₹") ? "INR" : "",
    period: periodMatch ? periodMatch[1] : "",
  };
}

function formatStopType(index: number, total: number): string {
  if (index === 0) return "pickup";
  if (index === total - 1) return "destination";
  return "intermediate";
}

function formatCommuteSection(section: unknown) {
  if (!isRecord(section)) return section;

  const pickupPoints = Array.isArray(section.pickup_points)
    ? section.pickup_points
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

  const sourceRoutes = Array.isArray(section.routes)
    ? section.routes.filter((item): item is Record<string, unknown> =>
        isRecord(item),
      )
    : [];

  const groupedRoutes = pickupPoints.map((pickupPoint) => {
    const details = sourceRoutes
      .filter((route) => {
        const routePickup =
          typeof route.pickup_point === "string" ? route.pickup_point : "";
        return routePickup.trim().toLowerCase() === pickupPoint.toLowerCase();
      })
      .map((route, index) => {
        const routeId =
          typeof route.id === "string" && route.id.trim() !== ""
            ? route.id
            : `route_${index + 1}`;

        const timings = Array.isArray(route.timings)
          ? route.timings.filter((item): item is Record<string, unknown> =>
              isRecord(item),
            )
          : [];

        const morningTiming = timings.find(
          (item) =>
            typeof item.label === "string" &&
            item.label.toLowerCase().includes("morning"),
        );
        const eveningTiming = timings.find(
          (item) =>
            typeof item.label === "string" &&
            item.label.toLowerCase().includes("evening"),
        );

        const morningRange = parseTimingRange(morningTiming?.time);
        const eveningRange = parseTimingRange(eveningTiming?.time);

        const fee = isRecord(route.transport_fee)
          ? route.transport_fee
          : ({} as Record<string, unknown>);
        const feeAmount = parseTransportAmount(fee.amount);

        const busInfo = isRecord(route.bus_information)
          ? route.bus_information
          : ({} as Record<string, unknown>);

        const morningStops = Array.isArray(route.morning_pickup_points)
          ? route.morning_pickup_points.filter(
              (item): item is Record<string, unknown> => isRecord(item),
            )
          : [];
        const eveningStops = Array.isArray(route.evening_dropoff_points)
          ? route.evening_dropoff_points.filter(
              (item): item is Record<string, unknown> => isRecord(item),
            )
          : [];

        return {
          id: routeId,
          name: typeof route.route_name === "string" ? route.route_name : "",
          icon: "https://cdn.iconsdb.example.com/icons/bus-route-orange.png",
          via: typeof route.via === "string" ? route.via : "",
          verified:
            typeof route.status === "string"
              ? route.status.toLowerCase() === "verified"
              : false,
          timings: {
            morning: {
              label: "MORNING",
              icon: "https://cdn.iconsdb.example.com/icons/sun-orange.png",
              start_time: morningRange.start,
              end_time: morningRange.end,
            },
            evening: {
              label: "EVENING",
              icon: "https://cdn.iconsdb.example.com/icons/moon-purple.png",
              start_time: eveningRange.start,
              end_time: eveningRange.end,
            },
          },
          transport_fee: {
            icon: "https://cdn.iconsdb.example.com/icons/payment-card.png",
            label: "Transport Fee",
            amount: feeAmount.amount,
            currency: feeAmount.currency,
            period: feeAmount.period,
            payment_structure:
              typeof fee.payment_structure === "string"
                ? fee.payment_structure
                : "",
          },
          bus_information: {
            label: "BUS INFORMATION",
            registration_number:
              typeof busInfo.registration_number === "string"
                ? busInfo.registration_number
                : "",
            model: typeof busInfo.model === "string" ? busInfo.model : "",
            seat_capacity:
              typeof busInfo.seats === "number" &&
              Number.isFinite(busInfo.seats)
                ? busInfo.seats
                : null,
          },
          morning_pickup_points: {
            title: "Morning Pickup Points & Timings",
            icon: "https://cdn.iconsdb.example.com/icons/sun-orange.png",
            stops: morningStops.map((stop, stopIndex) => ({
              name: typeof stop.point === "string" ? stop.point : "",
              subtitle: typeof stop.landmark === "string" ? stop.landmark : "",
              time: typeof stop.time === "string" ? stop.time : "",
              type: formatStopType(stopIndex, morningStops.length),
            })),
          },
          evening_dropoff_points: {
            title: "Evening Drop-off Points & Timings",
            icon: "https://cdn.iconsdb.example.com/icons/moon-purple.png",
            stops: eveningStops.map((stop, stopIndex) => ({
              name: typeof stop.point === "string" ? stop.point : "",
              subtitle: typeof stop.landmark === "string" ? stop.landmark : "",
              time: typeof stop.time === "string" ? stop.time : "",
              type: formatStopType(stopIndex, eveningStops.length),
            })),
          },
        };
      });

    return {
      route_name: pickupPoint,
      details,
    };
  });

  const rulesPayload = isRecord(section.rules_and_code_of_conduct)
    ? section.rules_and_code_of_conduct
    : ({} as Record<string, unknown>);

  const rules = Array.isArray(rulesPayload.rules)
    ? rulesPayload.rules
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          heading: typeof item.title === "string" ? item.title : "",
          description:
            typeof item.description === "string" ? item.description : "",
        }))
    : [];

  return {
    id: typeof section.id === "string" ? section.id : "commute",
    title: typeof section.title === "string" ? section.title : "Commute",
    enabled: typeof section.enabled === "boolean" ? section.enabled : true,
    routes: groupedRoutes,
    rules_and_code_of_conduct: {
      title:
        typeof rulesPayload.title === "string"
          ? rulesPayload.title
          : "Rules & Code of Conduct",
      subtitle:
        typeof rulesPayload.subtitle === "string" ? rulesPayload.subtitle : "",
      icon: "https://cdn.iconsdb.example.com/icons/gavel-orange.png",
      intro: typeof rulesPayload.intro === "string" ? rulesPayload.intro : "",
      rules,
    },
  };
}

function slugifyCategory(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeIsoLikeDate(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return parsed.toISOString().slice(0, 10);
}

function formatHappeningsSection(section: unknown) {
  if (!isRecord(section)) return section;

  const rawFilters = isRecord(section.filters)
    ? section.filters
    : ({} as Record<string, unknown>);
  const selectedCategories = Array.isArray(rawFilters.categories)
    ? rawFilters.categories
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

  const rawHappenings = Array.isArray(section.happenings)
    ? section.happenings.filter((item): item is Record<string, unknown> =>
        isRecord(item),
      )
    : [];

  const categoryPool = Array.from(
    new Set(
      selectedCategories.concat(
        rawHappenings
          .map((item) =>
            typeof item.category === "string" ? item.category : "",
          )
          .filter(Boolean),
      ),
    ),
  );

  const happenings = rawHappenings.map((item, index) => ({
    id:
      typeof item.id === "string" && item.id.trim() !== ""
        ? item.id
        : `happening_${String(index + 1).padStart(3, "0")}`,
    date: normalizeIsoLikeDate(item.date),
    link: typeof item.link === "string" ? item.link : "",
    image: typeof item.image === "string" ? item.image : "",
    title: typeof item.title === "string" ? item.title : "",
    category: typeof item.category === "string" ? item.category : "",
    description: typeof item.description === "string" ? item.description : "",
    share_enabled:
      typeof item.share_enabled === "boolean" ? item.share_enabled : true,
  }));

  const pagination = isRecord(section.pagination)
    ? section.pagination
    : ({} as Record<string, unknown>);

  return {
    id: typeof section.id === "string" ? section.id : "happenings",
    title: typeof section.title === "string" ? section.title : "Happenings",
    enabled: typeof section.enabled === "boolean" ? section.enabled : true,
    filters: {
      title: "Filter Happenings",
      subtitle: "Select categories to display",
      categories: categoryPool.map((category) => ({
        label: category,
        value: slugifyCategory(category),
        selected: selectedCategories.some(
          (selected) => selected.toLowerCase() === category.toLowerCase(),
        ),
      })),
    },
    happenings,
    pagination: {
      current_page: typeof pagination.page === "number" ? pagination.page : 1,
      per_page: typeof pagination.limit === "number" ? pagination.limit : 10,
      total_items:
        typeof pagination.total === "number"
          ? pagination.total
          : happenings.length,
      total_pages:
        typeof pagination.totalPages === "number" ? pagination.totalPages : 1,
      has_next_page:
        typeof pagination.hasNextPage === "boolean"
          ? pagination.hasNextPage
          : false,
      has_previous_page:
        typeof pagination.hasPreviousPage === "boolean"
          ? pagination.hasPreviousPage
          : false,
    },
  };
}

export class CollegeRegistrationController {
  // ── Profile ────────────────────────────────────────────────────────────────

  static async getProfile(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.getProfile(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("College profile fetched", result));
  }

  static async getProfileSections(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result =
      await CollegeRegistrationService.getProfileSections(collegeId);

    return res
      .status(200)
      .json(ApiResponse.success("College profile sections fetched", result));
  }

  static async getProfileSection(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const tabIdParam = req.params.tabId;
    const tabId = Array.isArray(tabIdParam) ? tabIdParam[0] : tabIdParam;
    const query = happeningsSectionQuerySchema.parse(req.query);
    const result = await CollegeRegistrationService.getProfileSection(
      collegeId,
      tabId,
      query,
    );
    const responseData =
      tabId === "student_code_of_conduct"
        ? formatStudentCodeOfConductSection(result)
        : tabId === "commute"
          ? formatCommuteSection(result)
          : tabId === "happenings"
            ? formatHappeningsSection(result)
            : result;

    return res.status(200).json(
      ApiResponse.success("College section fetched successfully", {
        sectionName: tabId,
        sectionId: tabId,
        sectionKey: tabId,
        data: responseData,
      }),
    );
  }

  static async updateProfile(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = updateCollegeProfileSchema.parse(req.body);
    const result = await CollegeRegistrationService.updateProfile(
      collegeId,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("College profile updated", result));
  }

  static async checkSubdomain(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const slugParam = req.params.slug;
    const slug = (Array.isArray(slugParam) ? slugParam[0] : slugParam)
      .toLowerCase()
      .trim();
    const result = await CollegeRegistrationService.checkSubdomainAvailability(
      slug,
      collegeId,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Subdomain availability checked", result));
  }

  static async setSubdomain(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = setSubdomainSchema.parse(req.body);
    const result = await CollegeRegistrationService.setSubdomain(
      collegeId,
      data,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Subdomain updated successfully", result));
  }

  static async finalize(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.finalize(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("College portal is now live!", result));
  }

  // ── Campuses ───────────────────────────────────────────────────────────────

  static async listCampuses(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.listCampuses(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Campuses fetched", result));
  }

  static async addCampus(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = createCampusSchema.parse(req.body);
    const result = await CollegeRegistrationService.addCampus(collegeId, data);
    return res.status(201).json(ApiResponse.success("Campus added", result));
  }

  static async updateCampus(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const campusId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const data = updateCampusSchema.parse(req.body);
    const result = await CollegeRegistrationService.updateCampus(
      campusId,
      collegeId,
      data,
    );
    return res.status(200).json(ApiResponse.success("Campus updated", result));
  }

  static async deleteCampus(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const campusId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const result = await CollegeRegistrationService.removeCampus(
      campusId,
      collegeId,
    );
    return res.status(200).json(ApiResponse.success("Campus removed", result));
  }

  // ── Courses ────────────────────────────────────────────────────────────────

  static async listCourses(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.listCourses(collegeId);
    return res.status(200).json(ApiResponse.success("Courses fetched", result));
  }

  static async addCourse(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const data = createCourseSchema.parse(req.body);
    const result = await CollegeRegistrationService.addCourse(collegeId, data);
    return res.status(201).json(ApiResponse.success("Course added", result));
  }

  static async updateCourse(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const courseId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const data = updateCourseSchema.parse(req.body);
    const result = await CollegeRegistrationService.updateCourse(
      courseId,
      collegeId,
      data,
    );
    return res.status(200).json(ApiResponse.success("Course updated", result));
  }

  static async deleteCourse(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const courseId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const result = await CollegeRegistrationService.removeCourse(
      courseId,
      collegeId,
    );
    return res.status(200).json(ApiResponse.success("Course removed", result));
  }

  // ── Lookups ────────────────────────────────────────────────────────────────

  static async getStreams(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await CollegeRegistrationService.getStreams(collegeId);
    return res.status(200).json(ApiResponse.success("Streams fetched", result));
  }

  static async getStudyLevels(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getStudyLevels();
    return res
      .status(200)
      .json(ApiResponse.success("Study levels fetched", result));
  }

  static async getProgramTypes(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getProgramTypes();
    return res
      .status(200)
      .json(ApiResponse.success("Program types fetched", result));
  }

  static async getUniversities(_req: Request, res: Response) {
    const result = await CollegeRegistrationService.getUniversities();
    return res
      .status(200)
      .json(ApiResponse.success("Universities fetched", result));
  }
}
