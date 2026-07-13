/**
 * Backfill script: Add "Audio Comprehension" QuestionType to every college
 * that already has the "listening-reading" AssessmentSection seeded.
 *
 * This is a one-time migration required because SectionService.seedSection()
 * only runs the first time a college enables a section — existing colleges
 * won't automatically receive new question types added to the seed.
 *
 * Run from the monorepo root:
 *   npx ts-node --project apps/api/tsconfig.json \
 *     apps/api/src/modules/assessments/scripts/backfill-listening-reading-audio-comprehension.ts
 */

import { prisma } from "@beaconu/db";

const NEW_QUESTION_TYPE = {
  slug: "audio-comprehension",
  name: "Audio Comprehension",
  category: "listening_reading",
  responseFormat: "audio_response",
  hasAudio: true,
  hasImage: false,
  hasPassage: false,
  autoScorable: false,
  isSystemType: true,
} as const;

async function main() {
  // Find every college that has the listening-reading section already created
  const sections = await prisma.assessmentSection.findMany({
    where: { slug: "listening-reading" },
    select: { collegeId: true },
  });

  if (sections.length === 0) {
    console.log(
      "No colleges have the listening-reading section seeded yet — nothing to backfill.",
    );
    return;
  }

  console.log(
    `Found ${sections.length} college(s) with listening-reading section. Backfilling...`,
  );

  let inserted = 0;
  let skipped = 0;

  for (const { collegeId } of sections) {
    const existing = await prisma.questionType.findFirst({
      where: {
        collegeId,
        slug: NEW_QUESTION_TYPE.slug,
        // Narrow to listening_reading category to avoid collision with the
        // same slug in verbal-communication (different category, same college)
        category: NEW_QUESTION_TYPE.category,
      },
    });

    if (existing) {
      console.log(`  [skip] College ${collegeId} — already has the type.`);
      skipped++;
      continue;
    }

    await prisma.questionType.create({
      data: {
        collegeId,
        ...NEW_QUESTION_TYPE,
      },
    });

    console.log(
      `  [ok]   College ${collegeId} — inserted Audio Comprehension.`,
    );
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
