import { prisma } from "@beaconu/db";
import { randomUUID } from "crypto";

const SYSTEM_COLLEGE_ROLES = [
  {
    name: "College Admin",
    slug: "college_admin",
    permissions: [
      "profile.view",
      "profile.edit",
      "campuses.view",
      "campuses.manage",
      "academics.view",
      "academics.manage",
      "hostel.view",
      "hostel.manage",
      "library.view",
      "library.manage",
      "commute.view",
      "commute.manage",
      "staff.view",
      "staff.manage",
      "finance.view",
    ],
  },
  {
    name: "Hostel Admin",
    slug: "hostel_admin",
    permissions: ["hostel.view", "hostel.manage"],
  },
  {
    name: "Commute Admin",
    slug: "commute_admin",
    permissions: ["commute.view", "commute.manage"],
  },
];

const SETUP_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export class CollegeProvisioningRepository {
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

      const roles = await Promise.all(
        SYSTEM_COLLEGE_ROLES.map(async (role) => {
          const createdRole = await tx.collegeRole.create({
            data: {
              collegeId: college.id,
              name: role.name,
              slug: role.slug,
              isSystemRole: true,
            },
          });
          if (role.permissions.length > 0) {
            await tx.collegeRolePermission.createMany({
              data: role.permissions.map((code) => ({
                collegeRoleId: createdRole.id,
                permissionCode: code,
              })),
            });
          }
          return createdRole;
        }),
      );

      const adminRole = roles.find((r) => r.slug === "college_admin")!;

      const staff = await tx.staffMember.create({
        data: {
          collegeId: college.id,
          collegeRoleId: adminRole.id,
          fullName: data.contactName,
          email: data.contactEmail.trim().toLowerCase(),
          passwordHash: "",
          status: "active",
        },
      });

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

  static async findBySetupToken(token: string) {
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

    if (new Date(expiresAt) < new Date()) return null;

    const staffId = settings.setupStaffId as string;
    const staff = college.staffMembers.find((s) => s.id === staffId) ?? null;

    return { college, staff };
  }

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
          college: {
            select: { id: true, slug: true, name: true, status: true },
          },
        },
      });

      await tx.college.update({
        where: { id: collegeId },
        data: {
          settings: {},
        },
      });

      return staff;
    });
  }

  static async findStaffByEmail(email: string) {
    return prisma.staffMember.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: "insensitive",
        },
      },
      include: {
        college: { select: { id: true, slug: true, name: true, status: true } },
        collegeRole: { include: { permissions: true } },
      },
    });
  }

  static async updateLastLogin(id: string) {
    await prisma.staffMember.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

async function getDefaultUniversityId(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<string> {
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
