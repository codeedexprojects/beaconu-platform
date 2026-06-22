import "dotenv/config";
import { prisma } from "./index";

/**
 * One-off seed for testing the new public eligibility-criteria API
 * (GET /api/v1/public/colleges/by-slug/:slug/courses/:courseId/eligibility-criteria).
 *
 * Stores the display-ready shape directly into Course.eligibilityCriteria
 * (same JSON column the generic course-tabs system also exposes at
 * .../tabs/eligibility_criteria). `filters_applied` is NOT stored here —
 * it's computed at request time from the query string by
 * CourseTabsService.getPublicEligibilityCriteria.
 *
 * Usage: pnpm --filter @beaconu/db exec tsx src/seed-course-eligibility-criteria-demo.ts [courseId]
 */
async function main() {
  const courseId = process.argv[2] || "CRS-2";

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }

  const eligibilityCriteria = {
    id: "eligibility_criteria",
    title: "Eligibility Criteria",
    student_type_filter: {
      options: [
        { label: "Indian Students", value: "indian" },
        { label: "Foreign Students", value: "foreign" },
      ],
    },
    quota_filter: {
      label: "SELECT QUOTA CATEGORY",
      options: [
        { label: "Government Quota", value: "government_quota" },
        { label: "Management Quota", value: "management_quota" },
        { label: "NRI Quota", value: "nri_quota" },
        { label: "Scholarship Quota", value: "scholarship_quota" },
        { label: "Sports Quota", value: "sports_quota" },
      ],
    },
    check_eligibility_cta: { label: "Check Eligibility" },
    view_blogs_cta: {
      label: "View Blogs",
      link: "https://example.com/blogs/eligibility",
    },
    criteria: [
      {
        icon: "https://cdn.iconsdb.example.com/icons/graduation-cap-orange.png",
        heading: "Educational Qualification",
        description:
          "Candidates must have completed 10+2 (Intermediate/Senior Secondary Education) from a recognized board, or 10+3 diploma from a recognized national or state institute.",
      },
      {
        icon: "https://cdn.iconsdb.example.com/icons/birthday-cake-orange.png",
        heading: "Age Requirement",
        description:
          "Minimum 17 years of age as of 31st December. No upper age limit for admission to this course.",
      },
      {
        icon: "https://cdn.iconsdb.example.com/icons/grades-medal-orange.png",
        heading: "Academic Grades (10+2)",
        description:
          "Minimum 50% marks in aggregate in 10+2 / 10+3 from a recognized board.",
      },
      {
        icon: "https://cdn.iconsdb.example.com/icons/trophy-orange.png",
        heading: "Entrance Grades",
        description:
          "Must secure a valid rank in NEET/CET with a minimum percentile of 50th (40th for SC/ST/OBC categories).",
      },
    ],
  };

  await prisma.course.update({
    where: { id: courseId },
    data: { eligibilityCriteria: eligibilityCriteria as any },
  });

  console.log(
    `Done — eligibility_criteria seeded for ${courseId} (${course.name}).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
