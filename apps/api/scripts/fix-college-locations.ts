import { prisma } from "@beaconu/db";
import { canonicalIndiaState, getIndiaDistricts } from "@beaconu/utils";

// One-off, user-run cleanup of colleges.state / district / city so the
// public state filter can find every college. Safe to re-run.
//
//   cd apps/api && npx dotenv -e ../../.env -- npx tsx scripts/fix-college-locations.ts           # dry run
//   cd apps/api && npx dotenv -e ../../.env -- npx tsx scripts/fix-college-locations.ts --apply
//
// Fixes automatically: whitespace, empty strings, and state/district/city
// casing when the value matches a known name. Missing or unknown states are
// only reported. District/city lists are incomplete for many towns, so
// unmatched values are left as they are.

const APPLY = process.argv.includes("--apply");

type Fix = {
  state?: string | null;
  district?: string | null;
  city?: string | null;
};

function tidy(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function matchPlace(stateName: string | null, value: string | null) {
  if (!stateName || !value) return null;
  const needle = value.toLowerCase();
  return (
    getIndiaDistricts(stateName).find((d) => d.value.toLowerCase() === needle)
      ?.value ?? null
  );
}

async function main() {
  const colleges = await prisma.college.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      state: true,
      district: true,
      city: true,
    },
    orderBy: { id: "asc" },
  });

  const fixes: { id: string; label: string; data: Fix }[] = [];
  const review: string[] = [];

  for (const college of colleges) {
    const label = `${college.id} "${college.name}" (${college.status})`;
    const data: Fix = {};

    const state = canonicalIndiaState(college.state) ?? tidy(college.state);
    const district = tidy(college.district);
    const city = tidy(college.city);
    const knownState = canonicalIndiaState(state);

    const districtFixed = matchPlace(knownState, district) ?? district;
    const cityFixed = matchPlace(knownState, city) ?? city;

    if (state !== college.state) data.state = state;
    if (districtFixed !== college.district) data.district = districtFixed;
    if (cityFixed !== college.city) data.city = cityFixed;
    if (Object.keys(data).length) fixes.push({ id: college.id, label, data });

    if (!state) review.push(`${label}: no state`);
    else if (!knownState) review.push(`${label}: unknown state "${state}"`);
  }

  console.log(APPLY ? "MODE: APPLY" : "MODE: DRY RUN — pass --apply to write");
  console.log(`\n${APPLY ? "Fixed" : "Would fix"} ${fixes.length} college(s):`);
  for (const fix of fixes) {
    const changes = Object.entries(fix.data)
      .map(([field, value]) => `${field} → ${JSON.stringify(value)}`)
      .join(", ");
    console.log(`  ~ ${fix.label}: ${changes}`);
  }

  if (APPLY && fixes.length) {
    await prisma.$transaction(
      fixes.map((fix) =>
        prisma.college.update({
          where: { id: fix.id },
          data: fix.data,
          select: { id: true },
        }),
      ),
    );
  }

  if (review.length) {
    console.log(`\nNeeds a manual fix in college settings (${review.length}):`);
    for (const line of review) console.log(`  ! ${line}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
