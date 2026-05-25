import { prisma } from "./index";

async function check() {
  try {
    const user = await prisma.blinkUser.findFirst().catch(() => null);
    console.log("BlinkUser query:", user === null ? "Failed" : "Success");

    const role = await prisma.blinkRole.findFirst().catch(() => null);
    console.log("BlinkRole query:", role === null ? "Failed" : "Success");

    const session = await prisma.userSession.findFirst().catch(() => null);
    console.log("UserSession query:", session === null ? "Failed" : "Success");
  } catch (e) {
    console.error("Check failed:", e);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
