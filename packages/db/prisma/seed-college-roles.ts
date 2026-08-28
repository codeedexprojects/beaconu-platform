import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../.env") });
import { prisma } from "../src/index";

// Seeds the recommended set of college-side roles onto CLG-10 (this repo's
// real test college). Every other college can create the same roles for
// itself via the existing college-admin Roles UI (POST /college-admin/roles)
// — this script exists to make the roles immediately visible/assignable for
// testing without going through the UI first.
//
// "College Admin" (slug: college_admin, wildcard "*" permission) already
// exists as a system role created at college onboarding — not touched here.

const COLLEGE_ID = "CLG-10";

const ROLES: { name: string; permissions: string[] }[] = [
  {
    name: "Admissions Officer",
    permissions: [
      "admissions.view",
      "admissions.manage",
      "documents.view",
      "documents.manage",
      "students.view",
      "staff.view",
    ],
  },
  {
    name: "Evaluator",
    permissions: ["assessments.view", "evaluation.manage", "staff.view"],
  },
  {
    name: "Interview Panel",
    permissions: [
      "interviews.view",
      "interviews.manage",
      "students.view",
      "staff.view",
    ],
  },
  {
    name: "Finance Handler",
    permissions: [
      "finance.view",
      "payments.manage",
      "scholarships.view",
      "staff.view",
    ],
  },
  {
    name: "Academic Head",
    permissions: [
      "academics.view",
      "academics.manage",
      "assessments.view",
      "assessments.manage",
      "interviews.view",
      "students.view",
      "staff.view",
    ],
  },
  {
    name: "Hostel Warden",
    permissions: ["hostel.view", "hostel.manage", "staff.view"],
  },
  {
    name: "Librarian",
    permissions: ["library.view", "library.manage", "staff.view"],
  },
  {
    name: "Transport Coordinator",
    permissions: ["commute.view", "commute.manage", "staff.view"],
  },
  {
    name: "Front Desk / Support",
    permissions: [
      "support.manage",
      "campus-visits.manage",
      "notices.manage",
      "staff.view",
    ],
  },
  {
    name: "Marketing / Content Manager",
    permissions: [
      "media-kit.manage",
      "community.manage",
      "ambassadors.manage",
      "profile.edit",
      "campuses.view",
      "staff.view",
    ],
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function main() {
  console.log(`Seeding college roles for ${COLLEGE_ID}...\n`);

  for (const role of ROLES) {
    const slug = slugify(role.name);

    const collegeRole = await prisma.collegeRole.upsert({
      where: { uq_college_role_slug: { collegeId: COLLEGE_ID, slug } },
      update: { name: role.name, isActive: true },
      create: {
        collegeId: COLLEGE_ID,
        name: role.name,
        slug,
        isSystemRole: false,
        isActive: true,
      },
    });

    for (const code of role.permissions) {
      await prisma.collegeRolePermission.upsert({
        where: {
          uq_role_permission: {
            collegeRoleId: collegeRole.id,
            permissionCode: code,
          },
        },
        update: {},
        create: { collegeRoleId: collegeRole.id, permissionCode: code },
      });
    }

    console.log(
      `  = ${role.name} (${collegeRole.id}) — ${role.permissions.length} permissions`,
    );
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
