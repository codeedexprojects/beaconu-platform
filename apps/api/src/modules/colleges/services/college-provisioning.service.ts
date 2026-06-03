import {
  toSlug,
  toCollegeCode,
  ensureUniqueCollegeSlug,
  ensureUniqueCollegeCode,
} from "@/shared/utils/slug.utils";
import { buildCollegeSetupUrl } from "@/shared/utils/college-url.utils";
import { CollegeProvisioningRepository } from "../repositories/college-provisioning.repository";

export interface ProvisionCollegeInput {
  collegeName: string;
  contactEmail: string;
  contactName: string;
  city?: string | null;
  state?: string | null;
  universityId?: string | null;
  onboardingRequestId: string;
}

export interface ProvisionCollegeResult {
  college: {
    id: string;
    name: string;
    slug: string;
    code: string;
    status: string;
  };
  staff: {
    id: string;
    email: string;
    fullName: string;
  };
  setupToken: string;
  /** Full setup URL for the college-admin portal */
  setupUrl: string;
}

export class CollegeProvisioningService {
  static async provisionFromLead(
    input: ProvisionCollegeInput,
  ): Promise<ProvisionCollegeResult> {
    // Generate unique slug and code
    const baseSlug = toSlug(input.collegeName);
    const baseCode = toCollegeCode(input.collegeName);

    const [slug, code] = await Promise.all([
      ensureUniqueCollegeSlug(baseSlug),
      ensureUniqueCollegeCode(baseCode),
    ]);

    const { college, staff, setupToken } =
      await CollegeProvisioningRepository.provision({
        name: input.collegeName,
        slug,
        code,
        city: input.city ?? null,
        state: input.state ?? null,
        contactEmail: input.contactEmail,
        contactName: input.contactName,
        universityId: input.universityId ?? null,
        onboardingRequestId: input.onboardingRequestId,
      });

    const setupUrl = buildCollegeSetupUrl(slug, setupToken);

    return {
      college: {
        id: college.id,
        name: college.name,
        slug: college.slug,
        code: college.code,
        status: college.status,
      },
      staff: {
        id: staff.id,
        email: staff.email,
        fullName: staff.fullName,
      },
      setupToken,
      setupUrl,
    };
  }

  /**
   * Verify a setup token is valid and not expired.
   * Returns college + staff info for the setup page to display.
   */
  static async verifySetupToken(token: string) {
    const result = await CollegeProvisioningRepository.findBySetupToken(token);
    if (!result) return null;

    return {
      collegeName: result.college.name,
      collegeSlug: result.college.slug,
      email: result.staff?.email ?? "",
      staffId: result.staff?.id ?? "",
      collegeId: result.college.id,
    };
  }
}
