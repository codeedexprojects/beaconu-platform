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
    return serializeHostelDetail(hostel);
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
