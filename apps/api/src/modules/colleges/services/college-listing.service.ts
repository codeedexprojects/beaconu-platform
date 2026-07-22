import { NotFoundError } from "@/shared/errors";
import { CollegeDashboardRepository } from "../repositories/college-dashboard.repository";

export class CollegeListingService {
  static async setPublicListing(collegeId: string, isListed: boolean) {
    const settings = await CollegeDashboardRepository.getSettings(collegeId);
    if (settings === null) throw new NotFoundError("College not found");

    const currentSettings =
      typeof settings === "object" ? (settings as Record<string, unknown>) : {};

    await CollegeDashboardRepository.updateSettings(collegeId, {
      ...currentSettings,
      isListed,
    });

    return { collegeId, isListed };
  }
}
