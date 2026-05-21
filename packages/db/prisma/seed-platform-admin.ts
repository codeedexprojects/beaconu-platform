import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../../.env") });
import { prisma } from "../src/index";

async function main() {
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
