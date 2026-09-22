import { prisma } from "@beaconu/db";
import { buildCollegeReferralUrl } from "@/shared/utils/college-url.utils";

// One-off, user-run cleanup of referral_codes.referral_url rows that were
// built before COLLEGE_WEB_URL was set in the deploy environment, so they
// have a localhost host baked in. generateReferralCode() only builds this
// URL once at creation and returns the stored row on every later call, so
// these never self-heal — this script rebuilds them from the current
// COLLEGE_WEB_URL. Safe to re-run.
//
//   cd apps/api && npx dotenv -e ../../.env -- npx tsx scripts/fix-stale-referral-urls.ts           # dry run
//   cd apps/api && npx dotenv -e ../../.env -- npx tsx scripts/fix-stale-referral-urls.ts --apply

const APPLY = process.argv.includes("--apply");

async function main() {
  const codes = await prisma.referralCode.findMany({
    select: {
      id: true,
      code: true,
      referralUrl: true,
      college: { select: { slug: true } },
    },
    orderBy: { id: "asc" },
  });

  const fixes: { id: string; code: string; from: string | null; to: string }[] =
    [];

  for (const row of codes) {
    const rebuilt = buildCollegeReferralUrl(row.college.slug, row.code);
    if (rebuilt !== row.referralUrl) {
      fixes.push({
        id: row.id,
        code: row.code,
        from: row.referralUrl,
        to: rebuilt,
      });
    }
  }

  console.log(APPLY ? "MODE: APPLY" : "MODE: DRY RUN — pass --apply to write");
  console.log(
    `\n${APPLY ? "Fixed" : "Would fix"} ${fixes.length} referral code(s):`,
  );
  for (const fix of fixes) {
    console.log(`  ~ ${fix.id} (${fix.code}): ${fix.from} → ${fix.to}`);
  }

  if (APPLY && fixes.length) {
    await prisma.$transaction(
      fixes.map((fix) =>
        prisma.referralCode.update({
          where: { id: fix.id },
          data: { referralUrl: fix.to },
          select: { id: true },
        }),
      ),
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
