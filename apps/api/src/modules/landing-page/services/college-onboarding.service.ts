import { CollegeOnboardingRepository } from "../repositories/college-onboarding.repository";
import {
  SubmitCollegeOnboardingData,
  UpdateOnboardingStatusData,
  ListOnboardingRequestsData,
} from "../validators/college-onboarding.validator";
import { NotFoundError } from "@/shared/errors";
import { CollegeProvisioningService } from "@/modules/colleges/services/college-provisioning.service";
import { InstitutionGroupService } from "@/modules/colleges/services/institution-group.service";

export class CollegeOnboardingService {
  static async submit(data: SubmitCollegeOnboardingData) {
    const request = await CollegeOnboardingRepository.create(data);
    return {
      id: request.id,
      collegeName: request.collegeName,
      contactPersonName: request.contactPersonName,
      contactEmail: request.contactEmail,
      status: request.status,
      createdAt: request.createdAt,
    };
  }

  static async list(filters: ListOnboardingRequestsData) {
    const { requests, total, page, limit } =
      await CollegeOnboardingRepository.findMany(filters);

    return {
      data: requests.map((r) => ({
        id: r.id,
        collegeName: r.collegeName,
        universityName: r.universityName,
        contactPersonName: r.contactPersonName,
        contactEmail: r.contactEmail,
        contactPhone: r.contactPhone,
        city: r.city,
        state: r.state,
        message: r.message,
        status: r.status,
        reviewRemarks: r.reviewRemarks,
        reviewer: r.reviewer
          ? { id: r.reviewer.id, name: r.reviewer.fullName }
          : null,
        createdCollege: r.createdCollege
          ? {
              id: r.createdCollege.id,
              slug: r.createdCollege.slug,
              ownedGroupCode:
                r.createdCollege.institutionGroups?.[0]?.groupCode || null,
            }
          : null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const request = await CollegeOnboardingRepository.findById(id);
    if (!request)
      throw new NotFoundError("College onboarding request not found");
    return {
      id: request.id,
      collegeName: request.collegeName,
      universityName: request.universityName,
      contactPersonName: request.contactPersonName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      city: request.city,
      state: request.state,
      message: request.message,
      status: request.status,
      reviewRemarks: request.reviewRemarks,
      reviewer: request.reviewer
        ? { id: request.reviewer.id, name: request.reviewer.fullName }
        : null,
      createdCollege: request.createdCollege
        ? {
            id: request.createdCollege.id,
            slug: request.createdCollege.slug,
            ownedGroupCode:
              request.createdCollege.institutionGroups?.[0]?.groupCode || null,
          }
        : null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  static async updateStatus(
    id: string,
    data: UpdateOnboardingStatusData,
    reviewedBy: string,
  ) {
    const existing = await CollegeOnboardingRepository.findById(id);
    if (!existing)
      throw new NotFoundError("College onboarding request not found");

    // Auto-provision college when approved
    let provisionedCollege: Awaited<
      ReturnType<typeof CollegeProvisioningService.provisionFromLead>
    > | null = null;
    let generatedGroupCode: string | null = null;

    if (data.status === "approved" && !existing.createdCollegeId) {
      // Provision FIRST — if this fails, the lead stays "pending"
      provisionedCollege = await CollegeProvisioningService.provisionFromLead({
        collegeName: existing.collegeName,
        contactEmail: existing.contactEmail,
        contactName: existing.contactPersonName,
        city: existing.city ?? null,
        state: existing.state ?? null,
        onboardingRequestId: id,
      });

      if (data.enableInstitutionGroup && provisionedCollege) {
        const group = await InstitutionGroupService.enableForCollege(
          provisionedCollege.college.id,
          {
            name: `${existing.collegeName} Group`,
            description: "Automatically generated group during onboarding.",
          },
        );
        generatedGroupCode = group?.groupCode || null;
      }
    }

    // Only update status AFTER provisioning succeeds
    const updated = await CollegeOnboardingRepository.updateStatus(
      id,
      data,
      reviewedBy,
    );

    return {
      id: updated.id,
      status: updated.status,
      reviewRemarks: updated.reviewRemarks,
      updatedAt: updated.updatedAt,
      ...(provisionedCollege
        ? {
            provisionedCollege: {
              id: provisionedCollege.college.id,
              name: provisionedCollege.college.name,
              slug: provisionedCollege.college.slug,
              code: provisionedCollege.college.code,
              adminEmail: provisionedCollege.staff.email,
              setupUrl: provisionedCollege.setupUrl,
              groupCode: generatedGroupCode,
            },
          }
        : {}),
    };
  }

  static async getStats() {
    const groups = await CollegeOnboardingRepository.countByStatus();
    const stats: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const g of groups) {
      stats[g.status] = g._count._all;
    }
    return {
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
    };
  }
}
