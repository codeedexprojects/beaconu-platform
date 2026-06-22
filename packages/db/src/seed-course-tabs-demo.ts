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

  const feesTabData = {
    tab: "fees",
    filters: {
      genders: ["Boys", "Girls"],
      quota_categories: ["Merit Quota", "Management Quota"],
    },
    fee_details: [
      {
        quota: "Merit Quota",
        gender: "Boys",
        fees_summary: {
          booking_amount: "INR 6,198",
          full_course_fee: "INR 1,48,750",
        },
        tuition_fees: [
          { year: "1st Year", amount: "Rs 1,25,276" },
          { year: "2nd Year", amount: "Rs 1,25,276" },
          { year: "3rd Year", amount: "Rs 1,25,276" },
          { year: "4th Year", amount: "Rs 1,25,276" },
        ],
        additional_fees: [
          { label: "Examination Fees", amount: "Rs 3,500" },
          { label: "Library Fees", amount: "Rs 1,200" },
          { label: "Lab Fees", amount: "Rs 2,800" },
          { label: "Sports Fees", amount: "Rs 1,500" },
        ],
        one_time_payable_fees: [
          { label: "Application Fees", amount: "Rs 1,500" },
          { label: "Admission Fees", amount: "Rs 15,000" },
        ],
        deadlines_and_installments: [
          {
            due: "Within 10 Days",
            label: "1st Installment (Booking)",
            amount: "Rs 25,000",
          },
          {
            due: "Before Classes Start",
            label: "2nd Installment",
            amount: "Rs 54,638",
          },
          {
            due: "After 60 Days",
            label: "Final Installment",
            amount: "Rs 54,638",
          },
        ],
      },
      {
        quota: "Merit Quota",
        gender: "Girls",
        fees_summary: {
          booking_amount: "INR 6,198",
          full_course_fee: "INR 1,48,750",
        },
        tuition_fees: [
          { year: "1st Year", amount: "Rs 1,25,276" },
          { year: "2nd Year", amount: "Rs 1,25,276" },
          { year: "3rd Year", amount: "Rs 1,25,276" },
          { year: "4th Year", amount: "Rs 1,25,276" },
        ],
        additional_fees: [
          { label: "Examination Fees", amount: "Rs 3,500" },
          { label: "Library Fees", amount: "Rs 1,200" },
          { label: "Lab Fees", amount: "Rs 2,800" },
          { label: "Sports Fees", amount: "Rs 1,500" },
        ],
        one_time_payable_fees: [
          { label: "Application Fees", amount: "Rs 1,500" },
          { label: "Admission Fees", amount: "Rs 15,000" },
        ],
        deadlines_and_installments: [
          {
            due: "Within 10 Days",
            label: "1st Installment (Booking)",
            amount: "Rs 25,000",
          },
          {
            due: "Before Classes Start",
            label: "2nd Installment",
            amount: "Rs 54,638",
          },
          {
            due: "After 60 Days",
            label: "Final Installment",
            amount: "Rs 54,638",
          },
        ],
      },
      {
        quota: "Management Quota",
        gender: "Boys",
        fees_summary: {
          booking_amount: "INR 10,000",
          full_course_fee: "INR 2,10,000",
        },
        tuition_fees: [
          { year: "1st Year", amount: "Rs 1,75,000" },
          { year: "2nd Year", amount: "Rs 1,75,000" },
          { year: "3rd Year", amount: "Rs 1,75,000" },
          { year: "4th Year", amount: "Rs 1,75,000" },
        ],
        additional_fees: [
          { label: "Examination Fees", amount: "Rs 3,500" },
          { label: "Library Fees", amount: "Rs 1,200" },
          { label: "Lab Fees", amount: "Rs 2,800" },
          { label: "Sports Fees", amount: "Rs 1,500" },
        ],
        one_time_payable_fees: [
          { label: "Application Fees", amount: "Rs 2,000" },
          { label: "Admission Fees", amount: "Rs 25,000" },
        ],
        deadlines_and_installments: [
          {
            due: "Within 10 Days",
            label: "1st Installment (Booking)",
            amount: "Rs 40,000",
          },
          {
            due: "Before Classes Start",
            label: "2nd Installment",
            amount: "Rs 85,000",
          },
          {
            due: "After 60 Days",
            label: "Final Installment",
            amount: "Rs 85,000",
          },
        ],
      },
      {
        quota: "Management Quota",
        gender: "Girls",
        fees_summary: {
          booking_amount: "INR 10,000",
          full_course_fee: "INR 2,10,000",
        },
        tuition_fees: [
          { year: "1st Year", amount: "Rs 1,75,000" },
          { year: "2nd Year", amount: "Rs 1,75,000" },
          { year: "3rd Year", amount: "Rs 1,75,000" },
          { year: "4th Year", amount: "Rs 1,75,000" },
        ],
        additional_fees: [
          { label: "Examination Fees", amount: "Rs 3,500" },
          { label: "Library Fees", amount: "Rs 1,200" },
          { label: "Lab Fees", amount: "Rs 2,800" },
          { label: "Sports Fees", amount: "Rs 1,500" },
        ],
        one_time_payable_fees: [
          { label: "Application Fees", amount: "Rs 2,000" },
          { label: "Admission Fees", amount: "Rs 25,000" },
        ],
        deadlines_and_installments: [
          {
            due: "Within 10 Days",
            label: "1st Installment (Booking)",
            amount: "Rs 40,000",
          },
          {
            due: "Before Classes Start",
            label: "2nd Installment",
            amount: "Rs 85,000",
          },
          {
            due: "After 60 Days",
            label: "Final Installment",
            amount: "Rs 85,000",
          },
        ],
      },
    ],
    whats_included: [
      "Tuition Fees",
      "Library Access",
      "Lab Materials",
      "Basic Medical Aid",
    ],
    whats_excluded: [
      "Uniform Dress",
      "University Exam Fees",
      "Transportation",
      "Convocation Fee",
    ],
    refund_policy: [
      "Booking amount refundable within limited time",
      "Processing charges may apply",
      "Refund processed within 7-10 working days",
    ],
    fee_structure_pdf: {
      url: "https://cdn.feereports.example.com/fee-structure-2025.pdf",
      size: "2.4 MB",
      label: "Detailed breakdown PDF",
    },
  };

  const financialAidTabData = {
    tab: "financial_aid",
    merit_scholarship: {
      title: "Merit Scholarship",
      calculator: {
        rank_range_options: [
          "1 - 1000",
          "1001 - 5000",
          "5001 - 10000",
          "10001 - 25000",
          "25001 - 50000",
        ],
        port_of_entry_options: [
          "JEE Main",
          "KEAM",
          "State Merit",
          "Management Quota",
        ],
      },
      final_summary: {
        max_scholarship: "Rs1,50,000",
        net_payable_fees: "Rs2,45,000",
      },
      terms_and_conditions: [
        "Students can avail 25% of scholarship based on the entered rank/score.",
        "Applicable only for the first year. Subsequent years require CGPA 8.0+.",
        "Offered on a first-come, first-serve basis subject to seat availability.",
      ],
    },
    financial_concessions: {
      total_types: 4,
      items: [
        {
          name: "Defence personnel",
          discount_percent: 20,
          details: {
            net_payable: "",
            scholarship_amount: "",
            eligibility_criteria: [],
          },
        },
        {
          name: "Divyaang (PwD)",
          discount_percent: 20,
          details: {
            net_payable: "",
            scholarship_amount: "",
            eligibility_criteria: [],
          },
        },
        {
          name: "Alumni",
          discount_percent: 15,
          details: {
            net_payable: "Rs3,20,000",
            scholarship_amount: "Rs75,000",
            eligibility_criteria: [
              "Must have completed a full-time degree program.",
              "Valid alumni association membership card required.",
            ],
          },
        },
        {
          name: "Upfront Fees Concession",
          discount_percent: 5,
          details: {
            net_payable: "",
            scholarship_amount: "",
            eligibility_criteria: [],
          },
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
          course_info: updatedCourseInfo,
          fees: feesTabData,
          financial_aid: financialAidTabData,
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
    `Done — course detail tabs (fees + financial_aid) for ${courseId} (${course.name}) are now fully populated.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
