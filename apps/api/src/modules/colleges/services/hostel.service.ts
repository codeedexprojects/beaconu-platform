import { NotFoundError } from "@/shared/errors";
import { HostelRepository } from "../repositories/hostel.repository";

function toNumber(value: unknown): number {
  return value == null ? 0 : Number(value);
}

function toNumberOrNull(value: unknown): number | null {
  return value == null ? null : Number(value);
}

function serializeRoomType(roomType: Record<string, unknown>) {
  return {
    ...roomType,
    annualPlanPrice: toNumberOrNull(roomType.annualPlanPrice),
    monthlyPlanPrice: toNumberOrNull(roomType.monthlyPlanPrice),
    admissionFee:
      roomType.admissionFee != null
        ? toNumber(roomType.admissionFee)
        : undefined,
    securityDeposit:
      roomType.securityDeposit != null
        ? toNumber(roomType.securityDeposit)
        : undefined,
  };
}

function serializeMessPlan(messPlan: Record<string, unknown>) {
  return { ...messPlan, priceMonthly: toNumber(messPlan.priceMonthly) };
}

function serializeHostelSummary(hostel: Record<string, unknown>) {
  return { ...hostel, avgRating: toNumber(hostel.avgRating) };
}

function serializeHostelDetail(hostel: Record<string, unknown>) {
  return {
    ...serializeHostelSummary(hostel),
    roomTypes: Array.isArray(hostel.roomTypes)
      ? (hostel.roomTypes as Record<string, unknown>[]).map(serializeRoomType)
      : [],
    messPlans: Array.isArray(hostel.messPlans)
      ? (hostel.messPlans as Record<string, unknown>[]).map(serializeMessPlan)
      : [],
  };
}

// ── Public Hostel Detail (UI tree) ───────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function formatAmount(value: unknown): string {
  const num = toNumberOrNull(value);
  if (num == null) return "";
  return num.toLocaleString("en-IN");
}

const HOSTEL_TYPE_LABELS: Record<string, string> = {
  boys: "Boys Only",
  girls: "Girls Only",
  "co-ed": "Co-Ed",
};

function buildHeader(hostel: Record<string, unknown>) {
  const seededTags = asArray(hostel.tags);
  const tags =
    seededTags.length > 0
      ? seededTags
      : [
          {
            label: hostel.isOnCampus ? "On-Campus" : "Off-Campus",
            color: "blue",
          },
          {
            label: HOSTEL_TYPE_LABELS[asText(hostel.hostelType)] ?? "Co-Ed",
            color: "blue",
          },
        ];

  return {
    cover_image: asText(hostel.coverImageUrl),
    tags,
    rating_badge: {
      rating: toNumber(hostel.avgRating),
      review_count: toNumber(hostel.reviewCount),
    },
    name: asText(hostel.name),
    verified_badge: {
      text:
        asText(hostel.badge) ||
        asText(hostel.safetyTier) ||
        "Safe & Secure Hostel",
    },
  };
}

function buildRoomsAndTypes(hostel: Record<string, unknown>) {
  const roomTypes = asArray(hostel.roomTypes);
  return {
    title: "Rooms & Types",
    total_intake_label: `Total intake: ${toNumber(hostel.totalBeds)} Beds`,
    items: roomTypes.map((room) => {
      const available = toNumber(room.availableBeds);
      const availabilityLabel =
        available <= 0
          ? "Full"
          : available <= 5
            ? `Only ${available} beds left`
            : "Available";
      return {
        id: asText(room.id),
        name: asText(room.name),
        description: asText(room.description),
        view_photos_cta: { label: "View Photos" },
        availability_label: availabilityLabel,
        price: formatAmount(room.monthlyPlanPrice ?? room.annualPlanPrice),
        currency: "₹",
        period: "/mo",
      };
    }),
  };
}

