import { PrismaClient } from "@prisma/client";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
      "commute.view",
      "commute.manage",
      "staff.view",
      "staff.manage",
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

const ACTIVE_SYSTEM_ROLE_SLUGS = new Set(
  SYSTEM_COLLEGE_ROLES.map((r) => r.slug),
);

async function main() {
  const url = process.env.DATABASE_URL;
  console.log("Using DATABASE_URL:", url);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  console.log("Fetching all existing colleges...");
  const colleges = await prisma.college.findMany({
    select: { id: true, name: true, slug: true },
  });

  console.log(
    `Found ${colleges.length} colleges. Commencing RBAC migration...`,
  );

  for (const college of colleges) {
    console.log(`\nProcessing College: "${college.name}" (${college.slug})`);

    // Deactivate deprecated system roles so they no longer appear in role pickers.
    await prisma.collegeRole.updateMany({
      where: {
        collegeId: college.id,
        isSystemRole: true,
        slug: {
          notIn: Array.from(ACTIVE_SYSTEM_ROLE_SLUGS),
        },
      },
      data: {
        isActive: false,
      },
    });

    for (const roleDef of SYSTEM_COLLEGE_ROLES) {
      let role = await prisma.collegeRole.findFirst({
        where: {
          collegeId: college.id,
          slug: roleDef.slug,
        },
      });

      if (role) {
        role = await prisma.collegeRole.update({
          where: { id: role.id },
          data: {
            name: roleDef.name,
            isSystemRole: true,
            isActive: true,
          },
        });
      } else {
        role = await prisma.collegeRole.create({
          data: {
            collegeId: college.id,
            name: roleDef.name,
            slug: roleDef.slug,
            isSystemRole: true,
            isActive: true,
          },
        });
      }

      console.log(
        `  - System Role: ${role.name} (${role.slug}) -> ID: ${role.id}`,
      );

      // Sync permissions
      await prisma.collegeRolePermission.deleteMany({
        where: { collegeRoleId: role.id },
      });

      if (roleDef.permissions.length > 0) {
        await prisma.collegeRolePermission.createMany({
          data: roleDef.permissions.map((code) => ({
            collegeRoleId: role.id,
            permissionCode: code,
          })),
        });
        console.log(
          `    Seeded permissions: ${roleDef.permissions.join(", ")}`,
        );
      }
    }
  }

  console.log("\nDatabase RBAC migration complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
