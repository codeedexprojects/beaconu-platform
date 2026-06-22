import "dotenv/config";
import { prisma } from "./index";

/**
 * One-off seed for testing the blink employee "course detail" API
 * (GET /api/v1/blink/employee/colleges/:collegeId/courses/:courseId):
 * fills in every field that endpoint reads — campus, course detail-page
 * JSON fields, a quota, a fully-populated fee structure, and a service
 * charge config — on one existing course, so no field comes back empty.
 *
 * Usage: pnpm --filter @beaconu/db exec tsx src/seed-course-detail-demo.ts [collegeId] [courseCode]
 */
async function main() {
  const collegeId = process.argv[2] || "CLG-1";
  const courseCode = process.argv[3] || "MCA-DEMO";

  const course = await prisma.course.findFirst({
    where: { collegeId, code: courseCode },
  });
  if (!course) {
    throw new Error(
      `Course ${courseCode} not found for ${collegeId} — run seed-institution-departments.ts first`,
    );
  }

  let campus = await prisma.campus.findFirst({
    where: { collegeId, name: "Main Campus" },
  });
  if (!campus) {
    campus = await prisma.campus.create({
      data: {
        collegeId,
        name: "Main Campus",
        address: "NH 544, Pampady",
        city: "Cherpulassery",
        state: "Kerala",
        pinCode: "679503",
        isMainCampus: true,
      },
    });
  }
  console.log(`✓ Campus ensured: ${campus.name} (${campus.id})`);

  await prisma.course.update({
    where: { id: course.id },
    data: {
      campusId: campus.id,
      eligibility:
        "Bachelor's degree in any discipline with 50% aggregate marks",
      intakeCapacity: 60,
      highlights: [
        "Industry-aligned curriculum with live projects",
        "100% placement assistance",
        "Dedicated AI/ML and Cloud Computing labs",
      ],
      curriculum: [
        {
          semester: 1,
          subjects: [
            "Programming Fundamentals",
            "Discrete Mathematics",
            "Digital Logic",
          ],
          specializations: [],
        },
        {
          semester: 2,
          subjects: [
            "Data Structures",
            "Database Systems",
            "Computer Networks",
          ],
          specializations: ["AI & Machine Learning", "Cloud Computing"],
        },
      ],
      careerOpportunities: [
        { role: "Software Engineer", salaryRange: "4-8 LPA" },
        { role: "Data Analyst", salaryRange: "3.5-7 LPA" },
        { role: "Systems Administrator", salaryRange: "3-6 LPA" },
      ],
      eligibilityCriteria: {
        minimum_percentage: 50,
        required_subjects: ["Mathematics"],
        entrance_exam: "Not required",
      },
      faqs: [
        {
          question: "Is hostel accommodation available?",
          answer:
            "Yes, separate hostels for men and women are available on campus.",
        },
        {
          question: "Does this course offer lateral entry?",
          answer:
            "Yes, lateral entry is available for diploma holders into the 2nd year.",
        },
      ],
    },
  });
  console.log(`✓ Course detail fields populated for ${course.name}`);

  const quota = await prisma.courseQuota.upsert({
    where: {
      uq_course_quota: { courseId: course.id, quotaName: "Management Quota" },
    },
    update: {
      seats: 10,
      tuitionFeeOverride: 250000,
      isActive: true,
    },
    create: {
      courseId: course.id,
      quotaName: "Management Quota",
      seats: 10,
      tuitionFeeOverride: 250000,
      isActive: true,
    },
  });
  console.log(`✓ Quota ensured: ${quota.quotaName} (${quota.seats} seats)`);

  const existingFee = await prisma.feeStructure.findFirst({
    where: {
      collegeId,
      courseId: course.id,
      academicYear: "2026-27",
      feeCategory: "tuition_fee",
    },
  });

  const feeData = {
    yearOrSemester: "Year 1",
    instalmentAllowed: true,
    instalmentConfig: {
      instalments: [
        { label: "1st Instalment", amount: 110000, dueDate: "2026-07-01" },
        { label: "2nd Instalment", amount: 110000, dueDate: "2026-12-01" },
      ],
    },
    gender: "both",
    oneTimeFees: [
      { label: "Admission Fee", amount: 5000 },
      { label: "Caution Deposit", amount: 5000 },
    ],
    additionalFees: [
      { label: "Hostel Fee (optional)", amount: 45000 },
      { label: "Bus Fee (optional)", amount: 18000 },
    ],
    whatsIncluded: ["Tuition", "Library access", "Lab fee"],
    whatsExcluded: ["Hostel", "Transportation", "Exam fee"],
    feePdfUrl: "https://example.com/fee-structure/mca-2026-27.pdf",
  };

  if (existingFee) {
    await prisma.feeStructure.update({
      where: { id: existingFee.id },
      data: feeData,
    });
  } else {
    await prisma.feeStructure.create({
      data: {
        collegeId,
        courseId: course.id,
        academicYear: "2026-27",
        feeCategory: "tuition_fee",
        amount: 220000,
        isActive: true,
        ...feeData,
      },
    });
  }
  console.log("✓ Fee structure fully populated");

  const existingServiceCharge = await prisma.serviceChargeConfig.findFirst({
    where: { collegeId, courseId: course.id, academicYear: "2026-27" },
  });

  const serviceChargeData = {
    studentCategory: "general",
    grossAmount: 20000,
    gstPercentage: 18,
    gstAmount: 3600,
    netPayout: 16400,
    termsAndConditions:
      "Payout released within 30 days of fee payment confirmation by the college.",
    isActive: true,
  };

  if (existingServiceCharge) {
    await prisma.serviceChargeConfig.update({
      where: { id: existingServiceCharge.id },
      data: serviceChargeData,
    });
  } else {
    await prisma.serviceChargeConfig.create({
      data: {
        collegeId,
        courseId: course.id,
        academicYear: "2026-27",
        ...serviceChargeData,
      },
    });
  }
  console.log("✓ Service charge config ensured");

  console.log(
    `Done — course detail for ${course.id} (${course.code}) is now fully populated.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
