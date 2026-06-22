import { prisma } from "./index";

async function main() {
  console.log("=== COUNSELLORS ===");
  const counsellors = await prisma.counsellor.findMany({
    select: { id: true, fullName: true, email: true },
  });
  console.dir(counsellors, { depth: null });

  console.log("\n=== AVAILABILITY SLOTS ===");
  const slots = await prisma.counsellorAvailability.findMany();
  console.dir(slots, { depth: null });

  console.log("\n=== SESSIONS ===");
  const sessions = await prisma.counsellingSession.findMany({
    include: {
      student: { select: { fullName: true } },
      counsellor: { select: { fullName: true } },
    },
  });
  console.dir(sessions, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
