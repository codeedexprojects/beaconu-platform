import "dotenv/config";
import { prisma } from "./index";

/**
 * One-off seed for testing the public "course detail" API
 * (GET /api/v1/public/colleges/by-slug/:collegeSlug/courses/:courseId via
 * CourseTabsService.getPublicCourseDetail).
 *
 * The read side is a pure passthrough for these Course JSON columns
 * (`course.highlights ?? {}` etc, see course-tabs.service.ts) and checks
 * `course_info.admission_batches` / `.quick_info` as explicit overrides
 * before falling back to derivation — so whatever exact shape is stored
 * here is exactly what the API returns, with no service-layer
 * transformation. This seed stores the full display-ready shape directly.
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
    admission_batches: [
      {
        label: "Admissions 2025",
        status: "open",
        banner: {
          enabled: true,
          tag: "ADMISSIONS OPEN",
          message: "Limited seats available for current intake",
          progress_percentage: 90,
        },
      },
      {
        label: "Admissions 2026",
        status: "upcoming",
        banner: {
          enabled: false,
          tag: "UPCOMING",
          message: "",
          progress_percentage: 0,
        },
      },
    ],
    student_forum: {
      enabled: true,
      icon: "https://cdn.iconsdb.example.com/icons/forum-people.png",
      title: "Student Forum",
      description:
        "Have queries/doubts? Connect directly with our college team or chat with our ex-students.",
      cta_label: "Ask the Admission Team",
      cta_icon: "https://cdn.iconsdb.example.com/icons/chat-bubble-orange.png",
      link: "https://example.com/forum/ask-admission-team",
    },
    bonus_certification: {
      tag: "BONUS CERTIFICATION",
      title: "Tally Prime Certification",
      description: "Included with Finance specialization at no extra cost.",
      cta_label: "View Certificate Details",
      link: "https://example.com/certifications/tally-prime",
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
      name: "MBA Digital Transformation",
      metadata: {
        ...metadata,
        tabData: {
          ...tabData,
          course_info: updatedCourseInfo,
          fees: feesTabData,
          financial_aid: financialAidTabData,
        },
      } as any,
      highlights: {
        title: "Program Highlights",
        items: [
          {
            text: "AI activity in India alone has witnessed a 2.7 times growth",
          },
          {
            text: "Generative AI (GenAI) has recorded an extraordinary 9 times surge, with 34 percent of enterprises launching GenAI-based products or services, 31 percent forming collaborations and partnerships.",
          },
          {
            text: "India's AI market is projected to reach 17 billion dollars by 2027, with an expected annual growth rate of 25 to 35 percent.",
          },
          {
            text: "A critical talent gap between 60 to 73 percent in AI roles, creating opportunities for those with the right skills.",
          },
        ],
      } as any,
      accreditations: {
        title: "Course Accolades",
        items: [
          {
            tag: "MAHE Rank 3",
            image:
              "https://cdn.brandlogos.example.com/logos/outlook-icare-ranking-2024.png",
            title: "India's top #131/200 universities in 2024",
          },
          {
            tag: "MAHE Rank 3",
            image:
              "https://cdn.brandlogos.example.com/logos/outlook-icare-ranking-2024.png",
            title: "India's top #131/200 universities in 2024",
          },
        ],
      } as any,
      keyDates: {
        title: "Key Dates to Remember",
        items: [
          {
            icon: "https://cdn.iconsdb.example.com/icons/calendar-check-green.png",
            label: "APPLICATION START",
            date: "10th June 2024",
            status: "",
            status_color: "",
          },
          {
            icon: "https://cdn.iconsdb.example.com/icons/calendar-warning-orange.png",
            label: "APPLICATION CLOSE",
            date: "30th July 2024",
            status: "URGENT",
            status_color: "orange",
          },
          {
            icon: "https://cdn.iconsdb.example.com/icons/calendar-gray.png",
            label: "CLASS COMMENCEMENT",
            date: "10th August 2024",
            status: "Tentative",
            status_color: "gray",
          },
        ],
      } as any,
      curriculum: {
        title: "Curriculum",
        subtitle: "Explore list of subjects wise covered in our MBA program.",
        brochure: {
          icon: "https://cdn.iconsdb.example.com/icons/download-pdf.png",
          label: "Download Curriculum Brochure",
          url: "https://cdn.brochures.example.com/mba-digital-transformation-curriculum.pdf",
        },
        semesters: [
          {
            id: "sem_1",
            name: "Semester 1",
            expanded: false,
            core_subjects: [],
            specializations: [],
          },
          {
            id: "sem_2",
            name: "Semester 2",
            expanded: false,
            core_subjects: [],
            specializations: [],
          },
          {
            id: "sem_3",
            name: "Semester 3",
            expanded: false,
            core_subjects: [],
            specializations: [],
          },
          {
            id: "sem_4",
            name: "Semester 4",
            expanded: true,
            core_subjects: ["Banking and Insurance Management", "Project Work"],
            specializations: [
              {
                title: "Specialization 1:",
                selected: "Marketing",
                subjects: [
                  "Market Research",
                  "Service Marketing & Global Marketing",
                ],
              },
              {
                title: "Specialization 2:",
                selected: "Select Elective",
                subjects: [],
              },
            ],
            footnote:
              "Learner will select an avenue for internship and specialization during the final semester.",
          },
        ],
      } as any,
      courseStructure: {
        title: "Course Structure",
        subtitle: "The total will sum 102 credits at the end of two years.",
        chart_type: "donut",
        segments: [
          { label: "Disciplinary Major", credits: 60, color: "#FF6B00" },
          { label: "Occupational Track", credits: 24, color: "#FFB27A" },
          { label: "Flexible Courses", credits: 23, color: "#2E2E5C" },
          { label: "Research/Internship", credits: 12, color: "#4DD0C4" },
          { label: "Common Curriculum", credits: 10, color: "#A8A8B3" },
        ],
      } as any,
      valueAddedCourses: {
        title: "Value Added Course",
        items: [
          {
            name: "Cyber Security",
            credit_label: "Credit: 03",
            delivery_mode_label: "DELIVERY MODES",
            delivery_modes: ["MOOC Courses"],
          },
        ],
      } as any,
      careerOpportunities: {
        title: "Career Opportunities",
        items: [
          { role: "Data Scientist", salary_range: "₹6L - ₹25L PA" },
          { role: "Marketing Manager", salary_range: "₹6L - ₹18L PA" },
          { role: "Business Analyst", salary_range: "₹5L - ₹22L PA" },
          { role: "Product Manager", salary_range: "₹12L - ₹30L PA" },
          { role: "Digital Strategist", salary_range: "₹6L - ₹19L PA" },
        ],
      } as any,
      higherEducationCertifications: {
        global: {
          title: "GLOBAL CERTIFICATIONS",
          icon: "https://cdn.iconsdb.example.com/icons/globe-orange.png",
          items: [
            "Project Management Professional (PMP)",
            "Certified Information Systems Auditor (CISA)",
            "Google Data Analytics Professional Certificate",
          ],
        },
        postgraduation: {
          title: "POSTGRADUATION",
          icon: "https://cdn.iconsdb.example.com/icons/graduation-cap-orange.png",
          items: [
            "PhD in Management Studies",
            "Specialized Masters in Artificial Intelligence",
            "Executive MBA in Global Business",
          ],
        },
      } as any,
      flexibleExitOptions: {
        title: "Flexible Exit Options",
        subtitle: "Life happens. Pause or exit with a valid credential.",
        items: [
          {
            step: 1,
            label: "After 1 Year",
            award: "Post Graduate Diploma in Management",
          },
          {
            step: 2,
            label: "After 2 Years",
            award: "Master of Business Administration (MBA)",
          },
        ],
      } as any,
      classTimings: {
        title: "Class Timings",
        subtitle: "Regular Classes",
        schedule: [
          { day: "Monday", time: "09:00 AM - 04:30 PM" },
          { day: "Tuesday", time: "09:00 AM - 04:30 PM" },
          { day: "Wednesday", time: "09:00 AM - 04:30 PM" },
          { day: "Thursday", time: "09:00 AM - 04:30 PM" },
          { day: "Friday", time: "09:00 AM - 04:30 PM" },
          { day: "Saturday", time: "Closed" },
          { day: "Sunday", time: "Closed" },
        ],
      } as any,
      industryTools: {
        title: "Industry Tools You'll Master",
        items: [
          { name: "Tableau" },
          { name: "Python" },
          { name: "SPSS" },
          { name: "R Studio" },
          { name: "PowerBI" },
          { name: "Salesforce" },
        ],
      } as any,
      labFacilities: {
        title: "Lab Facilities for MBA Digital Transformation",
        items: [
          { name: "AI/ML Research Lab" },
          { name: "Mac Development Lab" },
        ],
      } as any,
      roomFacilities: {
        title: "Class Room Facilities",
        items: [
          {
            icon: "https://cdn.iconsdb.example.com/icons/smart-board-dark.png",
            name: "Smart Interactive Boards",
          },
          {
            icon: "https://cdn.iconsdb.example.com/icons/wifi-dark.png",
            name: "High-Speed Wi-Fi",
          },
          {
            icon: "https://cdn.iconsdb.example.com/icons/chair-dark.png",
            name: "Ergonomic Seating",
          },
        ],
      } as any,
      featuredAlumni: {
        title: "Featured Alumni",
        highlight_word: "Alumni",
        items: [
          {
            name: "Amit Verma",
            designation: "CHIEF MOM (E-BANKING)",
            image: "https://cdn.alumniphotos.example.com/photos/amit-verma.jpg",
            career_progression: [
              {
                year: "2018",
                tag_color: "orange",
                description: "Completed graduation and explored career options",
              },
              {
                year: "2019",
                tag_color: "orange",
                description:
                  "Enrolled in Online MBA in Marketing while pursuing Mentorship",
              },
              {
                year: "2021",
                tag_color: "orange",
                description:
                  "Became full-time Senior Digital Marketing Associate",
              },
              {
                year: "2023",
                tag_color: "orange",
                description:
                  "Promoted to Senior Brand Manager at a Media agency",
              },
            ],
          },
        ],
      } as any,
      faqs: {
        title: "Frequently Asked Questions",
        items: [
          {
            question: "What is the eligibility for this MBA?",
            answer: "",
            expanded: false,
          },
          {
            question: "Is there any scholarship available?",
            answer: "",
            expanded: false,
          },
          {
            question: "Can I pursue this course part-time?",
            answer: "",
            expanded: false,
          },
        ],
      } as any,
    },
  });

  console.log(
    `Done — course detail tabs (course_info, fees, financial_aid, and all display-page sections) for ${courseId} (${course.name}) are now fully populated.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
