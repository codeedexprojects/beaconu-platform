import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../../.env") });

async function main() {
  // Imported dynamically, after dotenv.config() above has run — a static
  // top-level import is hoisted before any code in this file executes, so
  // ../src/index would read process.env.DATABASE_URL as undefined and the
  // Prisma client would try to connect with no connection string at all.
  const { prisma } = await import("../src/index");

  const platformPermissionsToSeed = [
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
      code: "platform.admins.sessions.manage",
      description:
        "View platform administrator active login sessions and force sign-out on specific devices",
    },
    {
      code: "platform.settings.view",
      description: "View platform-level settings",
    },
    {
      code: "platform.settings.manage",
      description: "Manage platform-level settings",
    },

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

    { code: "students.view", description: "View student profiles" },
    { code: "students.manage", description: "Manage student accounts" },
    { code: "leads.view", description: "View college and blink leads" },
    { code: "leads.manage", description: "Manage and assign leads" },
    { code: "counsellors.view", description: "View counsellors" },
    {
      code: "counsellors.manage",
      description: "Create and manage counsellors",
    },

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
    { code: "education-boards.view", description: "View education boards" },
    {
      code: "education-boards.manage",
      description: "Create and manage education boards",
    },
    {
      code: "institutes-of-national-importance.view",
      description: "View Institutes of National Importance",
    },
    {
      code: "institutes-of-national-importance.manage",
      description: "Create and manage Institutes of National Importance",
    },
    { code: "icons.view", description: "View icons" },
    { code: "icons.manage", description: "Create and manage icons" },
    { code: "events.view", description: "View events" },
    { code: "events.manage", description: "Create and manage events" },
    { code: "notifications.view", description: "View push notifications" },
    {
      code: "notifications.manage",
      description: "Send and manage push notifications",
    },

    {
      code: "blink.view",
      description: "View blink users (associates, ambassadors)",
    },
    {
      code: "blink.manage",
      description: "Manage blink users and their assignments",
    },

    { code: "students.view", description: "View student accounts" },
    {
      code: "students.manage",
      description: "Manage student accounts (e.g. suspend/activate)",
    },

    {
      code: "college-tickets.view",
      description: "View queries and call requests raised by colleges",
    },
    {
      code: "college-tickets.manage",
      description:
        "Reply to and manage queries/call requests raised by colleges",
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
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
