import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../../.env") });
import { prisma } from "../src/index";

async function main() {
  const platformPermissionsToSeed = [
    // ── Platform Management ─────────────────────────────────────────────
    {
      code: "platform.roles.view",
      description: "View platform roles and permissions",
    },
    {
      code: "platform.roles.manage",
      description: "Create, update, and delete platform roles",
    },
    {
      code: "platform.admins.view",
      description: "View platform administrators",
    },
    {
      code: "platform.admins.manage",
      description: "Manage platform administrators",
    },
    {
      code: "platform.settings.view",
      description: "View platform-level settings",
    },
    {
      code: "platform.settings.manage",
      description: "Manage platform-level settings",
    },

    // ── Institutions ────────────────────────────────────────────────────
    { code: "colleges.view", description: "View colleges" },
    { code: "colleges.manage", description: "Create and manage colleges" },
    { code: "universities.view", description: "View universities" },
    {
      code: "universities.manage",
      description: "Create and manage universities",
    },
    { code: "university-types.view", description: "View university types" },
    {
      code: "university-types.manage",
      description: "Create and manage university types",
    },
    {
      code: "academic-masters.view",
      description:
        "View academic taxonomy (streams, disciplines, study levels)",
    },
    {
      code: "academic-masters.manage",
      description: "Manage academic taxonomy",
    },

    // ── People ──────────────────────────────────────────────────────────
    { code: "students.view", description: "View student profiles" },
    { code: "students.manage", description: "Manage student accounts" },
    { code: "leads.view", description: "View college and blink leads" },
    { code: "leads.manage", description: "Manage and assign leads" },
    { code: "counsellors.view", description: "View counsellors" },
    {
      code: "counsellors.manage",
      description: "Create and manage counsellors",
    },

    // ── Content ─────────────────────────────────────────────────────────
    {
      code: "content.view",
      description: "View blogs, articles, news alerts, and financial aid",
    },
    {
      code: "content.manage",
      description:
        "Create and manage content (blogs, articles, news alerts, financial aid)",
    },
    { code: "exams.view", description: "View entrance exams" },
    { code: "exams.manage", description: "Create and manage entrance exams" },
    { code: "events.view", description: "View events" },
    { code: "events.manage", description: "Create and manage events" },
    { code: "notifications.view", description: "View push notifications" },
    {
      code: "notifications.manage",
      description: "Send and manage push notifications",
    },

    // ── Blink (Associates & Ambassadors) ────────────────────────────────
    {
      code: "blink.view",
      description: "View blink users (associates, ambassadors)",
    },
    {
      code: "blink.manage",
      description: "Manage blink users and their assignments",
    },
  ];

  console.log("Seeding Platform Permissions...");
  for (const perm of platformPermissionsToSeed) {
    await prisma.platformPermission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: { code: perm.code, description: perm.description },
    });
    console.log(`✓ Upserted permission: ${perm.code}`);
  }

  console.log("\nSetting up Super Admin role...");
  // Create a Super Admin role
  const superAdminRole = await prisma.platformRole.upsert({
    where: { slug: "super_admin" },
    update: {},
    create: {
      name: "Super Administrator",
      slug: "super_admin",
      isSystemRole: true,
      isActive: true,
    },
  });
  console.log(`✓ Upserted role: ${superAdminRole.slug}`);

  // Attach all available platform permissions to this new role
  for (const perm of platformPermissionsToSeed) {
    // Note: The unique constraint is uq_platform_role_permission. We need to look up by that compound index.
    const existingPerm = await prisma.platformRolePermission.findFirst({
      where: {
        platformRoleId: superAdminRole.id,
        permissionCode: perm.code,
      },
    });

    if (!existingPerm) {
      await prisma.platformRolePermission.create({
        data: {
          platformRoleId: superAdminRole.id,
          permissionCode: perm.code,
        },
      });
      console.log(`  + Granted ${perm.code} to super_admin`);
    } else {
      console.log(`  - super_admin already has ${perm.code}`);
    }
  }

  console.log("\nPlatform Admin permissions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
