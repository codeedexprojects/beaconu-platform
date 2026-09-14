import { resolve } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { prisma, Prisma } from "../src/index";

// One-off, user-run cleanup of the academic taxonomy: gives catalogue courses
// a study level and default program type, adds the missing catalogue entries,
// re-categorises mis-filed college courses and links them to the catalogue,
// and retires the legacy/duplicate masters. Soft deletes only. Idempotent.
//
//   cd apps/api && npx dotenv -e ../../.env -- npx tsx ../../packages/db/prisma/fix-academic-taxonomy.ts           # dry run
//   cd apps/api && npx dotenv -e ../../.env -- npx tsx ../../packages/db/prisma/fix-academic-taxonomy.ts --apply
//
// The dry run executes inside a transaction that is rolled back, so its report
// is exactly what --apply would do. Rows are matched by slug or by id plus
// expected name; anything that doesn't match is skipped with a warning.
// Linking needs the course_master_link migration; without it the link step is
// skipped and a later re-run completes it.

const APPLY = process.argv.includes("--apply");
type Tx = Prisma.TransactionClient;
type Ref = { id: string; name: string };

const changes: string[] = [];
const warnings: string[] = [];

class DryRunRollback extends Error {}

const STUDY_LEVEL_RULES: [RegExp, string][] = [
  [/^diploma\b/i, "diploma"],
  [
    /^(b\.tech|b\.sc|ba|b\.com|bba|bca|bams|bds|bmlt|mbbs|b\.pharm|bpt)\b/i,
    "ug",
  ],
  [/^(m\.tech|m\.sc|mba|mca)\b/i, "postgraduate"],
];

// legacy catalogue id → [expected name, replacement catalogue]
const LEGACY_MASTERS: [string, string, string][] = [
  ["CRM-1", "BCA", "bca"],
  ["CRM-2", "B.Tech Computer Science Engineering", "CRM-4"],
  ["CRM-3", "M.Tech Computer Science Engineering", "CRM-5"],
  ["CRM-9", "B.Tech Mechanical Engineering", "CRM-11"],
  ["CRM-10", "M.Tech Mechanical Engineering", "CRM-12"],
  ["CRM-16", "B.Tech Artificial Intelligence & Machine Learning", "CRM-17"],
  ["CRM-52", "Computer Science - AI", "bsc-cs"],
];

// course id → [expected name, target catalogue]
const COURSES: [string, string, string][] = [
  ["CRS-4", "Bachelor of Business Administration (BBA)", "CRM-31"],
  ["CRS-5", "Master of Business Administration (MBA)", "CRM-27"],
  ["CRS-6", "Bachelor of Computer Applications (BCA)", "bca"],
  ["CRS-3", "Master of Computer Applications (MCA)", "mca"],
  ["CRS-19", "B.Tech in Computer Science & Engineering", "CRM-4"],
  ["CRS-21", "Bachelor of Business Administration", "CRM-31"],
  ["CRS-20", "Master of Computer Applications", "mca"],
  ["CRS-1", "Bachelor of Computer Application (BCA)", "bca"],
  ["CRS-8", "Diploma in Computer Science", "diploma-cs"],
  ["CRS-2", "MBA Digital Transformation", "CRM-27"],
  ["CRS-13", "Bachelor of Commerce", "CRM-50"],
  ["CRS-9", "BCA - Internet of Things (IoT)", "bca"],
  ["CRS-10", "Computer Science-A I(BSC CS)", "bsc-cs"],
  ["CRS-14", "BSCCS", "bsc-cs"],
  ["CRS-18", "Master of Business Administration", "CRM-27"],
  ["CRS-17", "Bachelor of Science in Nursing", "CRM-22"],
  ["CRS-16", "Bachelor of Dental Surgery", "CRM-21"],
  ["CRS-15", "Bachelor of Medicine, Bachelor of Surgery", "CRM-20"],
];

const LEGACY_DISCIPLINES: [string, string][] = [
  ["DSC-1", "Artificial Intelligence & Machine Learning"],
  ["DSC-2", "Mechanical Engineering"],
  ["DSC-3", "Computer Science Engineering"],
  ["DSC-4", "Computer Science - AI"],
];

const JUNK_STREAMS: [string, string][] = [
  ["bsc-cs", "BSC CS"],
  ["engineering", "Engineering"],
  ["mca", "MCA"],
  ["software", "Software"],
];

