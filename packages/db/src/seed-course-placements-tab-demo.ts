import "dotenv/config";
import { prisma } from "./index";

/**
 * One-off seed for testing the public course-level "placements" tab API
 * (GET /api/v1/public/colleges/by-slug/:slug/courses/:courseId/tabs/placements).
 *
 * "placements" is a course setup tab stored at metadata.tabData.placements
 * (course-tabs.validator.ts COURSE_SETUP_TAB_IDS) and read as a pure
 * passthrough — `tabData[tabName] ?? {}`, no service-layer transformation
 * (course-tabs.service.ts getSetupTabDataFromMetadata). So this seed
 * overwrites that key entirely with the exact display-ready shape,
 * matching the same rich format used for the college-level
 * profileSections.placements section (seed-college-placements-demo.ts) —
 * the two are unrelated keys but share the same target shape here.
 *
 * Usage: pnpm --filter @beaconu/db exec tsx src/seed-course-placements-tab-demo.ts [courseId]
 */
async function main() {
  const courseId = process.argv[2] || "CRS-2";

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }

  const metadata = (course.metadata ?? {}) as Record<string, unknown>;
  const tabData = (metadata.tabData ?? {}) as Record<string, unknown>;

  const placements = {
    id: "placements",
    title: "Placements",
    enabled: true,
    download_report: {
      label: "Download Full Placement Report 2024",
      icon: "https://cdn.iconsdb.example.com/icons/pdf-document-purple.png",
      url: "https://cdn.reports.example.com/placement-report-2024.pdf",
    },
    summary_stats: [
      {
        icon: "https://cdn.iconsdb.example.com/icons/bar-chart-white.png",
        icon_bg_color: "#FF6B00",
        label: "Average Package",
        value: "4.2",
        unit: "LPA",
      },
      {
        icon: "https://cdn.iconsdb.example.com/icons/trend-up-white.png",
        icon_bg_color: "#FF6B00",
        label: "Highest Package",
        value: "14.2",
        unit: "LPA",
      },
      {
        icon: "",
        icon_bg_color: "",
        label: "Placement Rate",
        value: "94",
        unit: "%",
      },
      {
        icon: "",
        icon_bg_color: "",
        label: "Lowest Package",
        value: "3.5",
        unit: "LPA",
      },
      {
        icon: "",
        icon_bg_color: "",
        label: "Companies Visited",
        value: "120",
        unit: "+",
      },
      {
        icon: "",
        icon_bg_color: "",
        label: "Students Placed",
        value: "450",
        unit: "+",
      },
    ],
    placement_trends: {
      title: "Placement Trends",
      duration_filter: "Last 5 Years",
      data_points: [
        { year: "2020", avg_package: 2.8, highlighted: false },
        { year: "2021", avg_package: 3.2, highlighted: false },
        { year: "2022", avg_package: 3.7, highlighted: false },
        { year: "2023", avg_package: 4.2, highlighted: true },
      ],
      footer: {
        label: "Avg Package Growth",
        value: "+12.5% YoY",
        value_color: "green",
      },
    },
    industry_salary_report: {
      title: "Industry & Salary Report",
      rows: [
        {
          industry: "BFSI",
          subtitle: "Banking & Finance",
          students_placed: 155,
          avg_package: "8.2 L",
          max_package: "12 LPA",
          progress_percentage: 65,
        },
        {
          industry: "FMCG",
          subtitle: "Retail & Goods",
          students_placed: 98,
          avg_package: "7.5 L",
          max_package: "10 LPA",
          progress_percentage: 45,
        },
        {
          industry: "Consulting",
          subtitle: "Mgmt Consulting",
          students_placed: 81,
          avg_package: "9.1 L",
          max_package: "14.5 LPA",
          progress_percentage: 38,
        },
      ],
    },
    notable_offers: {
      title: "Notable Offers",
      items: [
        {
          id: "offer_1",
          company_name: "Deloitte",
          company_initial: "D",
          company_logo:
            "https://cdn.companylogos.example.com/logos/deloitte.png",
          category: "Consulting",
          badge: "HIGHEST",
          badge_color: "orange",
          package_label: "Package Offered",
          package: "14.5",
          unit: "LPA",
          role: "Senior Analyst Role",
        },
        {
          id: "offer_2",
          company_name: "TCS",
          company_initial: "T",
          company_logo: "https://cdn.companylogos.example.com/logos/tcs.png",
          category: "IT Services",
          badge: "",
          badge_color: "",
          package_label: "Package Offered",
          package: "12.0",
          unit: "LPA",
          role: "Systems Engineer",
        },
      ],
    },
    all_company_statistics: {
      title: "All Company Statistics",
      rows: [
        {
          company_name: "Deloitte",
          company_initial: "D",
          company_logo:
            "https://cdn.companylogos.example.com/logos/deloitte.png",
          logo_bg_color: "#000000",
          students_placed: 145,
          avg_package: "9.2 L",
          max_package: "14.5 L",
          progress_percentage: 70,
        },
        {
          company_name: "Accenture",
          company_initial: "A",
          company_logo:
            "https://cdn.companylogos.example.com/logos/accenture.png",
          logo_bg_color: "#A100FF",
          students_placed: 210,
          avg_package: "7.8 L",
          max_package: "11.2 L",
          progress_percentage: 55,
        },
        {
          company_name: "TCS",
          company_initial: "T",
          company_logo: "https://cdn.companylogos.example.com/logos/tcs.png",
          logo_bg_color: "#E2231A",
          students_placed: 340,
          avg_package: "6.5 L",
          max_package: "9.0 L",
          progress_percentage: 48,
        },
      ],
    },
    student_success: {
      title: "Student Success",
      items: [
        {
          type: "mp4",
          thumbnail:
            "https://cdn.videothumbs.example.com/student-success/rohan-mehta-thumb.jpg",
          video_url:
            "https://res.cloudinary.example.com/video/upload/rohan-mehta-success.mp4",
          quote:
            "The placement support helped me secure a role at a top firm. Best decision ever!",
          student_name: "Rohan Mehta",
          student_avatar:
            "https://cdn.studentphotos.example.com/photos/rohan-mehta.jpg",
          placed_at: "Deloitte",
        },
        {
          type: "youtube",
          thumbnail:
            "https://cdn.videothumbs.example.com/student-success/priya-success-thumb.jpg",
          video_url: "https://www.youtube.com/watch?v=example123",
          quote:
            "I never expected such a great package. The faculty mentorship was key.",
          student_name: "Priya Nair",
          student_avatar:
            "https://cdn.studentphotos.example.com/photos/priya-nair.jpg",
          placed_at: "Accenture",
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
          placements,
        },
      } as any,
    },
  });

  console.log(
    `Done — course placements tab for ${courseId} (${course.name}) now matches the target shape.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
