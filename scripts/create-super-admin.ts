import { prisma } from "../packages/db/src/index";
import bcrypt from "bcryptjs";

async function main() {
  const email = "superadmin@beaconu.com";
  const password = "password@123";
  const fullName = "Platform Super Admin";

  const superAdminRole = await prisma.platformRole.upsert({
    where: { slug: "super_admin" },
    update: {
      name: "Super Admin",
      isSystemRole: true,
      isActive: true,
    },
    create: {
      name: "Super Admin",
      slug: "super_admin",
      isSystemRole: true,
      isActive: true,
    },
  });

  await prisma.platformRolePermission.createMany({
    data: [
      {
        platformRoleId: superAdminRole.id,
        permissionCode: "*",
      },
    ],
    skipDuplicates: true,
  });

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: {
      platformRoleId: superAdminRole.id,
      passwordHash,
      fullName,
      status: "active",
    },
    create: {
      platformRoleId: superAdminRole.id,
      email,
      passwordHash,
      fullName,
      status: "active",
    },
  });

  console.log("Super-admin created/updated:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
