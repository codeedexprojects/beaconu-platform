import { prisma } from "@beaconu/db";
async function main() {
  const stream = await prisma.stream.findFirst({
    orderBy: { createdAt: "desc" },
  });
  console.log("Latest stream:", stream);
}
main().catch(console.error);