function buildHostelFees(hostel: Record<string, unknown>) {
  const roomTypes = asArray(hostel.roomTypes);
  const primaryRoom = roomTypes[0] ?? {};
  const additionalCharges = [
    `Admission: ₹${formatAmount(primaryRoom.admissionFee) || "0"}`,
    `Deposit: ₹${formatAmount(primaryRoom.securityDeposit) || "0"}`,
  ];

  const plans: Record<string, unknown>[] = [];
  if (primaryRoom.annualPlanPrice != null) {
    plans.push({
      name: "Annual Plan",
      subtitle: "Best Value",
      price: formatAmount(primaryRoom.annualPlanPrice),
      currency: "₹",
      period: "Per Year",
      additional_charges: additionalCharges,
    });
  }
  if (primaryRoom.monthlyPlanPrice != null) {
    plans.push({
      name: "Monthly Plan",
      subtitle: "Pay as you go",
      price: formatAmount(primaryRoom.monthlyPlanPrice),
      currency: "₹",
      period: "Per Month",
      additional_charges: additionalCharges,
      duration_selector: {
        label: "Duration:",
        selected: "1 Month",
        options: ["1 Month", "3 Months", "6 Months", "12 Months"],
      },
    });
  }

  return {
    step_number: 1,
    title: "HOSTEL FEES",
    room_type_label: asText(primaryRoom.name),
    plans,
    note: "Security deposit is fully refundable at the end of the academic year subject to room condition.",
  };
}

function mealSubtitle(meals: unknown[]): string {
  if (meals.length >= 4) return "Full Board (4 Meals)";
  if (meals.length === 0) return "Custom Plan";
  return `${meals.length} Meal${meals.length > 1 ? "s" : ""} Only`;
}

function buildMessPlan(hostel: Record<string, unknown>) {
  const messPlans = asArray(hostel.messPlans);
  const isCompulsory = messPlans.some((plan) => plan.isCompulsory === true);

  return {
    step_number: 2,
    title: "MESS PLAN",
    status_badge: isCompulsory ? "Compulsory" : "Optional",
    plans: messPlans.map((plan) => {
      const meals = asArray(plan.mealsIncluded as unknown);
      const mealLabels = Array.isArray(plan.mealsIncluded)
        ? (plan.mealsIncluded as unknown[]).map((m) => asText(m))
        : [];
      return {
        name: asText(plan.name),
        subtitle: mealSubtitle(meals),
        price: formatAmount(plan.priceMonthly),
        currency: "₹",
        period: "Per Month",
        meal_tags: mealLabels,
        duration_selector: {
          label: "Duration:",
          selected: asText(plan.duration) || "1 Month",
          options: ["1 Month", "3 Months", "6 Months"],
        },
      };
    }),
    note: "Mess charges are billed in advance for the selected duration and are non-refundable once the cycle starts.",
  };
}

function inferPeriod(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("year") || lower.includes("annual")) return "Per Year";
  if (lower.includes("quarter")) return "Per Quarter";
  return "Per Month";
}

function buildAddonSection(
  hostel: Record<string, unknown>,
  serviceType: string,
  stepNumber: number,
  title: string,
) {
  const addons = asArray(hostel.addonServices).filter(
    (service) => service.serviceType === serviceType,
  );
  const service = addons[0];
  const plans = service ? asArray(service.plans as unknown) : [];

  return {
    step_number: stepNumber,
    title,
    plans: plans.map((plan) => {
      const label = asText(plan.label) || asText(plan.name);
      return {
        name: label,
        subtitle: "",
        price: formatAmount(plan.price),
        currency: "₹",
        period: inferPeriod(label),
        feature_tags: asArray(plan.feature_tags as unknown).map((t) =>
          asText(t),
        ),
      };
    }),
    note: service ? asText(service.notes) : "",
  };
}

function buildParkingCharges(hostel: Record<string, unknown>) {
  const addons = asArray(hostel.addonServices).filter(
    (service) => service.serviceType === "parking",
  );
  const service = addons[0];
  const plans = service ? asArray(service.plans as unknown) : [];

  return {
    step_number: 5,
    title: "PARKING CHARGES",
    items: plans.map((plan) => ({
      name: asText(plan.label) || asText(plan.name),
      price: formatAmount(plan.price),
      currency: "₹",
      period: inferPeriod(asText(plan.label)),
    })),
    note: service
      ? asText(service.notes)
      : "Parking slots are limited and allotted on a first-come, first-served basis.",
  };
}

