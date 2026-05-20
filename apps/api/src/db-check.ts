import { prisma } from "@beaconu/db";

async function main() {
  const staff = await prisma.staffMember.findMany({
    include: {
      college: true,
      collegeRole: true,
    },
  });

  console.log("=== Staff Members in DB ===");
  staff.forEach((s) => {
    console.log({
      id: s.id,
      email: s.email,
      fullName: s.fullName,
      collegeId: s.collegeId,
      collegeSlug: s.college?.slug,
      role: s.collegeRole?.slug,
    });
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
