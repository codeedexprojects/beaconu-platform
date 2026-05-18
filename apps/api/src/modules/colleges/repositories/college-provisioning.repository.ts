import { prisma } from "@beaconu/db";
import { randomUUID } from "crypto";

const SYSTEM_COLLEGE_ROLES = [
  { name: "College Admin", slug: "college_admin" },
  { name: "Evaluator", slug: "evaluator" },
  { name: "Financial Team", slug: "financial_team" },
  { name: "Admission Team", slug: "admission_team" },
  { name: "Hostel Team", slug: "hostel_team" },
  { name: "Marketing Team", slug: "marketing_team" },
];

/** 48 hours in milliseconds */
const SETUP_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export class CollegeProvisioningRepository {
  /**
   * Full provisioning inside a Prisma transaction.
   * Creates: College, CollegeRoles, StaffMember (no password), setup token.
   */
  static async provision(data: {
    name: string;
    slug: string;
    code: string;
    city: string | null;
    state: string | null;
    contactEmail: string;
    contactName: string;
    universityId?: string | null;
    onboardingRequestId: string;
  }) {
    const setupToken = randomUUID();
    const setupTokenExpiresAt = new Date(
      Date.now() + SETUP_TOKEN_TTL_MS,
    ).toISOString();

    return prisma.$transaction(async (tx) => {
      // 1. Create College shell
      const college = await tx.college.create({
        data: {
          name: data.name,
          slug: data.slug,
          code: data.code,
          city: data.city,
          state: data.state,
          status: "pending_setup",
          universityId: data.universityId ?? (await getDefaultUniversityId(tx)),
        },
      });

      // 2. Create system CollegeRoles
      const roles = await Promise.all(
        SYSTEM_COLLEGE_ROLES.map((role) =>
          tx.collegeRole.create({
            data: {
              collegeId: college.id,
              name: role.name,
              slug: role.slug,
              isSystemRole: true,
            },
          }),
        ),
      );

      const adminRole = roles.find((r) => r.slug === "college_admin")!;

      // 3. Create StaffMember with empty password + setup token in metadata
      const staff = await tx.staffMember.create({
        data: {
          collegeId: college.id,
          collegeRoleId: adminRole.id,
          fullName: data.contactName,
          email: data.contactEmail.trim().toLowerCase(),
          passwordHash: "", // will be set during setup-account flow
          status: "active",
        },
      });

      // Store setup token in a separate update to keep create clean
      await tx.staffMember.update({
        where: { id: staff.id },
        data: {
          // we store the token in the metadata JSON field
          // StaffMember doesn't have a metadata field but we can use a workaround:
          // We'll rely on a lookup by email + token pattern via the college's settings JSON
        },
      });

      // Store the setup token in the College settings JSON (avoids schema change)
      await tx.college.update({
        where: { id: college.id },
        data: {
          settings: {
            setupToken,
            setupTokenExpiresAt,
            setupStaffId: staff.id,
          },
        },
      });

      // 4. Link onboarding request → college
      await tx.collegeOnboardingRequest.update({
        where: { id: data.onboardingRequestId },
        data: { createdCollegeId: college.id },
      });

      return {
        college,
        staff,
        adminRole,
        setupToken,
      };
    });
  }

  /**
   * Find a college by setup token stored in settings JSON.
   * Returns null if not found or expired.
   */
  static async findBySetupToken(token: string) {
    // Postgres JSONB query: settings->>'setupToken' = token
    const colleges = await prisma.college.findMany({
      where: {
        settings: {
          path: ["setupToken"],
          equals: token,
        },
      },
      include: {
        staffMembers: {
          select: {
            id: true,
            email: true,
            fullName: true,
            collegeRoleId: true,
          },
        },
      },
    });

    if (colleges.length === 0) return null;

    const college = colleges[0];
    const settings = college.settings as Record<string, unknown>;
    const expiresAt = settings.setupTokenExpiresAt as string;

    if (new Date(expiresAt) < new Date()) return null; // expired

    const staffId = settings.setupStaffId as string;
    const staff = college.staffMembers.find((s) => s.id === staffId) ?? null;

    return { college, staff };
  }

  /**
   * Complete account setup: hash and save password, clear setup token.
   */
  static async completeSetup(
    collegeId: string,
    staffId: string,
    passwordHash: string,
    fullName: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const staff = await tx.staffMember.update({
        where: { id: staffId },
        data: { passwordHash, fullName },
        include: {
          collegeRole: { include: { permissions: true } },
          college: { select: { id: true, slug: true, status: true } },
        },
      });

      // Clear the setup token from college settings
      await tx.college.update({
        where: { id: collegeId },
        data: {
          settings: {}, // clear setup token
        },
      });

      return staff;
    });
  }

  /** Find staff by email with college + role info */
  static async findStaffByEmail(email: string) {
    return prisma.staffMember.findFirst({
      where: { email: email.trim().toLowerCase() },
      include: {
        college: { select: { id: true, slug: true, name: true, status: true } },
        collegeRole: { include: { permissions: true } },
      },
    });
  }

  /** Update last login timestamp */
  static async updateLastLogin(id: string) {
    await prisma.staffMember.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

/** Find or get a placeholder university if onboarding request had no universityId */
async function getDefaultUniversityId(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<string> {
  // Find any active university as placeholder — college admin will update it in wizard
  const university = await tx.university.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!university) {
    throw new Error(
      "No universities found in the system. Please create at least one university first.",
    );
  }
  return university.id;
}