async function mustFind<T>(what: string, row: Promise<T | null>): Promise<T> {
  const found = await row;
  if (!found) throw new Error(`${what} not found — aborting, nothing written`);
  return found;
}

async function run(tx: Tx, hasLinkColumn: boolean) {
  const level = (slug: string) =>
    mustFind(
      `study level "${slug}"`,
      tx.studyLevel.findUnique({
        where: { slug },
        select: { id: true, name: true },
      }),
    );
  const stream = (slug: string) =>
    mustFind(
      `stream "${slug}"`,
      tx.stream.findUnique({
        where: { slug },
        select: { id: true, name: true },
      }),
    );

  const levels: Record<string, Ref> = {
    ug: await level("ug"),
    postgraduate: await level("postgraduate"),
    diploma: await level("diploma"),
  };
  const regular = await mustFind(
    `program type "standard-or-regular"`,
    tx.programType.findUnique({
      where: { slug: "standard-or-regular" },
      select: { id: true, name: true },
    }),
  );
  const engTech = await stream("engineering_technology");
  const science = await stream("science");
  const cse = await mustFind(
    "discipline engineering_technology/cse",
    tx.discipline.findUnique({
      where: { uq_discipline_slug: { streamId: engTech.id, slug: "cse" } },
      select: { id: true, name: true },
    }),
  );

  async function ensureDiscipline(
    streamId: string,
    slug: string,
    name: string,
  ): Promise<Ref> {
    const where = { uq_discipline_slug: { streamId, slug } };
    const existing = await tx.discipline.findUnique({
      where,
      select: { id: true, name: true },
    });
    if (existing) return existing;
    changes.push(`+ discipline "${name}"`);
    return tx.discipline.create({
      data: { streamId, slug, name },
      select: { id: true, name: true },
    });
  }

  async function ensureMaster(
    disciplineId: string,
    slug: string,
    name: string,
    levelKey: string,
  ): Promise<Ref> {
    const where = { uq_course_master_discipline_slug: { disciplineId, slug } };
    const existing = await tx.courseMaster.findUnique({
      where,
      select: { id: true, name: true },
    });
    if (existing) return existing;
    changes.push(
      `+ catalogue "${name}" (${levels[levelKey].name}, ${regular.name})`,
    );
    return tx.courseMaster.create({
      data: {
        disciplineId,
        slug,
        name,
        studyLevelId: levels[levelKey].id,
        programTypeId: regular.id,
      },
      select: { id: true, name: true },
    });
  }

  // 1. Missing disciplines and catalogue entries
  const computerApplications = await ensureDiscipline(
    engTech.id,
    "computer_applications",
    "Computer Applications",
  );
  const computerScience = await ensureDiscipline(
    science.id,
    "computer_science",
    "Computer Science",
  );
  const created: Record<string, Ref> = {
    bca: await ensureMaster(
      computerApplications.id,
      "bca-bachelor-of-computer-applications",
      "BCA (Bachelor of Computer Applications)",
      "ug",
    ),
    mca: await ensureMaster(
      computerApplications.id,
      "mca-master-of-computer-applications",
      "MCA (Master of Computer Applications)",
      "postgraduate",
    ),
    "bsc-cs": await ensureMaster(
      computerScience.id,
      "b-sc-computer-science",
      "B.Sc Computer Science",
      "ug",
    ),
    "diploma-cs": await ensureMaster(
      cse.id,
      "diploma-in-computer-science",
      "Diploma in Computer Science",
      "diploma",
    ),
  };

  const target = (key: string) =>
    tx.courseMaster.findFirst({
      where: { id: created[key]?.id ?? key, isActive: true },
      select: { id: true, name: true, disciplineId: true, studyLevelId: true },
    });

  // 2. Retire legacy catalogue entries, moving any links to their replacement
  for (const [id, expectName, replacementKey] of LEGACY_MASTERS) {
    const legacy = await tx.courseMaster.findUnique({
      where: { id },
      select: { name: true, isActive: true },
    });
    if (!legacy?.isActive) continue;
    if (legacy.name !== expectName) {
      warnings.push(
        `skipped legacy catalogue ${id}: name is "${legacy.name}", expected "${expectName}"`,
      );
      continue;
    }
    const replacement = await target(replacementKey);
    if (hasLinkColumn && replacement) {
      await tx.course.updateMany({
        where: { courseMasterId: id },
        data: { courseMasterId: replacement.id },
      });
    }
    await tx.courseMaster.update({
      where: { id },
      data: { isActive: false },
      select: { id: true },
    });
    changes.push(
      `- catalogue ${id} "${legacy.name}" deactivated (replaced by "${replacement?.name ?? "nothing"}")`,
    );
  }

  // 3. Study level + default program type on active catalogue entries
  const incomplete = await tx.courseMaster.findMany({
    where: {
      isActive: true,
      OR: [{ studyLevelId: null }, { programTypeId: null }],
    },
    select: { id: true, name: true, studyLevelId: true, programTypeId: true },
  });
  const levelCounts = new Map<string, number>();
  let typed = 0;
  for (const master of incomplete) {
    const data: { studyLevelId?: string; programTypeId?: string } = {};
    if (!master.studyLevelId) {
      const rule = STUDY_LEVEL_RULES.find(([pattern]) =>
        pattern.test(master.name.trim()),
      );
      if (rule) {
        const matched = levels[rule[1]];
        data.studyLevelId = matched.id;
        levelCounts.set(matched.name, (levelCounts.get(matched.name) ?? 0) + 1);
      } else {
        warnings.push(
          `catalogue ${master.id} "${master.name}": no study level rule matched — set it in super admin`,
        );
      }
    }
    if (!master.programTypeId) {
      data.programTypeId = regular.id;
      typed++;
    }
    if (Object.keys(data).length) {
      await tx.courseMaster.update({
        where: { id: master.id },
        data,
        select: { id: true },
      });
    }
  }
  for (const [name, count] of levelCounts)
    changes.push(`~ ${count} catalogue entries → study level "${name}"`);
  if (typed)
    changes.push(
      `~ ${typed} catalogue entries → default program type "${regular.name}"`,
    );

  // 4. Re-categorise college courses onto their catalogue entry
  for (const [id, expectName, key] of COURSES) {
    const course = await tx.course.findUnique({
      where: { id },
      select: {
        name: true,
        collegeId: true,
        disciplineId: true,
        studyLevelId: true,
      },
    });
    if (!course) continue;
    if (course.name.trim() !== expectName) {
      warnings.push(
        `skipped course ${id}: name is "${course.name}", expected "${expectName}"`,
      );
      continue;
    }
    const master = await target(key);
    if (!master) {
      warnings.push(
        `skipped course ${id} "${expectName}": catalogue ${key} missing or inactive`,
      );
      continue;
    }
    const studyLevelId = master.studyLevelId ?? course.studyLevelId;
    const alreadyLinked =
      !hasLinkColumn ||
      Boolean(
        await tx.course.findFirst({
          where: { id, courseMasterId: master.id },
          select: { id: true },
        }),
      );
    if (
      course.disciplineId === master.disciplineId &&
      course.studyLevelId === studyLevelId &&
      alreadyLinked
    )
      continue;

    await tx.course.update({
      where: { id },
      data: {
        disciplineId: master.disciplineId,
        studyLevelId,
        ...(hasLinkColumn && { courseMasterId: master.id }),
      },
      select: { id: true },
    });
    changes.push(
      `~ course ${id} "${course.name}" (${course.collegeId}): ${course.disciplineId}/${course.studyLevelId ?? "-"} → ` +
        `${master.disciplineId}/${studyLevelId ?? "-"}, catalogue ${master.id} "${master.name}"` +
        (hasLinkColumn ? "" : " [link pending migration]"),
    );
  }

  // 5. Duplicate study level "UnderGraduate"
  const dupUg = await tx.studyLevel.findUnique({
    where: { slug: "undergraduate" },
    select: { id: true, name: true, isActive: true },
  });
  if (dupUg?.isActive) {
    const used =
      (await tx.course.count({ where: { studyLevelId: dupUg.id } })) +
      (await tx.courseMaster.count({ where: { studyLevelId: dupUg.id } }));
    if (used) {
      warnings.push(
        `study level ${dupUg.id} "${dupUg.name}" is still used by ${used} row(s) — left active`,
      );
    } else {
      await tx.studyLevel.update({
        where: { id: dupUg.id },
        data: { isActive: false },
        select: { id: true },
      });
      changes.push(
        `- study level ${dupUg.id} "${dupUg.name}" deactivated (duplicate of "${levels.ug.name}")`,
      );
    }
  }

  // 6. Legacy disciplines, once nothing active points at them
  for (const [id, expectName] of LEGACY_DISCIPLINES) {
    const discipline = await tx.discipline.findUnique({
      where: { id },
      select: { name: true, isActive: true },
    });
    if (!discipline?.isActive) continue;
    if (discipline.name !== expectName) {
      warnings.push(
        `skipped legacy discipline ${id}: name is "${discipline.name}", expected "${expectName}"`,
      );
      continue;
    }
    const [courses, masters] = await Promise.all([
      tx.course.count({ where: { disciplineId: id, status: "active" } }),
      tx.courseMaster.count({ where: { disciplineId: id, isActive: true } }),
    ]);
    if (courses || masters) {
      warnings.push(
        `legacy discipline ${id} "${discipline.name}" still has ${courses} course(s), ${masters} catalogue entries — left active`,
      );
      continue;
    }
    await tx.discipline.update({
      where: { id },
      data: { isActive: false },
      select: { id: true },
    });
    changes.push(`- discipline ${id} "${discipline.name}" deactivated`);
  }

  // 7. Junk streams, once they have no active disciplines
  for (const [slug, expectName] of JUNK_STREAMS) {
    const row = await tx.stream.findUnique({
      where: { slug },
      select: { id: true, name: true, isActive: true },
    });
    if (!row?.isActive) continue;
    if (row.name !== expectName) {
      warnings.push(
        `skipped stream "${slug}": name is "${row.name}", expected "${expectName}"`,
      );
      continue;
    }
    const live = await tx.discipline.count({
      where: { streamId: row.id, isActive: true },
    });
    if (live) {
      warnings.push(
        `stream ${row.id} "${row.name}" still has ${live} active discipline(s) — left active`,
      );
      continue;
    }
    await tx.stream.update({
      where: { id: row.id },
      data: { isActive: false },
      select: { id: true },
    });
    changes.push(`- stream ${row.id} "${row.name}" deactivated`);
  }

  // Leftovers that need a human
  const leftovers = await tx.course.findMany({
    where: {
      status: "active",
      OR: [
        { studyLevel: { isActive: false } },
        { discipline: { isActive: false } },
      ],
    },
    select: { id: true, name: true },
  });
  for (const c of leftovers)
    warnings.push(
      `course ${c.id} "${c.name}" still uses an inactive study level or discipline`,
    );
  if (hasLinkColumn) {
    const unlinked = await tx.course.findMany({
      where: { status: "active", courseMasterId: null },
      select: { id: true, name: true },
    });
    for (const c of unlinked)
      warnings.push(
        `course ${c.id} "${c.name}" is not linked to a catalogue entry`,
      );
  }
}

