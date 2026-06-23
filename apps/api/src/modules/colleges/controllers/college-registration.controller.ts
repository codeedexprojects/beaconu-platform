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

function formatCommuteSection(section: unknown) {
  if (!isRecord(section)) return section;

  // ── routes ────────────────────────────────────────────────────────────────
  const routes = Array.isArray(section.routes)
    ? section.routes
        .filter((r): r is Record<string, unknown> => isRecord(r))
        .map((route) => {
          // timings → flat array [{label, time}]
          const timings = Array.isArray(route.timings)
            ? route.timings
                .filter((t): t is Record<string, unknown> => isRecord(t))
                .map((t) => ({
                  label: typeof t.label === "string" ? t.label : "",
                  time: typeof t.time === "string" ? t.time : "",
                }))
            : [];

          // transport_fee → {amount, payment_structure}
          const rawFee = isRecord(route.transport_fee)
            ? (route.transport_fee as Record<string, unknown>)
            : {};
          const transportFee = {
            amount: typeof rawFee.amount === "string" ? rawFee.amount : "",
            payment_structure:
              typeof rawFee.payment_structure === "string"
                ? rawFee.payment_structure
                : "",
          };

          // bus_information → {model, seats, registration_number}
          const rawBus = isRecord(route.bus_information)
            ? (route.bus_information as Record<string, unknown>)
            : {};
          const busInfo = {
            model: typeof rawBus.model === "string" ? rawBus.model : "",
            seats:
              typeof rawBus.seats === "number" && Number.isFinite(rawBus.seats)
                ? rawBus.seats
                : null,
            registration_number:
              typeof rawBus.registration_number === "string"
                ? rawBus.registration_number
                : "",
          };

          // stop normalizer → [{time, point, landmark}]
          const normalizeStops = (arr: unknown[]) =>
            arr
              .filter((s): s is Record<string, unknown> => isRecord(s))
              .map((s) => ({
                time: typeof s.time === "string" ? s.time : "",
                point: typeof s.point === "string" ? s.point : "",
                landmark: typeof s.landmark === "string" ? s.landmark : "",
              }));

          return {
            pickup_point:
              typeof route.pickup_point === "string" ? route.pickup_point : "",
            route_name:
              typeof route.route_name === "string" ? route.route_name : "",
            via: typeof route.via === "string" ? route.via : "",
            status:
              typeof route.status === "string" ? route.status : "UNVERIFIED",
            timings,
            transport_fee: transportFee,
            bus_information: busInfo,
            morning_pickup_points: Array.isArray(route.morning_pickup_points)
              ? normalizeStops(route.morning_pickup_points)
              : [],
            evening_dropoff_points: Array.isArray(route.evening_dropoff_points)
              ? normalizeStops(route.evening_dropoff_points)
              : [],
          };
        })
    : [];

  // ── pickup points ─────────────────────────────────────────────────────────
  const pickupPoints = Array.isArray(section.pickup_points)
    ? section.pickup_points.filter(
        (p): p is string => typeof p === "string" && p.trim() !== "",
      )
    : [];

  const selectedPickupPoint =
    typeof section.selected_pickup_point === "string"
      ? section.selected_pickup_point
      : (pickupPoints[0] ?? "");

  // ── rules & code of conduct ───────────────────────────────────────────────
  const rawRules = isRecord(section.rules_and_code_of_conduct)
    ? (section.rules_and_code_of_conduct as Record<string, unknown>)
    : {};

  const rules = Array.isArray(rawRules.rules)
    ? rawRules.rules
        .filter((r): r is Record<string, unknown> => isRecord(r))
        .map((r) => ({
          title: typeof r.title === "string" ? r.title : "",
          description: typeof r.description === "string" ? r.description : "",
        }))
    : [];

  return {
    id:
      typeof section.id === "string" && section.id.trim() !== ""
        ? section.id
        : "commute",
    tab: typeof section.tab === "string" ? section.tab : "commute",
    enabled: typeof section.enabled === "boolean" ? section.enabled : true,
    pickup_points: pickupPoints,
    selected_pickup_point: selectedPickupPoint,
    routes,
    rules_and_code_of_conduct: {
      title:
        typeof rawRules.title === "string"
          ? rawRules.title
          : "Rules & Code of Conduct",
      subtitle: typeof rawRules.subtitle === "string" ? rawRules.subtitle : "",
      intro: typeof rawRules.intro === "string" ? rawRules.intro : "",
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

function formatCollegeOverviewSection(section: unknown) {
  if (!isRecord(section)) return section;

  // accolades
  const accolades = Array.isArray(section.accolades)
    ? section.accolades
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          tag: typeof item.tag === "string" ? item.tag : "",
          title: typeof item.title === "string" ? item.title : "",
          image: typeof item.image === "string" ? item.image : "",
        }))
    : [];

  // university_details
  const universityDetails = Array.isArray(section.university_details)
    ? section.university_details
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          label: typeof item.label === "string" ? item.label : "",
          value: typeof item.value === "string" ? item.value : "",
        }))
    : [];

  // amenities
  const amenities = Array.isArray(section.amenities)
    ? section.amenities
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          label: typeof item.label === "string" ? item.label : "",
          icon: typeof item.icon === "string" ? item.icon : "",
        }))
    : [];

  // inside_campus_facilities
  const insideCampusFacilities = Array.isArray(section.inside_campus_facilities)
    ? section.inside_campus_facilities
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          label: typeof item.label === "string" ? item.label : "",
          subtitle: typeof item.subtitle === "string" ? item.subtitle : "",
          icon: typeof item.icon === "string" ? item.icon : "",
        }))
    : [];

  // location
  const rawLocation = isRecord(section.location)
    ? (section.location as Record<string, unknown>)
    : {};
  const location = {
    address: typeof rawLocation.address === "string" ? rawLocation.address : "",
    latitude:
      typeof rawLocation.latitude === "number" ? rawLocation.latitude : null,
    longitude:
      typeof rawLocation.longitude === "number" ? rawLocation.longitude : null,
    map_link:
      typeof rawLocation.map_link === "string" ? rawLocation.map_link : "",
  };

  // nearby_access
  const nearbyAccess = Array.isArray(section.nearby_access)
    ? section.nearby_access
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          category: typeof item.category === "string" ? item.category : "",
          items: Array.isArray(item.items)
            ? item.items
                .filter((i): i is Record<string, unknown> => isRecord(i))
                .map((i) => ({
                  name: typeof i.name === "string" ? i.name : "",
                  distance: typeof i.distance === "string" ? i.distance : "",
                }))
            : [],
        }))
    : [];

  // campus_ambassadors
  const campusAmbassadors = Array.isArray(section.campus_ambassadors)
    ? section.campus_ambassadors
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          name: typeof item.name === "string" ? item.name : "",
          course: typeof item.course === "string" ? item.course : "",
          district: typeof item.district === "string" ? item.district : "",
          state: typeof item.state === "string" ? item.state : "",
          image: typeof item.image === "string" ? item.image : "",
          message_link:
            typeof item.message_link === "string" ? item.message_link : "",
        }))
    : [];

  // social
  const social = Array.isArray(section.social)
    ? section.social
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          platform: typeof item.platform === "string" ? item.platform : "",
          icon: typeof item.icon === "string" ? item.icon : "",
          url: typeof item.url === "string" ? item.url : "",
        }))
    : [];

  // campus_reels
  const campusReels = Array.isArray(section.campus_reels)
    ? section.campus_reels
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => ({
          title: typeof item.title === "string" ? item.title : "",
          duration: typeof item.duration === "string" ? item.duration : "",
          date: typeof item.date === "string" ? item.date : "",
          video: typeof item.video === "string" ? item.video : "",
          thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : "",
          type: typeof item.type === "string" ? item.type : "",
        }))
    : [];

  return {
    id:
      typeof section.id === "string" && section.id.trim() !== ""
        ? section.id
        : "college_overview",
    enabled: typeof section.enabled === "boolean" ? section.enabled : true,
    name: typeof section.name === "string" ? section.name : "",
    alt_name: typeof section.alt_name === "string" ? section.alt_name : "",
    location_name:
      typeof section.location_name === "string" ? section.location_name : "",
    type: typeof section.type === "string" ? section.type : "",
    established:
      typeof section.established === "number"
        ? section.established
        : typeof section.established === "string"
          ? parseInt(section.established, 10) || null
          : null,
    navigation_tabs: Array.isArray(section.navigation_tabs)
      ? section.navigation_tabs.filter(
          (tab): tab is string => typeof tab === "string",
        )
      : [],
    about: typeof section.about === "string" ? section.about : "",
    accolades,
    university_details: universityDetails,
    amenities,
    inside_campus_facilities: insideCampusFacilities,
    location,
    nearby_access: nearbyAccess,
    campus_ambassadors: campusAmbassadors,
    social,
    campus_reels: campusReels,
  };
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

