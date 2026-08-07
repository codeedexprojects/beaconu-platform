import { prisma } from "@beaconu/db";

const SUMMARY_SELECT = {
  id: true,
  name: true,
  slug: true,
  hostelType: true,
  isOnCampus: true,
  distanceFromCampus: true,
  totalBeds: true,
  coverImageUrl: true,
  avgRating: true,
  reviewCount: true,
} as const;

const DETAIL_SELECT = {
  ...SUMMARY_SELECT,
  description: true,
  gallery: true,
  tags: true,
  badge: true,
  safetyTier: true,
  wardenInfo: true,
  amenities: true,
  rules: true,
  locationInfo: true,
  roomTypes: {
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      totalBeds: true,
      availableBeds: true,
      annualPlanPrice: true,
      monthlyPlanPrice: true,
      admissionFee: true,
      securityDeposit: true,
      description: true,
      photos: true,
    },
  },
  messPlans: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      name: true,
      description: true,
      mealsIncluded: true,
      priceMonthly: true,
      duration: true,
      isCompulsory: true,
      dietaryOptions: true,
    },
  },
  addonServices: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      serviceType: true,
      name: true,
      description: true,
      isOptional: true,
      plans: true,
      notes: true,
    },
  },
} as const;

export class HostelRepository {
  static async findPublicByCollegeAndIds(
    collegeId: string,
    hostelIds: string[],
  ) {
    if (hostelIds.length === 0) return [];

    return prisma.hostel.findMany({
      where: {
        collegeId,
        id: { in: hostelIds },
        status: "active",
      },
      select: {
        id: true,
        name: true,
        hostelType: true,
        isOnCampus: true,
        distanceFromCampus: true,
        totalBeds: true,
        coverImageUrl: true,
        roomTypes: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            totalBeds: true,
            availableBeds: true,
            annualPlanPrice: true,
            monthlyPlanPrice: true,
          },
        },
      },
    });
  }

  static async findPublicListByCollegeSlug(collegeSlug: string) {
    return prisma.hostel.findMany({
      where: {
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: SUMMARY_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findPublicDetailById(collegeSlug: string, hostelId: string) {
    return prisma.hostel.findFirst({
      where: {
        id: hostelId,
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: DETAIL_SELECT,
    });
  }

  static async findListByCollegeId(collegeId: string) {
    return prisma.hostel.findMany({
      where: { status: "active", collegeId },
      select: SUMMARY_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findDetailByCollegeIdAndHostelId(
    collegeId: string,
    hostelId: string,
  ) {
    return prisma.hostel.findFirst({
      where: { id: hostelId, status: "active", collegeId },
      select: DETAIL_SELECT,
    });
  }

  static async findPublicReviewsByHostelId(hostelId: string, take: number) {
    return prisma.hostelReview.findMany({
      where: { hostelId, status: "approved" },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        rating: true,
        reviewText: true,
        isVerified: true,
        createdAt: true,
        student: { select: { fullName: true } },
      },
    });
  }

  static async findAdminDetailById(id: string, collegeId: string) {
    return prisma.hostel.findFirst({
      where: { id, collegeId },
      select: DETAIL_SELECT,
    });
  }

  static async findGallerySources(hostelId: string) {
    return prisma.hostel.findUnique({
      where: { id: hostelId },
      select: {
        coverImageUrl: true,
        roomTypes: {
          where: { isActive: true },
          select: { photos: true },
        },
      },
    });
  }

  static async updateGallery(hostelId: string, gallery: string[]) {
    return prisma.hostel.update({
      where: { id: hostelId },
      data: { gallery },
    });
  }

  static async updateHostel(
    id: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    const hostel = await prisma.hostel.findFirst({
      where: { id, collegeId },
    });
    if (!hostel) return null;

    return prisma.hostel.update({
      where: { id },
      data,
      select: DETAIL_SELECT,
    });
  }

  static async createRoomType(hostelId: string, data: Record<string, unknown>) {
    return prisma.hostelRoomType.create({
      data: { ...data, hostelId } as any,
    });
  }

  static async updateRoomType(
    id: string,
    hostelId: string,
    data: Record<string, unknown>,
  ) {
    const roomType = await prisma.hostelRoomType.findFirst({
      where: { id, hostelId },
    });
    if (!roomType) return null;

    return prisma.hostelRoomType.update({
      where: { id },
      data,
    });
  }

  static async deleteRoomType(id: string, hostelId: string) {
    const roomType = await prisma.hostelRoomType.findFirst({
      where: { id, hostelId },
    });
    if (!roomType) return null;

    return prisma.hostelRoomType.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async createMessPlan(hostelId: string, data: Record<string, unknown>) {
    return prisma.hostelMessPlan.create({
      data: { ...data, hostelId } as any,
    });
  }

  static async updateMessPlan(
    id: string,
    hostelId: string,
    data: Record<string, unknown>,
  ) {
    const messPlan = await prisma.hostelMessPlan.findFirst({
      where: { id, hostelId },
    });
    if (!messPlan) return null;

    return prisma.hostelMessPlan.update({
      where: { id },
      data,
    });
  }

  static async deleteMessPlan(id: string, hostelId: string) {
    const messPlan = await prisma.hostelMessPlan.findFirst({
      where: { id, hostelId },
    });
    if (!messPlan) return null;

    return prisma.hostelMessPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async createAddonService(
    hostelId: string,
    data: Record<string, unknown>,
  ) {
    return prisma.hostelAddonService.create({
      data: { ...data, hostelId } as any,
    });
  }

  static async updateAddonService(
    id: string,
    hostelId: string,
    data: Record<string, unknown>,
  ) {
    const addonService = await prisma.hostelAddonService.findFirst({
      where: { id, hostelId },
    });
    if (!addonService) return null;

    return prisma.hostelAddonService.update({
      where: { id },
      data,
    });
  }

  static async deleteAddonService(id: string, hostelId: string) {
    const addonService = await prisma.hostelAddonService.findFirst({
      where: { id, hostelId },
    });
    if (!addonService) return null;

    return prisma.hostelAddonService.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