async function writeBackup() {
  const [streams, disciplines, studyLevels, courseMasters, courses] =
    await Promise.all([
      prisma.$queryRaw`SELECT * FROM streams`,
      prisma.$queryRaw`SELECT * FROM disciplines`,
      prisma.$queryRaw`SELECT * FROM study_levels`,
      prisma.$queryRaw`SELECT * FROM course_masters`,
      prisma.$queryRaw`SELECT * FROM courses`,
    ]);
  const dir = resolve(__dirname, "backups");
  mkdirSync(dir, { recursive: true });
  const file = resolve(
    dir,
    `academic-taxonomy-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  writeFileSync(
    file,
    JSON.stringify(
      { streams, disciplines, studyLevels, courseMasters, courses },
      null,
      2,
    ),
  );
  return file;
}

async function main() {
  const [{ exists }] = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'courses' AND column_name = 'course_master_id'
    ) AS exists`;

  console.log(
    APPLY
      ? "MODE: APPLY"
      : "MODE: DRY RUN — nothing is written; pass --apply to write",
  );
  if (!exists)
    console.log(
      "courses.course_master_id is missing — apply the course_master_link migration to also link courses",
    );
  if (APPLY) console.log(`Backup: ${await writeBackup()}`);

  try {
    await prisma.$transaction(
      async (tx) => {
        await run(tx, exists);
        if (!APPLY) throw new DryRunRollback();
      },
      { timeout: 120_000 },
    );
  } catch (error) {
    if (!(error instanceof DryRunRollback)) throw error;
  }

  console.log(
    `\n${APPLY ? "Applied" : "Would apply"} ${changes.length} change(s):`,
  );
  for (const line of changes) console.log(`  ${line}`);
  if (warnings.length) {
    console.log(`\nNeeds attention (${warnings.length}):`);
    for (const line of warnings) console.log(`  ! ${line}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
