import "dotenv/config";
import { prisma } from "./index";

/**
 * One-off seed for testing the public course-level "admission_policy" tab
 * (GET /api/v1/public/colleges/by-slug/:slug/courses/:courseId/tabs/admission_policy).
 *
 * "admission_policy" is a course setup tab stored at
 * metadata.tabData.admission_policy (course-tabs.validator.ts
 * COURSE_SETUP_TAB_IDS) and read as a pure passthrough — same mechanism
 * as the `placements` course tab seeded earlier. This is unrelated to
 * the college-level profileSections.admission_policy section (different
 * key, different table) even though both share the same display shape.
 *
 * Usage: pnpm --filter @beaconu/db exec tsx src/seed-course-admission-policy-demo.ts [courseId]
 */
async function main() {
  const courseId = process.argv[2] || "CRS-2";

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }

  const metadata = (course.metadata ?? {}) as Record<string, unknown>;
  const tabData = (metadata.tabData ?? {}) as Record<string, unknown>;

  const admissionPolicy = {
    id: "admission_policy",
    title: "Admission Policy",
    enabled: true,
    seat_matrix: {
      title: "Seat Matrix",
      columns: ["Quota Category", "Total", "Open"],
      rows: [
        { quota_category: "Government", total: 40, open: 12 },
        { quota_category: "Management", total: 30, open: 5 },
        { quota_category: "NRI Quota", total: 15, open: 8 },
        { quota_category: "Scholarship", total: 20, open: 2 },
        { quota_category: "Sports", total: 15, open: 10 },
      ],
    },
    quota_options: {
      title: "Select Quota Category",
      options: [
        { label: "Government Quota", value: "government_quota" },
        { label: "Management Quota", value: "management_quota" },
        { label: "NRI Quota", value: "nri_quota" },
        { label: "Scholarship Quota", value: "scholarship_quota" },
        { label: "Sports Quota", value: "sports_quota" },
      ],
    },
    entrance_exams_accepted: {
      title: "Entrance Exams Accepted",
      levels: [
        {
          level_label: "NATIONAL LEVEL",
          exams: [
            {
              code_badge: "CAT",
              name: "Common Admission Test",
              min_criteria_label: "Min. Percentile",
              min_criteria_value: "85%ile",
              exam_code: "CAT-105",
            },
            {
              code_badge: "JEE",
              name: "JEE Main",
              min_criteria_label: "Min. Percentile",
              min_criteria_value: "90%ile",
              exam_code: "JEE-202",
            },
            {
              code_badge: "NEET",
              name: "NEET",
              min_criteria_label: "Min. Rank",
              min_criteria_value: "Top 5000",
              exam_code: "NEET-X5",
            },
          ],
        },
        {
          level_label: "STATE LEVEL",
          exams: [
            {
              code_badge: "KET",
              name: "Karnataka PGCET",
              min_criteria_label: "Min. Rank",
              min_criteria_value: "1200",
              exam_code: "KEA-55",
            },
            {
              code_badge: "MHT",
              name: "MHT CET",
              min_criteria_label: "Min. Percentile",
              min_criteria_value: "88%ile",
              exam_code: "MAH-99",
            },
          ],
        },
        {
          level_label: "INSTITUTIONAL LEVEL",
          exams: [
            {
              code_badge: "VUET",
              name: "Vydehi Entrance Test",
              min_criteria_label: "Min. Score",
              min_criteria_value: "60%",
              exam_code: "VUET-01",
            },
          ],
        },
      ],
    },
  };

  await prisma.course.update({
    where: { id: courseId },
    data: {
      metadata: {
        ...metadata,
        tabData: {
          ...tabData,
          admission_policy: admissionPolicy,
        },
      } as any,
    },
  });

  console.log(
    `Done — course admission_policy tab seeded for ${courseId} (${course.name}).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