function buildSafetyAndWarden(hostel: Record<string, unknown>) {
  const warden = asRecord(hostel.wardenInfo);
  const safetyFeatures = asArray(warden.safetyFeatures as unknown);

  return {
    title: "Safety & Warden",
    warden: {
      photo: asText(warden.photo),
      name: asText(warden.name),
      designation: asText(warden.designation) || "Warden",
    },
    features:
      safetyFeatures.length > 0
        ? safetyFeatures.map((f) => ({ label: asText(f.label ?? f) }))
        : [],
  };
}

function buildAmenities(hostel: Record<string, unknown>) {
  return {
    title: "Amenities",
    items: asArray(hostel.amenities).map((a) => ({
      label: asText(a.name ?? a.label),
      selected: true,
    })),
  };
}

function buildRules(hostel: Record<string, unknown>) {
  return {
    title: "Rules",
    items: asArray(hostel.rules).map((r, idx) => ({
      number: idx + 1,
      title: asText(r.title),
      description: asText(r.description),
    })),
  };
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(date: Date | string): string {
  const then = new Date(date).getTime();
  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function buildReviewsAndRatings(
  hostel: Record<string, unknown>,
  reviews: Record<string, unknown>[],
) {
  return {
    title: "Reviews & Ratings",
    summary: {
      average: toNumber(hostel.avgRating),
      total_reviews_label: `${toNumber(hostel.reviewCount)} Verified Reviews`,
    },
    items: reviews.map((review) => {
      const studentName = asText(asRecord(review.student).fullName);
      return {
        id: asText(review.id),
        reviewer_initials: initialsOf(studentName),
        reviewer_name: studentName,
        rating: toNumber(review.rating),
        posted: relativeTime(review.createdAt as Date),
        comment: asText(review.reviewText),
      };
    }),
  };
}

function buildLocationAndAccess(hostel: Record<string, unknown>) {
  const locationInfo = asRecord(hostel.locationInfo);
  const nearby = asArray(locationInfo.nearbyEssentials as unknown);

  const categoryMap = new Map<string, { name: string; distance: string }[]>();
  for (const item of nearby) {
    const category = asText(item.type) || "Other";
    const list = categoryMap.get(category) ?? [];
    list.push({ name: asText(item.name), distance: asText(item.distance) });
    categoryMap.set(category, list);
  }
  const essentialsCategories = Array.from(categoryMap.entries()).map(
    ([title, details]) => ({ title, details }),
  );

  const collegeTransport = asRecord(locationInfo.collegeTransport);
  const mapInfo = asRecord(locationInfo.map);

  return {
    title: "Location & Access",
    tabs: {
      selected: "Essentials",
      options: ["Transit", "Essentials", "Utility"],
    },
    types: [
      { type: "Essentials", categories: essentialsCategories },
      { type: "Transit", categories: [] },
      { type: "Utility", categories: [] },
    ],
    map: {
      thumbnail: asText(mapInfo.thumbnail),
      address: {
        icon: "https://cdn.iconsdb.example.com/icons/location-pin-gray.png",
        line1: asText(locationInfo.address),
        line2: asText(locationInfo.addressLine2),
      },
      college_transport: {
        icon: "https://cdn.iconsdb.example.com/icons/bus-gray.png",
        title: "College Transport",
        description: asText(collegeTransport.description),
        bus_stop_note: asText(collegeTransport.busStopNote),
      },
      open_map_cta: {
        latitude: toNumberOrNull(locationInfo.latitude),
        longitude: toNumberOrNull(locationInfo.longitude),
        link: asText(locationInfo.mapLink),
      },
    },
  };
}

function buildPublicHostelDetail(
  hostel: Record<string, unknown>,
  reviews: Record<string, unknown>[],
) {
  return {
    id: asText(hostel.id),
    tab: "student_housing",
    header: buildHeader(hostel),
    rooms_and_types: buildRoomsAndTypes(hostel),
    hostel_fees: buildHostelFees(hostel),
    mess_plan: buildMessPlan(hostel),
    laundry_charges: buildAddonSection(hostel, "laundry", 3, "LAUNDRY CHARGES"),
    gym_packages: buildAddonSection(hostel, "gym", 4, "GYM PACKAGES"),
    parking_charges: buildParkingCharges(hostel),
    safety_and_warden: buildSafetyAndWarden(hostel),
    amenities: buildAmenities(hostel),
    rules: buildRules(hostel),
    reviews_and_ratings: buildReviewsAndRatings(hostel, reviews),
    location_and_access: buildLocationAndAccess(hostel),
  };
}

export class HostelService {
  // ── Public ────────────────────────────────────────────────────────────────

  static async getPublicHostelsByIds(collegeId: string, hostelIds: string[]) {
    const hostels = await HostelRepository.findPublicByCollegeAndIds(
      collegeId,
      hostelIds,
    );
    return hostels.map((hostel) => ({
      ...hostel,
      roomTypes: hostel.roomTypes.map((roomType) => ({
        ...roomType,
        annualPlanPrice: toNumberOrNull(roomType.annualPlanPrice),
        monthlyPlanPrice: toNumberOrNull(roomType.monthlyPlanPrice),
      })),
    }));
  }

  static async getPublicHostelList(collegeSlug: string) {
    const hostels =
      await HostelRepository.findPublicListByCollegeSlug(collegeSlug);
    return hostels.map(serializeHostelSummary);
  }

  static async getPublicHostelDetail(collegeSlug: string, hostelId: string) {
    const hostel = await HostelRepository.findPublicDetailById(
      collegeSlug,
      hostelId,
    );
    if (!hostel) throw new NotFoundError("Hostel not found");

    const reviews = await HostelRepository.findPublicReviewsByHostelId(
      hostel.id,
      5,
    );
    return buildPublicHostelDetail(hostel, reviews);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  static async getAdminHostelDetail(id: string, collegeId: string) {
    const hostel = await HostelRepository.findAdminDetailById(id, collegeId);
    if (!hostel) throw new NotFoundError("Hostel not found");
    return serializeHostelDetail(hostel);
  }

  static async updateHostel(
    id: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    const hostel = await HostelRepository.updateHostel(id, collegeId, data);
    if (!hostel) throw new NotFoundError("Hostel not found");
    return serializeHostelDetail(hostel);
  }

  static async createRoomType(
    hostelId: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const roomType = await HostelRepository.createRoomType(hostelId, data);
    return serializeRoomType(roomType);
  }

  static async updateRoomType(
    id: string,
    hostelId: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const roomType = await HostelRepository.updateRoomType(id, hostelId, data);
    if (!roomType) throw new NotFoundError("Room type not found");
    return serializeRoomType(roomType);
  }

  static async deleteRoomType(id: string, hostelId: string, collegeId: string) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const roomType = await HostelRepository.deleteRoomType(id, hostelId);
    if (!roomType) throw new NotFoundError("Room type not found");
    return roomType;
  }

  static async createMessPlan(
    hostelId: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const messPlan = await HostelRepository.createMessPlan(hostelId, data);
    return serializeMessPlan(messPlan);
  }

  static async updateMessPlan(
    id: string,
    hostelId: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const messPlan = await HostelRepository.updateMessPlan(id, hostelId, data);
    if (!messPlan) throw new NotFoundError("Mess plan not found");
    return serializeMessPlan(messPlan);
  }

  static async deleteMessPlan(id: string, hostelId: string, collegeId: string) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const messPlan = await HostelRepository.deleteMessPlan(id, hostelId);
    if (!messPlan) throw new NotFoundError("Mess plan not found");
    return messPlan;
  }

  static async createAddonService(
    hostelId: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    return HostelRepository.createAddonService(hostelId, data);
  }

  static async updateAddonService(
    id: string,
    hostelId: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const addonService = await HostelRepository.updateAddonService(
      id,
      hostelId,
      data,
    );
    if (!addonService) throw new NotFoundError("Addon service not found");
    return addonService;
  }

  static async deleteAddonService(
    id: string,
    hostelId: string,
    collegeId: string,
  ) {
    await this.getAdminHostelDetail(hostelId, collegeId);
    const addonService = await HostelRepository.deleteAddonService(
      id,
      hostelId,
    );
    if (!addonService) throw new NotFoundError("Addon service not found");
    return addonService;
  }
}
