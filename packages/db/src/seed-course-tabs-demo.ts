import "dotenv/config";
import { prisma } from "./index";

/**
 * One-off seed for testing the public "course detail" API
 * (GET /api/v1/public/colleges/:collegeSlug/courses/:courseId via
 * CourseTabsService.getPublicCourseDetail): fills in every field that
 * endpoint reads but is currently empty — student_forum/bonus_certification
 * inside metadata.tabData.course_info, and every top-level Course JSON
 * "detail page" column (highlights, accreditations, etc).
 *
 * admission_batches/quick_info are already derived correctly from existing
 * course_info.admissions/overview/admission_status data — left untouched.
 *
 * Usage: pnpm --filter @beaconu/db exec tsx src/seed-course-tabs-demo.ts [courseId]
 */
async function main() {
  const courseId = process.argv[2] || "CRS-2";

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }

  const metadata = (course.metadata ?? {}) as Record<string, unknown>;
  const tabData = (metadata.tabData ?? {}) as Record<string, unknown>;
  const courseInfo = (tabData.course_info ?? {}) as Record<string, unknown>;

  const updatedCourseInfo = {
    ...courseInfo,
    student_forum: {
      ex_student_chat:
        "https://chat.beaconu.app/forums/mba-digital-transformation",
      admission_team_contact: "+91 98765 43210",
    },
    bonus_certification: {
      name: "Google Digital Marketing Certification",
      note: "Awarded on completion of the digital transformation specialization track",
      certificate_link:
        "https://example.com/certifications/google-digital-marketing",
    },
  };

  await prisma.course.update({
    where: { id: courseId },
    data: {
      metadata: {
        ...metadata,
        tabData: {
          ...tabData,
          course_info: updatedCourseInfo,
        },
      } as any,
      highlights: [
        "Industry-aligned curriculum with live case studies",
        "Dedicated placement cell with 90%+ placement rate",
        "Guest lectures from industry leaders every semester",
      ],
      accreditations: [
        { name: "NAAC A+ Grade", issuedBy: "NAAC", year: "2024" },
        { name: "AICTE Approved", issuedBy: "AICTE", year: "2023" },
      ],
      keyDates: [
        { label: "Application Deadline", date: "2026-07-15" },
        { label: "Entrance Exam", date: "2026-07-25" },
        { label: "Classes Begin", date: "2026-08-10" },
      ],
      curriculum: [
        {
          semester: 1,
          subjects: [
            "Principles of Management",
            "Digital Marketing Fundamentals",
            "Business Statistics",
          ],
          specializations: [],
        },
        {
          semester: 2,
          subjects: [
            "Data Analytics",
            "Consumer Behaviour",
            "Financial Management",
          ],
          specializations: ["Digital Transformation", "Business Analytics"],
        },
      ],
      courseStructure: {
        total_credits: 102,
        core_credits: 72,
        elective_credits: 18,
        project_credits: 12,
      },
      valueAddedCourses: [
        {
          name: "Google Analytics Certification",
          credits: 2,
          deliveryMode: "online",
        },
        { name: "Power BI for Business", credits: 2, deliveryMode: "hybrid" },
      ],
      careerOpportunities: [
        { role: "Digital Marketing Manager", salaryRange: "6-12 LPA" },
        { role: "Business Analyst", salaryRange: "5-10 LPA" },
        { role: "Product Manager", salaryRange: "8-15 LPA" },
      ],
      higherEducationCertifications: {
        global: ["MBA Global Exchange Program (Germany, Singapore)"],
        postGraduation: ["PhD in Management", "Executive MBA"],
      },
      flexibleExitOptions: [
        { afterYears: 1, awardName: "PG Certificate in Management" },
        { afterYears: 2, awardName: "MBA Degree" },
      ],
      classTimings: {
        monday: { start: "09:00", end: "16:00", status: "regular" },
        tuesday: { start: "09:00", end: "16:00", status: "regular" },
        saturday: { start: "09:00", end: "13:00", status: "half_day" },
      },
      industryTools: ["Tableau", "Power BI", "Google Analytics", "SAP"],
      labFacilities: [
        "Digital Marketing Lab",
        "Bloomberg Terminal Lab",
        "Business Simulation Lab",
      ],
      roomFacilities: [
        "Smart classrooms with projectors",
        "Air-conditioned seminar halls",
      ],
      featuredAlumni: [
        {
          name: "Anjali Menon",
          batch: "2022",
          designation: "Product Manager at Flipkart",
        },
        {
          name: "Rahul Nair",
          batch: "2021",
          designation: "Marketing Lead at Zomato",
        },
      ],
      faqs: [
        {
          question: "Is there a lateral entry option for this course?",
          answer:
            "Yes, lateral entry is available for candidates with a relevant PG diploma.",
        },
        {
          question: "Are internships mandatory?",
          answer:
            "Yes, a minimum 8-week internship is mandatory in the 3rd semester.",
        },
      ],
    },
  });

  console.log(
    `Done — course detail tabs for ${courseId} (${course.name}) are now fully populated.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