function formatInstitutionsSection(section: unknown) {
  if (!isRecord(section)) return section;

  const institutions = Array.isArray(section.institutions)
    ? section.institutions
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((inst) => {
          const departments = Array.isArray(inst.departments)
            ? inst.departments
                .filter((d): d is Record<string, unknown> => isRecord(d))
                .map((dept) => {
                  const ptRaw = isRecord(dept.program_type_tabs)
                    ? (dept.program_type_tabs as Record<string, unknown>)
                    : {};
                  const courses = Array.isArray(dept.courses)
                    ? dept.courses
                        .filter((c): c is Record<string, unknown> =>
                          isRecord(c),
                        )
                        .map((c) => ({
                          id: typeof c.id === "string" ? c.id : "",
                          name: typeof c.name === "string" ? c.name : "",
                          duration:
                            typeof c.duration === "string" ? c.duration : "",
                          mode: typeof c.mode === "string" ? c.mode : "",
                          fee:
                            typeof c.fee === "string"
                              ? c.fee
                              : c.fee === null
                                ? null
                                : null,
                          currency:
                            typeof c.currency === "string" ? c.currency : "INR",
                        }))
                    : [];

                  return {
                    id: typeof dept.id === "string" ? dept.id : "",
                    name: typeof dept.name === "string" ? dept.name : "",
                    programs_available:
                      typeof dept.programs_available === "number"
                        ? dept.programs_available
                        : courses.length,
                    expanded:
                      typeof dept.expanded === "boolean"
                        ? dept.expanded
                        : courses.length > 0,
                    program_type_tabs: {
                      selected:
                        typeof ptRaw.selected === "string"
                          ? ptRaw.selected
                          : "",
                      options: Array.isArray(ptRaw.options)
                        ? ptRaw.options.filter(
                            (o): o is string => typeof o === "string",
                          )
                        : [],
                    },
                    courses,
                  };
                })
            : [];

          return {
            id: typeof inst.id === "string" ? inst.id : "",
            name: typeof inst.name === "string" ? inst.name : "",
            code: typeof inst.code === "string" ? inst.code : "",
            slug: typeof inst.slug === "string" ? inst.slug : "",
            logoUrl: typeof inst.logoUrl === "string" ? inst.logoUrl : "",
            city: typeof inst.city === "string" ? inst.city : "",
            state: typeof inst.state === "string" ? inst.state : "",
            country: typeof inst.country === "string" ? inst.country : "India",
            role: typeof inst.role === "string" ? inst.role : "",
            selected:
              typeof inst.selected === "boolean" ? inst.selected : false,
            joinedAt: typeof inst.joinedAt === "string" ? inst.joinedAt : "",
            joinedVia: typeof inst.joinedVia === "string" ? inst.joinedVia : "",
            departments,
          };
        })
    : [];

  const rawGroup = isRecord(section.group)
    ? (section.group as Record<string, unknown>)
    : null;
  const group = rawGroup
    ? {
        id: typeof rawGroup.id === "string" ? rawGroup.id : "",
        name: typeof rawGroup.name === "string" ? rawGroup.name : "",
        groupCode:
          typeof rawGroup.groupCode === "string" ? rawGroup.groupCode : "",
        status: typeof rawGroup.status === "string" ? rawGroup.status : "",
      }
    : null;

  return {
    id:
      typeof section.id === "string" && section.id.trim() !== ""
        ? section.id
        : "institutions_across_world",
    title:
      typeof section.title === "string"
        ? section.title
        : "Institution Across the World",
    enabled: typeof section.enabled === "boolean" ? section.enabled : true,
    institutions,
    group,
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
      tabId === "college_overview"
        ? formatCollegeOverviewSection(result)
        : tabId === "student_code_of_conduct"
          ? formatStudentCodeOfConductSection(result)
          : tabId === "commute"
            ? formatCommuteSection(result)
            : tabId === "happenings"
              ? formatHappeningsSection(result)
              : tabId === "institutions_across_world"
                ? formatInstitutionsSection(result)
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
