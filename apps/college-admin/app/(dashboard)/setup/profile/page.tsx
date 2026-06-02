"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Loader2,
  ArrowRight,
  Building,
  Award,
  BookOpen,
  DollarSign,
  GraduationCap,
  Plus,
  Trash2,
  Globe,
  PlusCircle,
  Play,
  Star,
  Users,
  Compass,
  MapPin,
  TrendingUp,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  useCollegeCampuses,
  useCreateCollegeCourse,
  useCollegeCourses,
  useCollegeProfile,
  useMyInstitutionGroup,
  useUpdateCollegeProfile,
} from "@/hooks/use-colleges";
import {
  useProgramTypes,
  useStreams,
  useStudyLevels,
} from "@/hooks/use-lookups";
import { usePublicColleges } from "@/hooks/use-public-colleges";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

const PROFILE_SECTION_IDS = {
  college_overview: "college_overview",
  course_info: "course_info",
  admission_policy: "admission_policy",
  placements: "placements",
  fees: "fees",
  financial_aid: "financial_aid",
  student_housing: "student_housing",
  exam_policy: "exam_policy",
  faculty: "faculty",
  review: "review",
  commute: "commute",
  library: "library",
  clubs_associations: "clubs_associations",
  student_code_of_conduct: "student_code_of_conduct",
  happenings: "happenings",
  institutions_across_world: "institutions_across_world",
  alliance: "alliance",
  other_courses_offered: "other_courses_offered",
  demo_graphics: "demo_graphics",
} as const;

const PROFILE_SECTION_TABS = [
  { key: "college_overview", label: "College Overview" },
  { key: "course_info", label: "Course Info" },
  { key: "other_courses_offered", label: "Other Courses" },
  { key: "admission_policy", label: "Admission Policy" },
  { key: "placements", label: "Placements" },
  { key: "fees", label: "Fees" },
  { key: "financial_aid", label: "Financial Aid" },
  { key: "student_housing", label: "Student Housing" },
  { key: "exam_policy", label: "Exam Policy" },
  { key: "faculty", label: "Faculty" },
  { key: "review", label: "Review" },
  { key: "commute", label: "Commute" },
  { key: "library", label: "Library" },
  { key: "clubs_associations", label: "Club & Associations" },
  { key: "student_code_of_conduct", label: "Student Code of Conduct" },
  { key: "happenings", label: "Happenings" },
  {
    key: "institutions_across_world",
    label: "Institutions Across the World",
  },
  { key: "alliance", label: "Alliance" },
  { key: "demo_graphics", label: "Demo Graphics" },
] as const;

const ONBOARDING_TABS = [
  { id: "basic", label: "Basic Info", icon: Building },
  { id: "college_overview", label: "College Overview", icon: Compass },
  { id: "course_info", label: "Course Info", icon: BookOpen },
  { id: "other_courses_offered", label: "Other Courses", icon: BookOpen },
  { id: "admission_policy", label: "Admission Policy", icon: GraduationCap },
  { id: "placements", label: "Placements", icon: TrendingUp },
  { id: "fees", label: "Fees", icon: DollarSign },
  { id: "financial_aid", label: "Financial Aid", icon: Award },
  { id: "student_housing", label: "Student Housing", icon: Building },
  { id: "exam_policy", label: "Exam Policy", icon: FileText },
  { id: "faculty", label: "Faculty", icon: Users },
  { id: "review", label: "Review", icon: Star },
  { id: "commute", label: "Commute", icon: MapPin },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "clubs_associations", label: "Club & Associations", icon: Users },
  {
    id: "student_code_of_conduct",
    label: "Student Code of Conduct",
    icon: FileText,
  },
  { id: "happenings", label: "Happenings", icon: Play },
  {
    id: "institutions_across_world",
    label: "Institutions Across World",
    icon: Globe,
  },
  { id: "alliance", label: "Alliance", icon: PlusCircle },
  { id: "demo_graphics", label: "Demo Graphics", icon: FileText },
] as const;

type OnboardingTabId = (typeof ONBOARDING_TABS)[number]["id"];

const GENERIC_SECTION_TABS = [
  "student_housing",
  "faculty",
  "commute",
  "clubs_associations",
  "happenings",
  "institutions_across_world",
  "alliance",
  "demo_graphics",
] as const;

type GenericSectionTabId = (typeof GENERIC_SECTION_TABS)[number];

function isGenericSectionTab(tab: OnboardingTabId): tab is GenericSectionTabId {
  return (GENERIC_SECTION_TABS as readonly string[]).includes(tab);
}

const metaSectionSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean().default(true),
});

const marksDistributionSchema = z.object({
  theory: z.number().default(0),
  practical: z.number().default(0),
  internal: z.number().default(0),
  total: z.number().default(100),
});

const examSummarySchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
});

const reviewSectionSchema = metaSectionSchema.extend({
  overallRating: z.object({
    rating: z.number().default(0),
    totalReviews: z.number().default(0),
  }),
  ratingDistribution: z
    .array(
      z.object({
        emoji: z.string().default(""),
        count: z.number().default(0),
      }),
    )
    .default([]),
  categoryRatings: z
    .array(
      z.object({
        category: z.string().default(""),
        rating: z.number().default(0),
      }),
    )
    .default([]),
  reviews: z
    .array(
      z.object({
        reviewerName: z.string().default(""),
        reviewDate: z.string().default(""),
        reviewText: z.string().default(""),
      }),
    )
    .default([]),
  pagination: z.object({
    loadMoreEnabled: z.boolean().default(true),
    page: z.number().default(1),
    pageSize: z.number().default(10),
    hasMore: z.boolean().default(true),
  }),
});

const librarySectionSchema = metaSectionSchema.extend({
  libraryInfo: z.object({
    libraryName: z.string().default(""),
    areaSqFeet: z.number().default(0),
    totalSeats: z.number().default(0),
    totalVolumes: z.number().default(0),
    researchCabins: z.number().default(0),
  }),
  availableResources: z
    .array(
      z.object({
        resourceType: z.string().default(""),
        count: z.number().default(0),
      }),
    )
    .default([]),
  libraryHours: z
    .array(
      z.object({
        day: z.string().default(""),
        workingHours: z.string().default(""),
        transactionHours: z.string().default(""),
      }),
    )
    .default([]),
  facilities: z
    .array(
      z.object({
        title: z.string().default(""),
        image: z.string().default(""),
      }),
    )
    .default([]),
});

const studentCodeOfConductSectionSchema = metaSectionSchema.extend({
  title: z.string().default(""),
  disciplineRules: z
    .array(
      z.object({
        order: z.number().default(0),
        rule: z.string().default(""),
      }),
    )
    .default([]),
});

const facultySectionSchema = metaSectionSchema.extend({
  summary: z.string().default(""),
  members: z
    .array(
      z.object({
        name: z.string().default(""),
        photo: z.string().default(""),
        role: z.string().default(""),
        department: z.string().default(""),
      }),
    )
    .default([]),
});

const clubsAssociationsSectionSchema = metaSectionSchema.extend({
  summary: z.string().default(""),
  items: z
    .array(
      z.object({
        clubName: z.string().default(""),
        service: z.string().default(""),
        serviceDescription: z.string().default(""),
      }),
    )
    .default([]),
});

const happeningsSectionSchema = metaSectionSchema.extend({
  summary: z.string().default(""),
  items: z
    .array(
      z.object({
        photo: z.string().default(""),
        type: z.string().default(""),
        title: z.string().default(""),
        date: z.string().default(""),
        description: z.string().default(""),
      }),
    )
    .default([]),
});

const allianceSectionSchema = metaSectionSchema.extend({
  summary: z.string().default(""),
  items: z
    .array(
      z.object({
        sourceCollegeId: z.string().default(""),
        sourceCollegeSlug: z.string().default(""),
        sourceCollegeName: z.string().default(""),
        image: z.string().default(""),
        type: z.string().default(""),
        logo: z.string().default(""),
        title: z.string().default(""),
        description: z.string().default(""),
        about: z.string().default(""),
        collaboration: z.string().default(""),
        keyFocus: z.string().default(""),
        legal: z.string().default(""),
        documents: z.array(z.string()).default([]),
        allianceActivities: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});

const otherCoursesOfferedSectionSchema = metaSectionSchema.extend({
  course_name: z.string().default(""),
  admissions: z
    .array(
      z.object({
        year: z.string().default(""),
        status: z.string().nullable().default(null),
        placement_rate: z.string().nullable().default(null),
        seats_note: z.string().nullable().default(null),
        basic_details: z.object({
          duration: z.string().default(""),
          study_mode: z.string().default(""),
          academic_cycle: z.string().default(""),
          total_credits: z.number().default(0),
          gender_accepted: z.string().default(""),
          course_category: z.string().default(""),
        }),
      }),
    )
    .default([]),
  program_highlights: z.array(z.string()).default([]),
  course_accolades: z
    .array(
      z.object({
        body: z.string().default(""),
        rank: z.string().default(""),
        image: z.string().default(""),
      }),
    )
    .default([]),
  key_dates: z.object({
    application_start: z.string().default(""),
    application_close: z.object({
      date: z.string().default(""),
      urgency: z.string().default(""),
    }),
    class_commencement: z.object({
      date: z.string().default(""),
      note: z.string().default(""),
    }),
  }),
  curriculum: z.object({
    brochure_upload: z.string().default(""),
    brochure_available: z.boolean().default(false),
    semesters: z
      .array(
        z.object({
          semester: z.number().default(0),
          core_subjects: z.array(z.string()).default([]),
          specialization_1: z.object({
            name: z.string().default(""),
            electives: z.array(z.string()).default([]),
          }),
          specialization_2: z.object({
            name: z.string().default(""),
            note: z.string().default(""),
          }),
        }),
      )
      .default([]),
    course_structure: z.object({
      total_credits: z.number().default(0),
      breakdown: z
        .array(
          z.object({
            track: z.string().default(""),
            credits: z.number().default(0),
          }),
        )
        .default([]),
    }),
  }),
  value_added_course: z.object({
    name: z.string().default(""),
    delivery_mode: z.string().default(""),
    course_type: z.string().default(""),
    credits: z.number().default(0),
  }),
  career_opportunities: z
    .array(
      z.object({
        role: z.string().default(""),
        salary_range: z.string().default(""),
      }),
    )
    .default([]),
  higher_education_and_certifications: z
    .union([
      z.array(
        z.object({
          title: z.string().default(""),
          description: z.array(z.string()).default([]),
        }),
      ),
      z.object({
        global_certifications: z.array(z.string()).default([]),
        postgraduation: z.array(z.string()).default([]),
      }),
    ])
    .default([]),
  flexible_exit_options: z
    .array(
      z.object({
        after_years: z.number().default(0),
        credential: z.string().default(""),
      }),
    )
    .default([]),
  class_timings: z.object({
    mode: z.string().default(""),
    schedule: z
      .array(
        z.object({
          day: z.string().default(""),
          timing: z.string().nullable().default(null),
          status: z.string().default(""),
        }),
      )
      .default([]),
  }),
  industry_tools: z.array(z.string()).default([]),
  lab_facilities: z.array(z.string()).default([]),
  classroom_facilities: z.array(z.string()).default([]),
  bonus_certification: z
    .union([
      z.array(
        z.object({
          name: z.string().default(""),
          note: z.string().default(""),
          certificate_details_available: z.boolean().default(false),
          details_page: z.string().default(""),
        }),
      ),
      z.object({
        name: z.string().default(""),
        note: z.string().default(""),
        certificate_details_available: z.boolean().default(false),
        details_page: z.string().default(""),
      }),
    ])
    .default([]),
  featured_alumni: z
    .array(
      z.object({
        name: z.string().default(""),
        designation: z.string().default(""),
        career_progression: z
          .array(
            z.object({
              year: z.number().default(0),
              milestone: z.string().default(""),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        title: z.string().default(""),
        description: z.string().default(""),
      }),
    )
    .default([]),
  student_forum: z.object({
    description: z.string().default(""),
    cta: z.string().default(""),
  }),
});

function normalizeSectionMeta(
  sectionKey: keyof typeof PROFILE_SECTION_IDS,
  section: Record<string, unknown> | undefined,
) {
  const existingId =
    typeof section?.id === "string" && section.id.trim().length > 0
      ? section.id
      : PROFILE_SECTION_IDS[sectionKey];

  const existingEnabled =
    typeof section?.enabled === "boolean" ? section.enabled : true;

  return {
    ...section,
    id: existingId,
    enabled: existingEnabled,
  };
}

function toLineText(values: string[]) {
  return values.join("\n");
}

function fromLineText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function serializeFaqsToText(faqs: unknown): string {
  if (!Array.isArray(faqs)) {
    return "";
  }

  return faqs
    .map((item) => {
      if (typeof item === "string") {
        return `${item}|`;
      }

      if (item && typeof item === "object") {
        const title =
          typeof (item as any).title === "string" ? (item as any).title : "";
        const description =
          typeof (item as any).description === "string"
            ? (item as any).description
            : "";
        return `${title}|${description}`;
      }

      return "|";
    })
    .join("\n");
}

function parseFaqTextRows(value: string): string[][] {
  return value
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .map((cells) => [cells[0] || "", cells[1] || ""]);
}

function serializeHigherEducationHeadingsToText(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "|";
      }

      const title =
        typeof (item as any).title === "string" ? (item as any).title : "";
      const description = Array.isArray((item as any).description)
        ? (item as any).description
            .map((entry: unknown) =>
              typeof entry === "string" ? entry.trim() : "",
            )
            .filter(Boolean)
            .join(";")
        : "";

      return `${title}|${description}`;
    })
    .join("\n");
}

function parseHigherEducationHeadingsText(value: string) {
  return value
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .map((cells) => ({
      title: cells[0] || "",
      description: (cells[1] || "")
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean),
    }));
}

function safeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePipeRows(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()));
}

const DEFAULT_PLACEMENTS_ADVANCED = {
  report: {
    label: "Download Full Placement Report 2024",
    action: "download_placement_report_2024",
  },
  summary_stats: [
    {
      id: "average_package",
      label: "Average Package",
      value: 4.2,
      unit: "LPA",
    },
    {
      id: "highest_package",
      label: "Highest Package",
      value: 14.2,
      unit: "LPA",
    },
    { id: "placement_rate", label: "Placement Rate", value: 94, unit: "%" },
    { id: "lowest_package", label: "Lowest Package", value: 3.5, unit: "LPA" },
    {
      id: "companies_visited",
      label: "Companies Visited",
      value: "120+",
      unit: null,
    },
    {
      id: "students_placed",
      label: "Students Placed",
      value: "450+",
      unit: null,
    },
  ],
  placement_trends: {
    label: "Placement Trends",
    period: "Last 5 Years",
    years: [2020, 2021, 2022, 2023],
    avg_package_growth_yoy: "+12.5%",
  },
  industry_salary_report: {
    label: "Industry & Salary Report",
    columns: ["Industry", "Placed", "Avg Pkg"],
    industries: [
      {
        id: "bfsi",
        name: "BFSI",
        sub_label: "Banking & Finance",
        students_placed: 155,
        avg_package: "₹8.2 L",
        max_package: "12 LPA",
      },
      {
        id: "fmcg",
        name: "FMCG",
        sub_label: "Retail & Goods",
        students_placed: 98,
        avg_package: "₹7.5 L",
        max_package: "10 LPA",
      },
      {
        id: "consulting",
        name: "Consulting",
        sub_label: "Mgmt Consulting",
        students_placed: 81,
        avg_package: "₹9.1 L",
        max_package: "14.5 LPA",
      },
    ],
    cta: {
      label: "View All Industries",
      action: "view_all_industries",
    },
  },
  notable_offers: {
    label: "Notable Offers",
    cta: {
      label: "View All",
      action: "view_all_notable_offers",
    },
    featured: [
      {
        company: "Deloitte",
        tag: "Highest",
        industry: "Consulting",
        offers: [
          {
            role: "Senior Analyst Role",
            package: 14.5,
            unit: "LPA",
            type: "Package Offered",
          },
          {
            role: "Manager Role",
            package: 12,
            unit: "LPA",
            type: "Package Offered",
          },
        ],
      },
    ],
  },
  all_company_statistics: {
    label: "All Company Statistics",
    columns: ["Company Name", "Avg Pkg", "Max Pkg"],
    companies: [
      {
        id: "deloitte",
        name: "Deloitte",
        students: 145,
        avg_package: "₹9.2 L",
        max_package: "₹14.5 L",
      },
      {
        id: "accenture",
        name: "Accenture",
        students: 210,
        avg_package: "₹7.8 L",
        max_package: "₹11.2 L",
      },
      {
        id: "tcs",
        name: "TCS",
        students: 340,
        avg_package: "₹6.5 L",
        max_package: "₹9.0 L",
      },
    ],
  },
  student_success: [
    {
      name: "Rohan Mehta",
      placed_at: "Deloitte",
      quote:
        "The placement support helped me secure a role at a top firm. Best decision ever!",
    },
    {
      name: "Priya S.",
      placed_at: "HDFC",
      quote:
        "I never thought I'd get such a high package. The mock interviews were key.",
    },
  ],
};

const defaultPlacementsSummaryStatsRows =
  DEFAULT_PLACEMENTS_ADVANCED.summary_stats.map((item) => ({
    id: item.id,
    label: item.label,
    value: String(item.value),
    unit: item.unit || "",
  }));

const defaultPlacementsTrendYearsText =
  DEFAULT_PLACEMENTS_ADVANCED.placement_trends.years.join(", ");

const defaultIndustrySalaryRows =
  DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.industries.map((item) => ({
    id: item.id,
    name: item.name,
    sub_label: item.sub_label,
    students_placed: String(item.students_placed),
    avg_package: item.avg_package,
    max_package: item.max_package,
  }));

const defaultNotableFeaturedRows =
  DEFAULT_PLACEMENTS_ADVANCED.notable_offers.featured.map((item) => ({
    company: item.company,
    tag: item.tag,
    industry: item.industry,
    offersText: item.offers
      .map(
        (offer) => `${offer.role}|${offer.package}|${offer.unit}|${offer.type}`,
      )
      .join("\n"),
  }));

const defaultAllCompanyRows =
  DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics.companies.map((item) => ({
    id: item.id,
    name: item.name,
    students: String(item.students),
    avg_package: item.avg_package,
    max_package: item.max_package,
  }));

const defaultStudentSuccessRows =
  DEFAULT_PLACEMENTS_ADVANCED.student_success.map((item) => ({
    name: item.name,
    placed_at: item.placed_at,
    quote: item.quote,
  }));

const defaultPlacementStats = DEFAULT_PLACEMENTS_ADVANCED.summary_stats.map(
  (item) => ({
    title: item.label,
    value: item.unit ? `${item.value} ${item.unit}` : String(item.value),
  }),
);

const defaultPlacementTrends =
  DEFAULT_PLACEMENTS_ADVANCED.placement_trends.years.map((year) => ({
    year: String(year),
    averagePackage: "",
    highestPackage: "",
  }));

const defaultNotableOffers =
  DEFAULT_PLACEMENTS_ADVANCED.notable_offers.featured.flatMap((featuredOffer) =>
    featuredOffer.offers.map((offer) => ({
      studentName: offer.role,
      company: featuredOffer.company,
      package: `${offer.package} ${offer.unit}`,
    })),
  );

const DEFAULT_FEES_ADVANCED = {
  tuition_fees: {
    download: {
      label: "Download Fee Structure",
      file_label: "Detailed breakdown PDF",
      file_size: "2.4 MB",
      file_type: "PDF",
      action: "download_fee_structure",
    },
    filters: {
      quota_category: {
        label: "Quota Category",
        default: "Merit Quota",
        options: [
          "Merit Quota",
          "Government Quota",
          "Management Quota",
          "NRI Quota",
          "Scholarship",
          "Sports",
        ],
      },
      gender: {
        label: "Gender",
        default: "Boys",
        options: ["Boys", "Girls"],
      },
    },
    fee_matrix: [
      {
        quota_category: "Merit Quota",
        gender: "Boys",
        year_wise_fees: [
          { year: "1st Year", amount: 125276 },
          { year: "2nd Year", amount: 125276 },
          { year: "3rd Year", amount: 125276 },
          { year: "4th Year", amount: 125276 },
        ],
      },
      {
        quota_category: "Merit Quota",
        gender: "Girls",
        year_wise_fees: [
          { year: "1st Year", amount: 125276 },
          { year: "2nd Year", amount: 125276 },
          { year: "3rd Year", amount: 125276 },
          { year: "4th Year", amount: 125276 },
        ],
      },
    ],
  },
  one_time_payable_fees: [
    { id: "application_fees", label: "Application Fees", amount: 1500 },
    { id: "admission_fees", label: "Admission Fees", amount: 15000 },
  ],
  additional_fees: [
    { id: "examination_fees", label: "Examination Fees", amount: 3500 },
    { id: "library_fees", label: "Library Fees", amount: 1200 },
    { id: "lab_fees", label: "Lab Fees", amount: 2800 },
    { id: "sports_fees", label: "Sports Fees", amount: 1500 },
  ],
  inclusions: {
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
  },
  deadlines_and_installments: [
    {
      id: "installment_1",
      label: "1st Installment (Booking)",
      deadline: "Within 10 Days",
      amount: 25000,
    },
    {
      id: "installment_2",
      label: "2nd Installment",
      deadline: "Before Classes Start",
      amount: 54638,
    },
    {
      id: "installment_3",
      label: "Final Installment",
      deadline: "After 60 Days",
      amount: 54638,
    },
  ],
  fees_summary: {
    full_course_fee: 148750,
    booking_amount: 6198,
    currency: "INR",
  },
  refund_policy: [
    "Booking amount refundable within limited time",
    "Processing charges may apply",
    "Refund processed within 7-10 working days",
  ],
};

// Define a unified form schema supporting Basic info & complex profileSections
const profileFormSchema = z.object({
  name: z.string().min(2, "College name is required"),
  code: z.string().min(2, "College code is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  pinCode: z.string().min(6, "Valid PIN code is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  coverImageUrl: z.string().optional().or(z.literal("")),
  requestedGroupCode: z.string().optional(),

  // profileSections fields
  profileSections: z.object({
    college_overview: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.college_overview),
      enabled: z.boolean().default(true),
      description: z.string().default(""),
      accreditation_and_affilation: z.object({
        img: z.string().default(""),
        description: z.string().default(""),
      }),
      instution_details: z.object({
        estd: z.string().default(""),
        gender: z.string().default("Co-Ed"),
        average_student_count: z.string().default(""),
        campus_size: z.string().default(""),
        Student_from_outside: z.string().default(""),
      }),
      inside_campus: z.object({
        img: z.string().default(""),
        description: z.string().default(""),
      }),
      location: z.object({
        map_link: z.string().default(""),
      }),
      connect: z.object({
        linkedin: z.string().default(""),
        instagram: z.string().default(""),
        twitter: z.string().default(""),
        website: z.string().default(""),
      }),
    }),
    course_info: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.course_info),
      enabled: z.boolean().default(true),
      ...otherCoursesOfferedSectionSchema.omit({
        id: true,
        enabled: true,
      }).shape,
      data: otherCoursesOfferedSectionSchema
        .omit({ id: true, enabled: true })
        .optional(),
    }),
    admission_policy: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.admission_policy),
      enabled: z.boolean().default(true),
      policySummary: z.string().default(""),
      eligibility_criteria: z
        .object({
          applicant_type_tabs: z
            .array(
              z.object({
                id: z.string().default(""),
                label: z.string().default(""),
                quota_categories: z
                  .array(
                    z.object({
                      id: z.string().default(""),
                      label: z.string().default(""),
                      criteria: z
                        .array(
                          z.object({
                            id: z.string().default(""),
                            label: z.string().default(""),
                            description: z.string().default(""),
                          }),
                        )
                        .default([]),
                    }),
                  )
                  .default([]),
              }),
            )
            .default([]),
          default_applicant_type: z.string().default("indian"),
          default_quota: z.string().default("government_quota"),
          cta: z.object({
            label: z.string().default("Check Eligibility"),
            action: z.string().default("check_eligibility"),
          }),
        })
        .optional(),
    }),
    placements: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.placements),
      enabled: z.boolean().default(true),
      placementReportUrl: z.string().default(""),
      growthSummary: z.string().default(""),
    }),
    fees: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.fees),
      enabled: z.boolean().default(true),
      tuitionFeesSummary: z.string().default(""),
    }),
    financial_aid: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.financial_aid),
      enabled: z.boolean().default(true),
      meritScholarship: z.object({
        title: z.string().default(""),
        description: z.string().default(""),
      }),
      scholarshipCalculator: z.object({
        enabled: z.boolean().default(true),
        inputs: z.object({
          portOfEntry: z.array(z.string()).default([]),
          rankRanges: z.array(z.string()).default([]),
        }),
        termsAndConditions: z.array(z.string()).default([]),
        summary: z.object({
          maxScholarship: z.string().default(""),
          netPayableFees: z.string().default(""),
        }),
      }),
      financialConcessions: z
        .array(
          z.object({
            type: z.string().default(""),
            discount: z.string().default(""),
            details: z.string().default(""),
            eligibilityCriteria: z.array(z.string()).default([]),
            scholarshipAmount: z.string().default(""),
            netPayable: z.string().default(""),
          }),
        )
        .default([]),
      upfrontFeeConcession: z.object({
        discount: z.string().default(""),
        details: z.string().default(""),
      }),
    }),
    student_housing: metaSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.student_housing),
      summary: z.string().default(""),
    }),
    exam_policy: metaSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.exam_policy),
      course_with_practical: z.object({
        marksDistribution: marksDistributionSchema,
        isaTheory: z.array(z.string()).default([]),
        isaPractical: z.array(z.string()).default([]),
        esaTheory: z.array(z.string()).default([]),
        esaPractical: z.array(z.string()).default([]),
        summary: examSummarySchema,
        duration: z.string().default(""),
      }),
      course_without_practical: z.object({
        marksDistribution: z.object({
          theory: z.number().default(0),
          internal: z.number().default(0),
          total: z.number().default(100),
        }),
        internalAssessment: z.array(z.string()).default([]),
        attendancePolicy: z.array(z.string()).default([]),
        externalExamPattern: z.array(z.string()).default([]),
        summary: examSummarySchema,
        duration: z.string().default(""),
      }),
      standalone_practical: z.object({
        marksDistribution: z.object({
          internal: z.number().default(0),
          external: z.number().default(0),
          total: z.number().default(100),
        }),
        internalAssessment: z.array(z.string()).default([]),
        externalExamPattern: z.array(z.string()).default([]),
        summary: examSummarySchema,
        duration: z.string().default(""),
      }),
      project_dissertation: z.object({
        marksDistribution: z.object({
          internal: z.number().default(0),
          esa: z.number().default(0),
          total: z.number().default(100),
        }),
        internalEvaluation: z.array(z.string()).default([]),
        externalEvaluation: z.array(z.string()).default([]),
        summary: examSummarySchema,
      }),
      ojt: z.object({
        assessmentCriteria: z.array(z.string()).default([]),
        totalMarks: z.number().default(100),
      }),
      internship: z.object({
        evaluationComponents: z.array(z.string()).default([]),
        totalMarks: z.number().default(100),
      }),
      grading_scale: z
        .array(
          z.object({
            percentage: z.string().default(""),
            grade: z.string().default(""),
            gradePoint: z.string().default(""),
          }),
        )
        .default([]),
      academic_policies: z
        .array(
          z.object({
            title: z.string().default(""),
            shortValue: z.string().default(""),
            description: z.string().default(""),
            readMoreEnabled: z.boolean().default(true),
          }),
        )
        .default([]),
    }),
    faculty: facultySectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.faculty),
    }),
    review: reviewSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.review),
    }),
    commute: metaSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.commute),
      summary: z.string().default(""),
    }),
    library: librarySectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.library),
    }),
    clubs_associations: clubsAssociationsSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.clubs_associations),
    }),
    student_code_of_conduct: studentCodeOfConductSectionSchema.extend({
      id: z
        .string()
        .min(1)
        .default(PROFILE_SECTION_IDS.student_code_of_conduct),
    }),
    happenings: happeningsSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.happenings),
    }),
    institutions_across_world: metaSectionSchema.extend({
      id: z
        .string()
        .min(1)
        .default(PROFILE_SECTION_IDS.institutions_across_world),
      summary: z.string().default(""),
    }),
    alliance: allianceSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.alliance),
    }),
    other_courses_offered: metaSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.other_courses_offered),
      summary: z.string().default(""),
    }),
    demo_graphics: metaSectionSchema.extend({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.demo_graphics),
      summary: z.string().default(""),
    }),
  }),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const PREDEFINED_AMENITIES = [
  "Wi-Fi Campus",
  "Library",
  "Swimming Pool",
  "Sports Complex",
  "Gymnasium",
  "AC Classrooms",
  "Computer Lab",
  "Hostel Facility",
  "Cafeteria",
  "Auditorium",
];

type EligibilityCriterion = {
  title: string;
  description: string;
  logo: string;
};

type EligibilityQuotaCategory = {
  id: string;
  label: string;
  criteria: EligibilityCriterion[];
};

type EligibilityApplicantTypeTab = {
  id: string;
  label: string;
  quota_categories: EligibilityQuotaCategory[];
};

type EligibilityCriteriaModel = {
  applicant_type_tabs: EligibilityApplicantTypeTab[];
  default_applicant_type: string;
  default_quota: string;
  cta: {
    label: string;
    action: string;
  };
};

type CourseInfoDraft = {
  course_name: string;
  admissionsMatrixText: string;
  programHighlightsText: string;
  courseAccoladesText: string;
  applicationStartDate: string;
  applicationCloseDate: string;
  applicationCloseUrgency: string;
  classCommencementDate: string;
  classCommencementNote: string;
  curriculumBrochureUrl: string;
  curriculumBrochureAvailable: boolean;
  curriculumSemestersText: string;
  courseStructureTotalCredits: string;
  courseStructureText: string;
  valueAddedCoursesText: string;
  careerOpportunitiesText: string;
  higherEducationHeadingsText: string;
  exitOptionsText: string;
  classTimingsMode: string;
  classTimingsText: string;
  industryToolsText: string;
  labFacilitiesText: string;
  classroomFacilitiesText: string;
  bonusCertificationText: string;
  featuredAlumniText: string;
  faqsText: string;
  studentForumDescription: string;
  studentForumCtaLabel: string;
};

const COURSE_INFO_DETAIL_KEYS = [
  "faqs",
  "key_dates",
  "admissions",
  "curriculum",
  "class_timings",
  "student_forum",
  "industry_tools",
  "lab_facilities",
  "featured_alumni",
  "course_accolades",
  "program_highlights",
  "value_added_course",
  "bonus_certification",
  "career_opportunities",
  "classroom_facilities",
  "flexible_exit_options",
  "higher_education_and_certifications",
] as const;

const COURSE_INFO_RESERVED_KEYS = new Set<string>([
  "id",
  "enabled",
  "summary",
  "course_name",
  "data",
  "course_variants",
  ...COURSE_INFO_DETAIL_KEYS,
]);

function extractCourseInfoCourseEntries(courseInfo: any) {
  const extracted: Record<string, any> = {};

  if (
    courseInfo?.data &&
    typeof courseInfo.data === "object" &&
    !Array.isArray(courseInfo.data)
  ) {
    const dataCourseName =
      typeof courseInfo?.data?.course_name === "string" &&
      courseInfo.data.course_name.trim().length > 0
        ? courseInfo.data.course_name.trim()
        : typeof courseInfo?.course_name === "string" &&
            courseInfo.course_name.trim().length > 0
          ? courseInfo.course_name.trim()
          : "data";

    extracted[dataCourseName] = courseInfo.data;
  }

  if (
    courseInfo?.course_variants &&
    typeof courseInfo.course_variants === "object" &&
    !Array.isArray(courseInfo.course_variants)
  ) {
    for (const [courseName, payload] of Object.entries(
      courseInfo.course_variants,
    )) {
      if (!courseName.trim()) {
        continue;
      }
      extracted[courseName] = payload;
    }
  }

  if (
    courseInfo &&
    typeof courseInfo === "object" &&
    !Array.isArray(courseInfo)
  ) {
    for (const [key, value] of Object.entries(courseInfo)) {
      if (COURSE_INFO_RESERVED_KEYS.has(key)) {
        continue;
      }

      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }

      extracted[key] = value;
    }
  }

  return extracted;
}

function hasMeaningfulCourseInfoValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulCourseInfoValue(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) =>
      hasMeaningfulCourseInfoValue(item),
    );
  }

  return false;
}

function hasMeaningfulCourseInfoDetails(payload: any): boolean {
  return COURSE_INFO_DETAIL_KEYS.some((key) =>
    hasMeaningfulCourseInfoValue(payload?.[key]),
  );
}

const ELIGIBILITY_DEFAULT_QUOTAS: EligibilityQuotaCategory[] = [
  { id: "government_quota", label: "Government Quota", criteria: [] },
  { id: "management_quota", label: "Management Quota", criteria: [] },
  { id: "nri_quota", label: "NRI Quota", criteria: [] },
  { id: "scholarship", label: "Scholarship", criteria: [] },
  { id: "sports", label: "Sports", criteria: [] },
];

const createDefaultEligibilityCriteria = (): EligibilityCriteriaModel => ({
  applicant_type_tabs: [
    {
      id: "indian",
      label: "Indian Students",
      quota_categories: ELIGIBILITY_DEFAULT_QUOTAS.map((quota) => ({
        ...quota,
        criteria: [],
      })),
    },
    {
      id: "foreign",
      label: "Foreign Students",
      quota_categories: ELIGIBILITY_DEFAULT_QUOTAS.map((quota) => ({
        ...quota,
        criteria: [],
      })),
    },
  ],
  default_applicant_type: "indian",
  default_quota: "government_quota",
  cta: {
    label: "Check Eligibility",
    action: "check_eligibility",
  },
});

const createEligibilityId = (value: string, fallbackPrefix: string) => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || `${fallbackPrefix}_${Date.now()}`;
};

export default function SetupProfilePage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const { data: profile, isLoading } = useCollegeProfile();
  const { data: campuses = [] } = useCollegeCampuses();
  const { data: collegeCourses = [] } = useCollegeCourses();
  const { data: streams = [] } = useStreams();
  const { data: studyLevels = [] } = useStudyLevels();
  const { data: programTypes = [] } = useProgramTypes();
  const { data: institutionGroupData, isLoading: isInstitutionGroupLoading } =
    useMyInstitutionGroup();
  const { mutate: updateProfile, isPending } = useUpdateCollegeProfile();
  const { mutate: createCourse, isPending: isCreatingCourse } =
    useCreateCollegeCourse();

  const [activeTab, setActiveTab] = useState<OnboardingTabId>("basic");
  const { data: publicColleges = [] } = usePublicColleges(
    activeTab === "alliance",
  );
  const [allianceSearchQuery, setAllianceSearchQuery] = useState("");
  const [selectedAllianceIndex, setSelectedAllianceIndex] = useState<
    number | null
  >(null);

  // State to hold dynamic JSON fields not easily mapped in standard zod/rhf fields
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");

  const [transitAccess, setTransitAccess] = useState<
    { type: string; name: string; distance: string }[]
  >([]);
  const [essentialsAccess, setEssentialsAccess] = useState<
    { type: string; name: string; distance: string }[]
  >([]);
  const [utilitiesAccess, setUtilitiesAccess] = useState<
    { type: string; name: string; distance: string }[]
  >([]);
  const [overviewRankings, setOverviewRankings] = useState<
    { body: string; rank: string; logo: string; recognitions: string }[]
  >([]);
  const [insideCampusFacilities, setInsideCampusFacilities] = useState<
    { name: string; description: string; image: string }[]
  >([]);
  const [connectLinks, setConnectLinks] = useState<
    { platform: string; url: string }[]
  >([]);
  const [campusReels, setCampusReels] = useState<
    { title: string; link: string }[]
  >([]);

  const [seatMatrix, setSeatMatrix] = useState<
    { quota: string; total: string; open: string }[]
  >([]);
  const [eligibilityCriteriaModel, setEligibilityCriteriaModel] =
    useState<EligibilityCriteriaModel>(createDefaultEligibilityCriteria());
  const [selectedApplicantTypeId, setSelectedApplicantTypeId] =
    useState("indian");
  const [selectedQuotaId, setSelectedQuotaId] = useState("government_quota");
  const [nationalExams, setNationalExams] = useState<
    {
      shortName: string;
      fullName: string;
      minPercentile: string;
      code: string;
    }[]
  >([]);
  const [stateExams, setStateExams] = useState<
    { shortName: string; fullName: string; minRank: string; code: string }[]
  >([]);
  const [institutionalExams, setInstitutionalExams] = useState<
    { shortName: string; fullName: string; minScore: string; code: string }[]
  >([]);

  const [courseWithPracticalMarks, setCourseWithPracticalMarks] = useState({
    theory: "50",
    practical: "20",
    internal: "30",
    total: "100",
  });
  const [courseWithPracticalIsaTheory, setCourseWithPracticalIsaTheory] =
    useState<string[]>([]);
  const [courseWithPracticalIsaPractical, setCourseWithPracticalIsaPractical] =
    useState<string[]>([]);
  const [courseWithPracticalEsaTheory, setCourseWithPracticalEsaTheory] =
    useState<string[]>([]);
  const [courseWithPracticalEsaPractical, setCourseWithPracticalEsaPractical] =
    useState<string[]>([]);
  const [courseWithPracticalDuration, setCourseWithPracticalDuration] =
    useState("");

  const [courseWithoutPracticalMarks, setCourseWithoutPracticalMarks] =
    useState({ theory: "75", internal: "25", total: "100" });
  const [courseWithoutInternalAssessment, setCourseWithoutInternalAssessment] =
    useState<string[]>([]);
  const [courseWithoutAttendancePolicy, setCourseWithoutAttendancePolicy] =
    useState<string[]>([]);
  const [courseWithoutExternalPattern, setCourseWithoutExternalPattern] =
    useState<string[]>([]);
  const [courseWithoutDuration, setCourseWithoutDuration] = useState("");

  const [standalonePracticalMarks, setStandalonePracticalMarks] = useState({
    internal: "50",
    external: "50",
    total: "100",
  });
  const [standaloneInternalAssessment, setStandaloneInternalAssessment] =
    useState<string[]>([]);
  const [standaloneExternalPattern, setStandaloneExternalPattern] = useState<
    string[]
  >([]);
  const [standaloneDuration, setStandaloneDuration] = useState("");

  const [projectDissertationMarks, setProjectDissertationMarks] = useState({
    internal: "30",
    esa: "70",
    total: "100",
  });
  const [projectInternalEvaluation, setProjectInternalEvaluation] = useState<
    string[]
  >([]);
  const [projectExternalEvaluation, setProjectExternalEvaluation] = useState<
    string[]
  >([]);

  const [ojtAssessmentCriteria, setOjtAssessmentCriteria] = useState<string[]>(
    [],
  );
  const [ojtTotalMarks, setOjtTotalMarks] = useState("100");

  const [internshipEvaluationComponents, setInternshipEvaluationComponents] =
    useState<string[]>([]);
  const [internshipTotalMarks, setInternshipTotalMarks] = useState("100");

  const [gradingScaleRows, setGradingScaleRows] = useState<
    { percentage: string; grade: string; gradePoint: string }[]
  >([]);

  const [academicPoliciesRows, setAcademicPoliciesRows] = useState<
    {
      title: string;
      shortValue: string;
      description: string;
      readMoreEnabled: boolean;
    }[]
  >([]);

  const [reviewOverallRating, setReviewOverallRating] = useState("0");
  const [reviewTotalReviews, setReviewTotalReviews] = useState("0");
  const [reviewRatingDistributionText, setReviewRatingDistributionText] =
    useState("");
  const [reviewCategoryRatingsText, setReviewCategoryRatingsText] =
    useState("");
  const [reviewEntriesText, setReviewEntriesText] = useState("");
  const [reviewLoadMoreEnabled, setReviewLoadMoreEnabled] = useState(true);
  const [reviewPage, setReviewPage] = useState("1");
  const [reviewPageSize, setReviewPageSize] = useState("10");
  const [reviewHasMore, setReviewHasMore] = useState(true);

  const [libraryName, setLibraryName] = useState("");
  const [libraryAreaSqFeet, setLibraryAreaSqFeet] = useState("0");
  const [libraryTotalSeats, setLibraryTotalSeats] = useState("0");
  const [libraryTotalVolumes, setLibraryTotalVolumes] = useState("0");
  const [libraryResearchCabins, setLibraryResearchCabins] = useState("0");
  const [libraryResourceRows, setLibraryResourceRows] = useState<
    { resourceType: string; count: string }[]
  >([]);
  const [libraryHourRows, setLibraryHourRows] = useState<
    { day: string; workingHours: string; transactionHours: string }[]
  >([]);
  const [libraryFacilityRows, setLibraryFacilityRows] = useState<
    { title: string; image: string }[]
  >([]);

  const [conductTitle, setConductTitle] = useState("");
  const [conductRulesText, setConductRulesText] = useState("");

  const [otherCourseName, setOtherCourseName] = useState("");
  const [courseInfoDrafts, setCourseInfoDrafts] = useState<
    Record<string, CourseInfoDraft>
  >({});
  const [otherCoursesRows, setOtherCoursesRows] = useState<
    {
      id: string;
      catalogCourseId: string;
      name: string;
      code: string;
      studyLevel: string;
    }[]
  >([]);
  const [admissionsMatrixText, setAdmissionsMatrixText] = useState("");
  const [activeAdmissionIndex, setActiveAdmissionIndex] = useState(0);
  const [otherAdmissionCyclesText, setOtherAdmissionCyclesText] = useState("");
  const [otherAdmissionStatus, setOtherAdmissionStatus] = useState("");
  const [otherSeatAvailabilityPercent, setOtherSeatAvailabilityPercent] =
    useState("0");
  const [otherSeatAvailabilityMessage, setOtherSeatAvailabilityMessage] =
    useState("");
  const [otherDuration, setOtherDuration] = useState("");
  const [otherStudyMode, setOtherStudyMode] = useState("");
  const [otherAcademicCycle, setOtherAcademicCycle] = useState("");
  const [otherCredits, setOtherCredits] = useState("0");
  const [otherGenderAccepted, setOtherGenderAccepted] = useState("");
  const [otherCourseCategory, setOtherCourseCategory] = useState("");
  const [newOtherCourseForm, setNewOtherCourseForm] = useState({
    name: "",
    code: "",
    disciplineId: "",
    studyLevelId: "",
    programTypeId: "",
    campusId: "",
    studyMode: "full_time",
    duration: "",
    eligibility: "",
    intakeCapacity: "",
  });

  const [programHighlightsText, setProgramHighlightsText] = useState("");
  const [courseAccoladesText, setCourseAccoladesText] = useState("");
  const [applicationStartDate, setApplicationStartDate] = useState("");
  const [applicationCloseDate, setApplicationCloseDate] = useState("");
  const [applicationCloseUrgency, setApplicationCloseUrgency] = useState("");
  const [classCommencementDate, setClassCommencementDate] = useState("");
  const [classCommencementNote, setClassCommencementNote] = useState("");
  const [curriculumBrochureUrl, setCurriculumBrochureUrl] = useState("");
  const [curriculumBrochureAvailable, setCurriculumBrochureAvailable] =
    useState(false);
  const [curriculumSemestersText, setCurriculumSemestersText] = useState("");
  const [courseStructureTotalCredits, setCourseStructureTotalCredits] =
    useState("0");
  const [courseStructureText, setCourseStructureText] = useState("");
  const [valueAddedCoursesText, setValueAddedCoursesText] = useState("");
  const [careerOpportunitiesText, setCareerOpportunitiesText] = useState("");
  const [higherEducationHeadingsText, setHigherEducationHeadingsText] =
    useState("");
  const [exitOptionsText, setExitOptionsText] = useState("");
  const [classTimingsMode, setClassTimingsMode] = useState("");
  const [classTimingsText, setClassTimingsText] = useState("");
  const [industryToolsText, setIndustryToolsText] = useState("");
  const [labFacilitiesText, setLabFacilitiesText] = useState("");
  const [classroomFacilitiesText, setClassroomFacilitiesText] = useState("");
  const [bonusCertificationText, setBonusCertificationText] = useState("");
  const [featuredAlumniText, setFeaturedAlumniText] = useState("");
  const [faqsText, setFaqsText] = useState("");
  const [studentForumDescription, setStudentForumDescription] = useState("");
  const [studentForumCtaLabel, setStudentForumCtaLabel] = useState("");

  const [placementStats, setPlacementStats] = useState<
    { title: string; value: string }[]
  >(defaultPlacementStats);
  const [placementTrends, setPlacementTrends] = useState<
    { year: string; averagePackage: string; highestPackage: string }[]
  >(defaultPlacementTrends);
  const [notableOffers, setNotableOffers] =
    useState<{ studentName: string; company: string; package: string }[]>(
      defaultNotableOffers,
    );
  const [placementsReportLabel, setPlacementsReportLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.report.label,
  );
  const [placementsReportAction, setPlacementsReportAction] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.report.action,
  );
  const [placementsSummaryStatsRows, setPlacementsSummaryStatsRows] = useState<
    { id: string; label: string; value: string; unit: string }[]
  >(defaultPlacementsSummaryStatsRows);
  const [placementsTrendsLabel, setPlacementsTrendsLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.placement_trends.label,
  );
  const [placementsTrendsPeriod, setPlacementsTrendsPeriod] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.placement_trends.period,
  );
  const [placementsTrendsYearsText, setPlacementsTrendsYearsText] = useState(
    defaultPlacementsTrendYearsText,
  );
  const [placementsTrendsGrowthYoy, setPlacementsTrendsGrowthYoy] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.placement_trends.avg_package_growth_yoy,
  );
  const [industrySalaryReportLabel, setIndustrySalaryReportLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.label,
  );
  const [industrySalaryReportColumnsText, setIndustrySalaryReportColumnsText] =
    useState(
      DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.columns.join(", "),
    );
  const [industrySalaryRows, setIndustrySalaryRows] = useState<
    {
      id: string;
      name: string;
      sub_label: string;
      students_placed: string;
      avg_package: string;
      max_package: string;
    }[]
  >(defaultIndustrySalaryRows);
  const [industryCtaLabel, setIndustryCtaLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.cta.label,
  );
  const [industryCtaAction, setIndustryCtaAction] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.cta.action,
  );
  const [notableOffersLabel, setNotableOffersLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.notable_offers.label,
  );
  const [notableOffersCtaLabel, setNotableOffersCtaLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.notable_offers.cta.label,
  );
  const [notableOffersCtaAction, setNotableOffersCtaAction] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.notable_offers.cta.action,
  );
  const [notableFeaturedRows, setNotableFeaturedRows] = useState<
    { company: string; tag: string; industry: string; offersText: string }[]
  >(defaultNotableFeaturedRows);
  const [allCompanyStatisticsLabel, setAllCompanyStatisticsLabel] = useState(
    DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics.label,
  );
  const [allCompanyStatisticsColumnsText, setAllCompanyStatisticsColumnsText] =
    useState(
      DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics.columns.join(", "),
    );
  const [allCompanyRows, setAllCompanyRows] = useState<
    {
      id: string;
      name: string;
      students: string;
      avg_package: string;
      max_package: string;
    }[]
  >(defaultAllCompanyRows);
  const [studentSuccessRows, setStudentSuccessRows] = useState<
    { name: string; placed_at: string; quote: string }[]
  >(defaultStudentSuccessRows);

  const [feesDownload, setFeesDownload] = useState({
    ...DEFAULT_FEES_ADVANCED.tuition_fees.download,
  });
  const [feesQuotaFilterLabel, setFeesQuotaFilterLabel] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.label,
  );
  const [feesQuotaDefault, setFeesQuotaDefault] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.default,
  );
  const [feesQuotaOptionsText, setFeesQuotaOptionsText] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.options.join(
      "\n",
    ),
  );
  const [feesGenderFilterLabel, setFeesGenderFilterLabel] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.label,
  );
  const [feesGenderDefault, setFeesGenderDefault] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.default,
  );
  const [feesGenderOptionsText, setFeesGenderOptionsText] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.options.join("\n"),
  );
  const [selectedFeesQuotaFilter, setSelectedFeesQuotaFilter] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.default,
  );
  const [selectedFeesGenderTab, setSelectedFeesGenderTab] = useState(
    DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.default,
  );
  const [feesMatrixRows, setFeesMatrixRows] = useState<
    {
      quota_category: string;
      gender: string;
      year1: string;
      year2: string;
      year3: string;
      year4: string;
    }[]
  >(
    DEFAULT_FEES_ADVANCED.tuition_fees.fee_matrix.map((item) => ({
      quota_category: item.quota_category,
      gender: item.gender,
      year1: String(item.year_wise_fees[0]?.amount ?? ""),
      year2: String(item.year_wise_fees[1]?.amount ?? ""),
      year3: String(item.year_wise_fees[2]?.amount ?? ""),
      year4: String(item.year_wise_fees[3]?.amount ?? ""),
    })),
  );
  const [oneTimePayableFees, setOneTimePayableFees] = useState<
    { id: string; label: string; amount: string }[]
  >(
    DEFAULT_FEES_ADVANCED.one_time_payable_fees.map((item) => ({
      ...item,
      amount: String(item.amount),
    })),
  );
  const [additionalFees, setAdditionalFees] = useState<
    { id: string; label: string; amount: string }[]
  >(
    DEFAULT_FEES_ADVANCED.additional_fees.map((item) => ({
      ...item,
      amount: String(item.amount),
    })),
  );
  const [inclusionIncludedText, setInclusionIncludedText] = useState(
    DEFAULT_FEES_ADVANCED.inclusions.whats_included.join("\n"),
  );
  const [inclusionExcludedText, setInclusionExcludedText] = useState(
    DEFAULT_FEES_ADVANCED.inclusions.whats_excluded.join("\n"),
  );
  const [installmentSchedule, setInstallmentSchedule] = useState<
    { id: string; label: string; deadline: string; amount: string }[]
  >(
    DEFAULT_FEES_ADVANCED.deadlines_and_installments.map((item) => ({
      ...item,
      amount: String(item.amount),
    })),
  );
  const [feesSummaryFullCourseFee, setFeesSummaryFullCourseFee] = useState(
    String(DEFAULT_FEES_ADVANCED.fees_summary.full_course_fee),
  );
  const [feesSummaryBookingAmount, setFeesSummaryBookingAmount] = useState(
    String(DEFAULT_FEES_ADVANCED.fees_summary.booking_amount),
  );
  const [feesSummaryCurrency, setFeesSummaryCurrency] = useState(
    DEFAULT_FEES_ADVANCED.fees_summary.currency,
  );
  const [refundPolicyText, setRefundPolicyText] = useState(
    DEFAULT_FEES_ADVANCED.refund_policy.join("\n"),
  );
  const [calculatorPortOfEntry, setCalculatorPortOfEntry] = useState<string[]>(
    [],
  );
  const [calculatorRankRanges, setCalculatorRankRanges] = useState<string[]>(
    [],
  );
  const [calculatorTerms, setCalculatorTerms] = useState<string[]>([]);
  const [calculatorSummary, setCalculatorSummary] = useState({
    maxScholarship: "",
    netPayableFees: "",
  });
  const [financialConcessions, setFinancialConcessions] = useState<
    {
      type: string;
      discount: string;
      details: string;
      eligibilityCriteriaText: string;
      scholarshipAmount: string;
      netPayable: string;
    }[]
  >([]);
  const [upfrontFeeConcession, setUpfrontFeeConcession] = useState({
    discount: "",
    details: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      requestedGroupCode: "",
      profileSections: {
        college_overview: {
          id: PROFILE_SECTION_IDS.college_overview,
          enabled: true,
          description: "",
          accreditation_and_affilation: { img: "", description: "" },
          instution_details: {
            estd: "",
            gender: "Co-Ed",
            average_student_count: "",
            campus_size: "",
            Student_from_outside: "",
          },
          inside_campus: { img: "", description: "" },
          location: { map_link: "" },
          connect: { linkedin: "", instagram: "", twitter: "", website: "" },
        },
        course_info: {
          id: PROFILE_SECTION_IDS.course_info,
          enabled: true,
          course_name: "",
          admissions: [],
          program_highlights: [],
          course_accolades: [],
          key_dates: {
            application_start: "",
            application_close: {
              date: "",
              urgency: "",
            },
            class_commencement: {
              date: "",
              note: "",
            },
          },
          curriculum: {
            brochure_upload: "",
            brochure_available: false,
            semesters: [],
            course_structure: {
              total_credits: 0,
              breakdown: [],
            },
          },
          value_added_course: {
            name: "",
            delivery_mode: "",
            course_type: "",
            credits: 0,
          },
          career_opportunities: [],
          higher_education_and_certifications: [],
          flexible_exit_options: [],
          class_timings: {
            mode: "",
            schedule: [],
          },
          industry_tools: [],
          lab_facilities: [],
          classroom_facilities: [],
          bonus_certification: [],
          featured_alumni: [],
          faqs: [],
          student_forum: {
            description: "",
            cta: "",
          },
        },
        admission_policy: {
          id: PROFILE_SECTION_IDS.admission_policy,
          enabled: true,
          policySummary: "",
          eligibility_criteria: createDefaultEligibilityCriteria(),
        },
        placements: {
          id: PROFILE_SECTION_IDS.placements,
          enabled: true,
          placementReportUrl: "",
          growthSummary: "",
        },
        fees: {
          id: PROFILE_SECTION_IDS.fees,
          enabled: true,
          tuitionFeesSummary: "",
        },
        financial_aid: {
          id: PROFILE_SECTION_IDS.financial_aid,
          enabled: true,
          meritScholarship: {
            title: "",
            description: "",
          },
          scholarshipCalculator: {
            enabled: true,
            inputs: {
              portOfEntry: [],
              rankRanges: [],
            },
            termsAndConditions: [],
            summary: {
              maxScholarship: "",
              netPayableFees: "",
            },
          },
          financialConcessions: [],
          upfrontFeeConcession: {
            discount: "",
            details: "",
          },
        },
        student_housing: {
          id: PROFILE_SECTION_IDS.student_housing,
          enabled: true,
          summary: "",
        },
        exam_policy: {
          id: PROFILE_SECTION_IDS.exam_policy,
          enabled: true,
          course_with_practical: {
            marksDistribution: {
              theory: 50,
              practical: 20,
              internal: 30,
              total: 100,
            },
            isaTheory: [],
            isaPractical: [],
            esaTheory: [],
            esaPractical: [],
            summary: { title: "", description: "" },
            duration: "",
          },
          course_without_practical: {
            marksDistribution: {
              theory: 75,
              internal: 25,
              total: 100,
            },
            internalAssessment: [],
            attendancePolicy: [],
            externalExamPattern: [],
            summary: { title: "", description: "" },
            duration: "",
          },
          standalone_practical: {
            marksDistribution: {
              internal: 50,
              external: 50,
              total: 100,
            },
            internalAssessment: [],
            externalExamPattern: [],
            summary: { title: "", description: "" },
            duration: "",
          },
          project_dissertation: {
            marksDistribution: {
              internal: 30,
              esa: 70,
              total: 100,
            },
            internalEvaluation: [],
            externalEvaluation: [],
            summary: { title: "", description: "" },
          },
          ojt: {
            assessmentCriteria: [],
            totalMarks: 100,
          },
          internship: {
            evaluationComponents: [],
            totalMarks: 100,
          },
          grading_scale: [],
          academic_policies: [],
        },
        faculty: {
          id: PROFILE_SECTION_IDS.faculty,
          enabled: true,
          summary: "",
          members: [],
        },
        review: {
          id: PROFILE_SECTION_IDS.review,
          enabled: true,
          overallRating: {
            rating: 0,
            totalReviews: 0,
          },
          ratingDistribution: [],
          categoryRatings: [],
          reviews: [],
          pagination: {
            loadMoreEnabled: true,
            page: 1,
            pageSize: 10,
            hasMore: true,
          },
        },
        commute: {
          id: PROFILE_SECTION_IDS.commute,
          enabled: true,
          summary: "",
        },
        library: {
          id: PROFILE_SECTION_IDS.library,
          enabled: true,
          libraryInfo: {
            libraryName: "",
            areaSqFeet: 0,
            totalSeats: 0,
            totalVolumes: 0,
            researchCabins: 0,
          },
          availableResources: [],
          libraryHours: [],
          facilities: [],
        },
        clubs_associations: {
          id: PROFILE_SECTION_IDS.clubs_associations,
          enabled: true,
          summary: "",
          items: [],
        },
        student_code_of_conduct: {
          id: PROFILE_SECTION_IDS.student_code_of_conduct,
          enabled: true,
          title: "",
          disciplineRules: [],
        },
        happenings: {
          id: PROFILE_SECTION_IDS.happenings,
          enabled: true,
          summary: "",
          items: [],
        },
        institutions_across_world: {
          id: PROFILE_SECTION_IDS.institutions_across_world,
          enabled: true,
          summary: "",
        },
        alliance: {
          id: PROFILE_SECTION_IDS.alliance,
          enabled: true,
          summary: "",
          items: [],
        },
        other_courses_offered: {
          id: PROFILE_SECTION_IDS.other_courses_offered,
          enabled: true,
          summary: "",
        },
        demo_graphics: {
          id: PROFILE_SECTION_IDS.demo_graphics,
          enabled: true,
          summary: "",
        },
      },
    },
  });

  const {
    fields: facultyFields,
    append: appendFaculty,
    remove: removeFaculty,
  } = useFieldArray({
    control,
    name: "profileSections.faculty.members",
  });
  const {
    fields: clubFields,
    append: appendClub,
    remove: removeClub,
  } = useFieldArray({
    control,
    name: "profileSections.clubs_associations.items",
  });
  const {
    fields: happeningFields,
    append: appendHappening,
    remove: removeHappening,
  } = useFieldArray({
    control,
    name: "profileSections.happenings.items",
  });
  const {
    fields: allianceFields,
    append: appendAlliance,
    remove: removeAlliance,
  } = useFieldArray({
    control,
    name: "profileSections.alliance.items",
  });

  const allianceItems = watch("profileSections.alliance.items");
  const linkedInstitutionGroup =
    institutionGroupData?.type === "owner"
      ? institutionGroupData.group
      : institutionGroupData?.membership?.group;
  const linkedInstitutionMembers = linkedInstitutionGroup?.members ?? [];
  const disciplines = streams.flatMap((stream) => {
    if (!Array.isArray(stream.disciplines)) {
      return [];
    }

    return stream.disciplines.map((discipline) => ({
      ...discipline,
      streamName: stream.name,
    }));
  });

  const normalizeStudyLevelHeading = (value: string) => {
    const normalized = value.trim().toLowerCase();

    if (normalized === "ug" || normalized.includes("undergraduate")) {
      return "UG";
    }

    if (normalized === "pg" || normalized.includes("postgraduate")) {
      return "PG";
    }

    return value.trim() || "Other";
  };

  const createEmptyCourseInfoDraft = (courseName = ""): CourseInfoDraft => ({
    course_name: courseName,
    admissionsMatrixText: "",
    programHighlightsText: "",
    courseAccoladesText: "",
    applicationStartDate: "",
    applicationCloseDate: "",
    applicationCloseUrgency: "",
    classCommencementDate: "",
    classCommencementNote: "",
    curriculumBrochureUrl: "",
    curriculumBrochureAvailable: false,
    curriculumSemestersText: "",
    courseStructureTotalCredits: "0",
    courseStructureText: "",
    valueAddedCoursesText: "",
    careerOpportunitiesText: "",
    higherEducationHeadingsText: "",
    exitOptionsText: "",
    classTimingsMode: "",
    classTimingsText: "",
    industryToolsText: "",
    labFacilitiesText: "",
    classroomFacilitiesText: "",
    bonusCertificationText: "",
    featuredAlumniText: "",
    faqsText: "",
    studentForumDescription: "",
    studentForumCtaLabel: "",
  });

  const hydrateCourseInfoDraftFromPayload = (
    payload: any,
    fallbackCourseName = "",
  ): CourseInfoDraft => {
    const admissions = Array.isArray(payload?.admissions)
      ? payload.admissions
      : [];

    return {
      course_name: payload?.course_name || fallbackCourseName,
      admissionsMatrixText: admissions
        .map((item: any) => {
          const basicDetails = item?.basic_details || {};
          return [
            item?.year || "",
            item?.status || "",
            item?.placement_rate || "",
            item?.seats_note || "",
            basicDetails?.duration || "",
            basicDetails?.study_mode || "",
            basicDetails?.academic_cycle || "",
            String(basicDetails?.total_credits ?? 0),
            basicDetails?.gender_accepted || "",
            basicDetails?.course_category || "",
          ].join("|");
        })
        .join("\n"),
      programHighlightsText: Array.isArray(payload?.program_highlights)
        ? payload.program_highlights.join("\n")
        : "",
      courseAccoladesText: Array.isArray(payload?.course_accolades)
        ? payload.course_accolades
            .map(
              (item: any) =>
                `${item.body || ""}|${item.rank || ""}|${item.image || ""}`,
            )
            .join("\n")
        : "",
      applicationStartDate: payload?.key_dates?.application_start || "",
      applicationCloseDate: payload?.key_dates?.application_close?.date || "",
      applicationCloseUrgency:
        payload?.key_dates?.application_close?.urgency || "",
      classCommencementDate: payload?.key_dates?.class_commencement?.date || "",
      classCommencementNote: payload?.key_dates?.class_commencement?.note || "",
      curriculumBrochureUrl: payload?.curriculum?.brochure_upload || "",
      curriculumBrochureAvailable: Boolean(
        payload?.curriculum?.brochure_available,
      ),
      curriculumSemestersText: Array.isArray(payload?.curriculum?.semesters)
        ? payload.curriculum.semesters
            .map(
              (item: any) =>
                `${item.semester ?? 0}|${(item.core_subjects || []).join(", ")}|${item.specialization_1?.name || ""}|${(item.specialization_1?.electives || []).join(", ")}|${item.specialization_2?.name || ""}|${item.specialization_2?.note || ""}`,
            )
            .join("\n")
        : "",
      courseStructureTotalCredits: String(
        payload?.curriculum?.course_structure?.total_credits ?? 0,
      ),
      courseStructureText: Array.isArray(
        payload?.curriculum?.course_structure?.breakdown,
      )
        ? payload.curriculum.course_structure.breakdown
            .map((item: any) => `${item.track || ""}|${item.credits ?? 0}`)
            .join("\n")
        : "",
      valueAddedCoursesText: payload?.value_added_course
        ? `${payload.value_added_course.name || ""}|${payload.value_added_course.credits ?? ""}|${payload.value_added_course.delivery_mode || ""}|${payload.value_added_course.course_type || ""}`
        : "",
      careerOpportunitiesText: Array.isArray(payload?.career_opportunities)
        ? payload.career_opportunities
            .map((item: any) => `${item.role || ""}|${item.salary_range || ""}`)
            .join("\n")
        : "",
      higherEducationHeadingsText: Array.isArray(
        payload?.higher_education_and_certifications,
      )
        ? serializeHigherEducationHeadingsToText(
            payload.higher_education_and_certifications,
          )
        : "",
      exitOptionsText: Array.isArray(payload?.flexible_exit_options)
        ? payload.flexible_exit_options
            .map(
              (item: any) =>
                `${item.after_years ?? 0}|${item.credential || ""}`,
            )
            .join("\n")
        : "",
      classTimingsMode: payload?.class_timings?.mode || "",
      classTimingsText: Array.isArray(payload?.class_timings?.schedule)
        ? payload.class_timings.schedule
            .map(
              (item: any) =>
                `${item.day || ""}|${item.timing || ""}|${item.status || ""}`,
            )
            .join("\n")
        : "",
      industryToolsText: Array.isArray(payload?.industry_tools)
        ? payload.industry_tools.join("\n")
        : "",
      labFacilitiesText: Array.isArray(payload?.lab_facilities)
        ? payload.lab_facilities.join("\n")
        : "",
      classroomFacilitiesText: Array.isArray(payload?.classroom_facilities)
        ? payload.classroom_facilities.join("\n")
        : "",
      bonusCertificationText: Array.isArray(payload?.bonus_certification)
        ? payload.bonus_certification
            .map(
              (item: any) =>
                `${item?.name || ""}|${item?.note || ""}|${Boolean(item?.certificate_details_available)}|${item?.details_page || ""}`,
            )
            .join("\n")
        : payload?.bonus_certification &&
            typeof payload.bonus_certification === "object"
          ? `${payload?.bonus_certification?.name || ""}|${payload?.bonus_certification?.note || ""}|${Boolean(payload?.bonus_certification?.certificate_details_available)}|${payload?.bonus_certification?.details_page || ""}`
          : "",
      featuredAlumniText: Array.isArray(payload?.featured_alumni)
        ? payload.featured_alumni
            .map(
              (item: any) =>
                `${item.name || ""}|${item.designation || ""}|${(
                  item.career_progression || []
                )
                  .map(
                    (progression: any) =>
                      `${progression.year || ""}:${progression.milestone || ""}`,
                  )
                  .join(";")}`,
            )
            .join("\n")
        : "",
      faqsText: serializeFaqsToText(payload?.faqs),
      studentForumDescription: payload?.student_forum?.description || "",
      studentForumCtaLabel: payload?.student_forum?.cta || "",
    };
  };

  const applyCourseInfoDraftToState = (draft: CourseInfoDraft) => {
    setAdmissionsMatrixText(draft.admissionsMatrixText);
    setProgramHighlightsText(draft.programHighlightsText);
    setCourseAccoladesText(draft.courseAccoladesText);
    setApplicationStartDate(draft.applicationStartDate);
    setApplicationCloseDate(draft.applicationCloseDate);
    setApplicationCloseUrgency(draft.applicationCloseUrgency);
    setClassCommencementDate(draft.classCommencementDate);
    setClassCommencementNote(draft.classCommencementNote);
    setCurriculumBrochureUrl(draft.curriculumBrochureUrl);
    setCurriculumBrochureAvailable(draft.curriculumBrochureAvailable);
    setCurriculumSemestersText(draft.curriculumSemestersText);
    setCourseStructureTotalCredits(draft.courseStructureTotalCredits);
    setCourseStructureText(draft.courseStructureText);
    setValueAddedCoursesText(draft.valueAddedCoursesText);
    setCareerOpportunitiesText(draft.careerOpportunitiesText);
    setHigherEducationHeadingsText(draft.higherEducationHeadingsText);
    setExitOptionsText(draft.exitOptionsText);
    setClassTimingsMode(draft.classTimingsMode);
    setClassTimingsText(draft.classTimingsText);
    setIndustryToolsText(draft.industryToolsText);
    setLabFacilitiesText(draft.labFacilitiesText);
    setClassroomFacilitiesText(draft.classroomFacilitiesText);
    setBonusCertificationText(draft.bonusCertificationText);
    setFeaturedAlumniText(draft.featuredAlumniText);
    setFaqsText(draft.faqsText);
    setStudentForumDescription(draft.studentForumDescription);
    setStudentForumCtaLabel(draft.studentForumCtaLabel);
    setActiveAdmissionIndex(0);
  };

  const buildCourseInfoDraftFromCurrentState = (
    courseNameOverride?: string,
  ): CourseInfoDraft => ({
    course_name: courseNameOverride ?? otherCourseName,
    admissionsMatrixText,
    programHighlightsText,
    courseAccoladesText,
    applicationStartDate,
    applicationCloseDate,
    applicationCloseUrgency,
    classCommencementDate,
    classCommencementNote,
    curriculumBrochureUrl,
    curriculumBrochureAvailable,
    curriculumSemestersText,
    courseStructureTotalCredits,
    courseStructureText,
    valueAddedCoursesText,
    careerOpportunitiesText,
    higherEducationHeadingsText,
    exitOptionsText,
    classTimingsMode,
    classTimingsText,
    industryToolsText,
    labFacilitiesText,
    classroomFacilitiesText,
    bonusCertificationText,
    featuredAlumniText,
    faqsText,
    studentForumDescription,
    studentForumCtaLabel,
  });

  const buildCourseInfoPayloadFromDraft = (draft: CourseInfoDraft) => {
    const curriculumSemesterRows = parsePipeRows(draft.curriculumSemestersText)
      .filter((row) => row[0] || row[1] || row[2] || row[3] || row[4] || row[5])
      .map(
        ([
          semester,
          coreSubjects,
          specializationOneName,
          specializationOneElectives,
          specializationTwoName,
          specializationTwoNote,
        ]) => ({
          semester: safeNumber(semester || "0"),
          core_subjects: (coreSubjects || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          specialization_1: {
            name: specializationOneName || "",
            electives: (specializationOneElectives || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          },
          specialization_2: {
            name: specializationTwoName || "",
            note: specializationTwoNote || "",
          },
        }),
      );

    const admissionsRows = parsePipeRows(draft.admissionsMatrixText)
      .filter((row) => row.some((cell) => cell && cell.trim().length > 0))
      .map(
        ([
          year,
          status,
          placementRate,
          seatsNote,
          duration,
          studyMode,
          academicCycle,
          totalCredits,
          genderAccepted,
          courseCategory,
        ]) => ({
          year: year || "",
          status: status?.trim() ? status : null,
          placement_rate: placementRate?.trim() ? placementRate : null,
          seats_note: seatsNote?.trim() ? seatsNote : null,
          basic_details: {
            duration: duration || "",
            study_mode: studyMode || "",
            academic_cycle: academicCycle || "",
            total_credits: safeNumber(totalCredits || "0"),
            gender_accepted: genderAccepted || "",
            course_category: courseCategory || "",
          },
        }),
      );

    const classTimingsRows = parsePipeRows(draft.classTimingsText)
      .filter((row) => row[0] || row[1] || row[2])
      .map(([day, timing, status]) => ({
        day: day || "",
        timing: timing || null,
        status: status || (timing ? "open" : "closed"),
      }));

    const featuredAlumniRows = parsePipeRows(draft.featuredAlumniText)
      .filter((row) => row[0] || row[1] || row[2])
      .map(([name, designation, careerProgression]) => ({
        name: name || "",
        designation: designation || "",
        career_progression: (careerProgression || "")
          .split(";")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const [year, ...milestoneParts] = item.split(":");
            return {
              year: safeNumber(year || "0"),
              milestone: milestoneParts.join(":").trim(),
            };
          }),
      }));

    const courseStructureRows = parsePipeRows(draft.courseStructureText)
      .filter((row) => row[0] || row[1])
      .map(([track, credits]) => ({
        track: track || "",
        credits: safeNumber(credits || "0"),
      }));

    return {
      course_name: draft.course_name || "",
      admissions: admissionsRows,
      program_highlights: fromLineText(draft.programHighlightsText),
      course_accolades: parsePipeRows(draft.courseAccoladesText)
        .filter((row) => row[0] || row[1] || row[2])
        .map(([body, rank, image]) => ({
          body: body || "",
          rank: rank || "",
          image: image || "",
        })),
      key_dates: {
        application_start: draft.applicationStartDate,
        application_close: {
          date: draft.applicationCloseDate,
          urgency: draft.applicationCloseUrgency,
        },
        class_commencement: {
          date: draft.classCommencementDate,
          note: draft.classCommencementNote,
        },
      },
      curriculum: {
        brochure_upload: draft.curriculumBrochureUrl,
        brochure_available: draft.curriculumBrochureAvailable,
        semesters: curriculumSemesterRows,
        course_structure: {
          total_credits: safeNumber(draft.courseStructureTotalCredits),
          breakdown: courseStructureRows,
        },
      },
      value_added_course: (() => {
        const [name = "", credits = "0", delivery_mode = "", course_type = ""] =
          parsePipeRows(draft.valueAddedCoursesText)[0] || [];
        return {
          name,
          delivery_mode,
          course_type,
          credits: safeNumber(credits),
        };
      })(),
      career_opportunities: parsePipeRows(draft.careerOpportunitiesText)
        .filter((row) => row[0] || row[1])
        .map(([role, salary_range]) => ({
          role: role || "",
          salary_range: salary_range || "",
        })),
      higher_education_and_certifications: parseHigherEducationHeadingsText(
        draft.higherEducationHeadingsText,
      )
        .filter((item) => item.title || item.description.length > 0)
        .map((item) => ({
          title: item.title,
          description: item.description,
        })),
      flexible_exit_options: parsePipeRows(draft.exitOptionsText)
        .filter((row) => row[0] || row[1])
        .map(([after_years, credential]) => ({
          after_years: safeNumber(after_years || "0"),
          credential: credential || "",
        })),
      class_timings: {
        mode: draft.classTimingsMode,
        schedule: classTimingsRows,
      },
      industry_tools: fromLineText(draft.industryToolsText),
      lab_facilities: fromLineText(draft.labFacilitiesText),
      classroom_facilities: fromLineText(draft.classroomFacilitiesText),
      bonus_certification: parsePipeRows(draft.bonusCertificationText)
        .filter((row) => row[0] || row[1] || row[2] || row[3])
        .map(([name, note, certificateDetailsAvailable, detailsPage]) => ({
          name: name || "",
          note: note || "",
          certificate_details_available:
            String(certificateDetailsAvailable || "")
              .trim()
              .toLowerCase() === "true",
          details_page: detailsPage || "",
        })),
      featured_alumni: featuredAlumniRows,
      faqs: parseFaqTextRows(draft.faqsText)
        .filter((row) => row[0] || row[1])
        .map(([title, description]) => ({
          title: title || "",
          description: description || "",
        })),
      student_forum: {
        description: draft.studentForumDescription,
        cta: draft.studentForumCtaLabel,
      },
    };
  };

  const handleCourseInfoSelectionChange = (nextValue: string) => {
    const currentKey = otherCourseName.trim();
    const nextKey = nextValue.trim();
    const nextDrafts = { ...courseInfoDrafts };

    if (currentKey) {
      nextDrafts[currentKey] = buildCourseInfoDraftFromCurrentState(currentKey);
    }

    const nextDraft = nextKey
      ? (nextDrafts[nextKey] ?? createEmptyCourseInfoDraft(nextKey))
      : createEmptyCourseInfoDraft("");

    if (nextKey && !nextDrafts[nextKey]) {
      nextDrafts[nextKey] = nextDraft;
    }

    setCourseInfoDrafts(nextDrafts);
    setOtherCourseName(nextValue);
    applyCourseInfoDraftToState(nextDraft);
  };

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        code: profile.code || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        district: profile.district || "",
        pinCode: profile.pinCode || "",
        logoUrl: profile.logoUrl || "",
        coverImageUrl: profile.coverImageUrl || "",
        requestedGroupCode: profile.requestedGroupCode || "",
        profileSections: {
          college_overview: {
            id:
              profile.profileSections?.college_overview?.id ||
              PROFILE_SECTION_IDS.college_overview,
            enabled: profile.profileSections?.college_overview?.enabled ?? true,
            description:
              profile.profileSections?.college_overview?.description || "",
            accreditation_and_affilation: {
              img:
                profile.profileSections?.college_overview
                  ?.accreditation_and_affilation?.img || "",
              description:
                profile.profileSections?.college_overview
                  ?.accreditation_and_affilation?.description || "",
            },
            instution_details: {
              estd:
                profile.profileSections?.college_overview?.instution_details
                  ?.estd || "",
              gender:
                profile.profileSections?.college_overview?.instution_details
                  ?.gender || "Co-Ed",
              average_student_count:
                profile.profileSections?.college_overview?.instution_details
                  ?.average_student_count || "",
              campus_size:
                profile.profileSections?.college_overview?.instution_details
                  ?.campus_size || "",
              Student_from_outside:
                profile.profileSections?.college_overview?.instution_details
                  ?.Student_from_outside || "",
            },
            inside_campus: {
              img:
                profile.profileSections?.college_overview?.inside_campus?.img ||
                "",
              description:
                profile.profileSections?.college_overview?.inside_campus
                  ?.description || "",
            },
            location: {
              map_link:
                profile.profileSections?.college_overview?.location?.map_link ||
                "",
            },
            connect: {
              linkedin:
                profile.profileSections?.college_overview?.connect?.linkedin ||
                "",
              instagram:
                profile.profileSections?.college_overview?.connect?.instagram ||
                "",
              twitter:
                profile.profileSections?.college_overview?.connect?.twitter ||
                "",
              website:
                profile.profileSections?.college_overview?.connect?.website ||
                "",
            },
          },
          course_info: {
            id:
              profile.profileSections?.course_info?.id ||
              PROFILE_SECTION_IDS.course_info,
            enabled: profile.profileSections?.course_info?.enabled ?? true,
            course_name:
              (profile.profileSections?.course_info as any)?.course_name || "",
            admissions: Array.isArray(
              (profile.profileSections?.course_info as any)?.admissions,
            )
              ? (profile.profileSections?.course_info as any).admissions
              : [],
            program_highlights: Array.isArray(
              (profile.profileSections?.course_info as any)?.program_highlights,
            )
              ? (profile.profileSections?.course_info as any).program_highlights
              : [],
            course_accolades: Array.isArray(
              (profile.profileSections?.course_info as any)?.course_accolades,
            )
              ? (profile.profileSections?.course_info as any).course_accolades
              : [],
            key_dates: (profile.profileSections?.course_info as any)
              ?.key_dates || {
              application_start: "",
              application_close: { date: "", urgency: "" },
              class_commencement: { date: "", note: "" },
            },
            curriculum: (profile.profileSections?.course_info as any)
              ?.curriculum || {
              brochure_upload: "",
              brochure_available: false,
              semesters: [],
              course_structure: { total_credits: 0, breakdown: [] },
            },
            value_added_course: (profile.profileSections?.course_info as any)
              ?.value_added_course || {
              name: "",
              delivery_mode: "",
              course_type: "",
              credits: 0,
            },
            career_opportunities: Array.isArray(
              (profile.profileSections?.course_info as any)
                ?.career_opportunities,
            )
              ? (profile.profileSections?.course_info as any)
                  .career_opportunities
              : [],
            higher_education_and_certifications:
              (profile.profileSections?.course_info as any)
                ?.higher_education_and_certifications || [],
            flexible_exit_options: Array.isArray(
              (profile.profileSections?.course_info as any)
                ?.flexible_exit_options,
            )
              ? (profile.profileSections?.course_info as any)
                  .flexible_exit_options
              : [],
            class_timings: (profile.profileSections?.course_info as any)
              ?.class_timings || {
              mode: "",
              schedule: [],
            },
            industry_tools: Array.isArray(
              (profile.profileSections?.course_info as any)?.industry_tools,
            )
              ? (profile.profileSections?.course_info as any).industry_tools
              : [],
            lab_facilities: Array.isArray(
              (profile.profileSections?.course_info as any)?.lab_facilities,
            )
              ? (profile.profileSections?.course_info as any).lab_facilities
              : [],
            classroom_facilities: Array.isArray(
              (profile.profileSections?.course_info as any)
                ?.classroom_facilities,
            )
              ? (profile.profileSections?.course_info as any)
                  .classroom_facilities
              : [],
            bonus_certification:
              (profile.profileSections?.course_info as any)
                ?.bonus_certification || [],
            featured_alumni: Array.isArray(
              (profile.profileSections?.course_info as any)?.featured_alumni,
            )
              ? (profile.profileSections?.course_info as any).featured_alumni
              : [],
            faqs: Array.isArray(
              (profile.profileSections?.course_info as any)?.faqs,
            )
              ? (profile.profileSections?.course_info as any).faqs
              : [],
            student_forum: (profile.profileSections?.course_info as any)
              ?.student_forum || {
              description: "",
              cta: "",
            },
          },
          admission_policy: {
            id:
              profile.profileSections?.admission_policy?.id ||
              PROFILE_SECTION_IDS.admission_policy,
            enabled: profile.profileSections?.admission_policy?.enabled ?? true,
            policySummary:
              profile.profileSections?.admission_policy?.policySummary || "",
          },
          placements: {
            id:
              profile.profileSections?.placements?.id ||
              PROFILE_SECTION_IDS.placements,
            enabled: profile.profileSections?.placements?.enabled ?? true,
            placementReportUrl:
              profile.profileSections?.placements?.placementReportUrl || "",
            growthSummary:
              profile.profileSections?.placements?.growthSummary || "",
          },
          fees: {
            id: profile.profileSections?.fees?.id || PROFILE_SECTION_IDS.fees,
            enabled: profile.profileSections?.fees?.enabled ?? true,
            tuitionFeesSummary:
              profile.profileSections?.fees?.tuitionFeesSummary ||
              profile.profileSections?.tuition_and_aid?.tuitionFeesSummary ||
              "",
          },
          financial_aid: {
            id:
              profile.profileSections?.financial_aid?.id ||
              PROFILE_SECTION_IDS.financial_aid,
            enabled: profile.profileSections?.financial_aid?.enabled ?? true,
            meritScholarship: {
              title:
                profile.profileSections?.financial_aid?.meritScholarship
                  ?.title || "",
              description:
                profile.profileSections?.financial_aid?.meritScholarship
                  ?.description || "",
            },
            scholarshipCalculator: {
              enabled:
                profile.profileSections?.financial_aid?.scholarshipCalculator
                  ?.enabled ??
                !!profile.profileSections?.financial_aid
                  ?.scholarshipCalculatorEnabled,
              inputs: {
                portOfEntry:
                  profile.profileSections?.financial_aid?.scholarshipCalculator
                    ?.inputs?.portOfEntry || [],
                rankRanges:
                  profile.profileSections?.financial_aid?.scholarshipCalculator
                    ?.inputs?.rankRanges || [],
              },
              termsAndConditions:
                profile.profileSections?.financial_aid?.scholarshipCalculator
                  ?.termsAndConditions || [],
              summary: {
                maxScholarship:
                  profile.profileSections?.financial_aid?.scholarshipCalculator
                    ?.summary?.maxScholarship || "",
                netPayableFees:
                  profile.profileSections?.financial_aid?.scholarshipCalculator
                    ?.summary?.netPayableFees || "",
              },
            },
            financialConcessions:
              profile.profileSections?.financial_aid?.financialConcessions ||
              [],
            upfrontFeeConcession: {
              discount:
                profile.profileSections?.financial_aid?.upfrontFeeConcession
                  ?.discount || "",
              details:
                profile.profileSections?.financial_aid?.upfrontFeeConcession
                  ?.details || "",
            },
          },
          student_housing: {
            id:
              profile.profileSections?.student_housing?.id ||
              PROFILE_SECTION_IDS.student_housing,
            enabled: profile.profileSections?.student_housing?.enabled ?? true,
            summary: profile.profileSections?.student_housing?.summary || "",
          },
          exam_policy: {
            id:
              profile.profileSections?.exam_policy?.id ||
              PROFILE_SECTION_IDS.exam_policy,
            enabled: profile.profileSections?.exam_policy?.enabled ?? true,
            course_with_practical: {
              marksDistribution: {
                theory:
                  profile.profileSections?.exam_policy?.course_with_practical
                    ?.marksDistribution?.theory ?? 50,
                practical:
                  profile.profileSections?.exam_policy?.course_with_practical
                    ?.marksDistribution?.practical ?? 20,
                internal:
                  profile.profileSections?.exam_policy?.course_with_practical
                    ?.marksDistribution?.internal ?? 30,
                total:
                  profile.profileSections?.exam_policy?.course_with_practical
                    ?.marksDistribution?.total ?? 100,
              },
              isaTheory:
                profile.profileSections?.exam_policy?.course_with_practical
                  ?.isaTheory || [],
              isaPractical:
                profile.profileSections?.exam_policy?.course_with_practical
                  ?.isaPractical || [],
              esaTheory:
                profile.profileSections?.exam_policy?.course_with_practical
                  ?.esaTheory || [],
              esaPractical:
                profile.profileSections?.exam_policy?.course_with_practical
                  ?.esaPractical || [],
              summary: {
                title:
                  profile.profileSections?.exam_policy?.course_with_practical
                    ?.summary?.title || "",
                description:
                  profile.profileSections?.exam_policy?.course_with_practical
                    ?.summary?.description || "",
              },
              duration:
                profile.profileSections?.exam_policy?.course_with_practical
                  ?.duration || "",
            },
            course_without_practical: {
              marksDistribution: {
                theory:
                  profile.profileSections?.exam_policy?.course_without_practical
                    ?.marksDistribution?.theory ?? 75,
                internal:
                  profile.profileSections?.exam_policy?.course_without_practical
                    ?.marksDistribution?.internal ?? 25,
                total:
                  profile.profileSections?.exam_policy?.course_without_practical
                    ?.marksDistribution?.total ?? 100,
              },
              internalAssessment:
                profile.profileSections?.exam_policy?.course_without_practical
                  ?.internalAssessment || [],
              attendancePolicy:
                profile.profileSections?.exam_policy?.course_without_practical
                  ?.attendancePolicy || [],
              externalExamPattern:
                profile.profileSections?.exam_policy?.course_without_practical
                  ?.externalExamPattern || [],
              summary: {
                title:
                  profile.profileSections?.exam_policy?.course_without_practical
                    ?.summary?.title || "",
                description:
                  profile.profileSections?.exam_policy?.course_without_practical
                    ?.summary?.description || "",
              },
              duration:
                profile.profileSections?.exam_policy?.course_without_practical
                  ?.duration || "",
            },
            standalone_practical: {
              marksDistribution: {
                internal:
                  profile.profileSections?.exam_policy?.standalone_practical
                    ?.marksDistribution?.internal ?? 50,
                external:
                  profile.profileSections?.exam_policy?.standalone_practical
                    ?.marksDistribution?.external ?? 50,
                total:
                  profile.profileSections?.exam_policy?.standalone_practical
                    ?.marksDistribution?.total ?? 100,
              },
              internalAssessment:
                profile.profileSections?.exam_policy?.standalone_practical
                  ?.internalAssessment || [],
              externalExamPattern:
                profile.profileSections?.exam_policy?.standalone_practical
                  ?.externalExamPattern || [],
              summary: {
                title:
                  profile.profileSections?.exam_policy?.standalone_practical
                    ?.summary?.title || "",
                description:
                  profile.profileSections?.exam_policy?.standalone_practical
                    ?.summary?.description || "",
              },
              duration:
                profile.profileSections?.exam_policy?.standalone_practical
                  ?.duration || "",
            },
            project_dissertation: {
              marksDistribution: {
                internal:
                  profile.profileSections?.exam_policy?.project_dissertation
                    ?.marksDistribution?.internal ?? 30,
                esa:
                  profile.profileSections?.exam_policy?.project_dissertation
                    ?.marksDistribution?.esa ?? 70,
                total:
                  profile.profileSections?.exam_policy?.project_dissertation
                    ?.marksDistribution?.total ?? 100,
              },
              internalEvaluation:
                profile.profileSections?.exam_policy?.project_dissertation
                  ?.internalEvaluation || [],
              externalEvaluation:
                profile.profileSections?.exam_policy?.project_dissertation
                  ?.externalEvaluation || [],
              summary: {
                title:
                  profile.profileSections?.exam_policy?.project_dissertation
                    ?.summary?.title || "",
                description:
                  profile.profileSections?.exam_policy?.project_dissertation
                    ?.summary?.description || "",
              },
            },
            ojt: {
              assessmentCriteria:
                profile.profileSections?.exam_policy?.ojt?.assessmentCriteria ||
                [],
              totalMarks:
                profile.profileSections?.exam_policy?.ojt?.totalMarks ?? 100,
            },
            internship: {
              evaluationComponents:
                profile.profileSections?.exam_policy?.internship
                  ?.evaluationComponents || [],
              totalMarks:
                profile.profileSections?.exam_policy?.internship?.totalMarks ??
                100,
            },
            grading_scale:
              profile.profileSections?.exam_policy?.grading_scale || [],
            academic_policies:
              profile.profileSections?.exam_policy?.academic_policies || [],
          },
          faculty: {
            id:
              profile.profileSections?.faculty?.id ||
              PROFILE_SECTION_IDS.faculty,
            enabled: profile.profileSections?.faculty?.enabled ?? true,
            summary: profile.profileSections?.faculty?.summary || "",
            members: Array.isArray(profile.profileSections?.faculty?.members)
              ? profile.profileSections.faculty.members
              : [],
          },
          review: {
            id:
              profile.profileSections?.review?.id || PROFILE_SECTION_IDS.review,
            enabled: profile.profileSections?.review?.enabled ?? true,
            overallRating: {
              rating:
                profile.profileSections?.review?.overallRating?.rating ?? 0,
              totalReviews:
                profile.profileSections?.review?.overallRating?.totalReviews ??
                0,
            },
            ratingDistribution:
              profile.profileSections?.review?.ratingDistribution || [],
            categoryRatings:
              profile.profileSections?.review?.categoryRatings || [],
            reviews: profile.profileSections?.review?.reviews || [],
            pagination: {
              loadMoreEnabled:
                profile.profileSections?.review?.pagination?.loadMoreEnabled ??
                true,
              page: profile.profileSections?.review?.pagination?.page ?? 1,
              pageSize:
                profile.profileSections?.review?.pagination?.pageSize ?? 10,
              hasMore:
                profile.profileSections?.review?.pagination?.hasMore ?? true,
            },
          },
          commute: {
            id:
              profile.profileSections?.commute?.id ||
              PROFILE_SECTION_IDS.commute,
            enabled: profile.profileSections?.commute?.enabled ?? true,
            summary: profile.profileSections?.commute?.summary || "",
          },
          library: {
            id:
              profile.profileSections?.library?.id ||
              PROFILE_SECTION_IDS.library,
            enabled: profile.profileSections?.library?.enabled ?? true,
            libraryInfo: {
              libraryName:
                profile.profileSections?.library?.libraryInfo?.libraryName ||
                "",
              areaSqFeet:
                profile.profileSections?.library?.libraryInfo?.areaSqFeet ?? 0,
              totalSeats:
                profile.profileSections?.library?.libraryInfo?.totalSeats ?? 0,
              totalVolumes:
                profile.profileSections?.library?.libraryInfo?.totalVolumes ??
                0,
              researchCabins:
                profile.profileSections?.library?.libraryInfo?.researchCabins ??
                0,
            },
            availableResources:
              profile.profileSections?.library?.availableResources || [],
            libraryHours: profile.profileSections?.library?.libraryHours || [],
            facilities: profile.profileSections?.library?.facilities || [],
          },
          clubs_associations: {
            id:
              profile.profileSections?.clubs_associations?.id ||
              PROFILE_SECTION_IDS.clubs_associations,
            enabled:
              profile.profileSections?.clubs_associations?.enabled ?? true,
            summary: profile.profileSections?.clubs_associations?.summary || "",
            items: Array.isArray(
              profile.profileSections?.clubs_associations?.items,
            )
              ? profile.profileSections.clubs_associations.items
              : [],
          },
          student_code_of_conduct: {
            id:
              profile.profileSections?.student_code_of_conduct?.id ||
              PROFILE_SECTION_IDS.student_code_of_conduct,
            enabled:
              profile.profileSections?.student_code_of_conduct?.enabled ?? true,
            title:
              profile.profileSections?.student_code_of_conduct?.title || "",
            disciplineRules:
              profile.profileSections?.student_code_of_conduct
                ?.disciplineRules || [],
          },
          happenings: {
            id:
              profile.profileSections?.happenings?.id ||
              PROFILE_SECTION_IDS.happenings,
            enabled: profile.profileSections?.happenings?.enabled ?? true,
            summary: profile.profileSections?.happenings?.summary || "",
            items: Array.isArray(profile.profileSections?.happenings?.items)
              ? profile.profileSections.happenings.items
              : [],
          },
          institutions_across_world: {
            id:
              profile.profileSections?.institutions_across_world?.id ||
              PROFILE_SECTION_IDS.institutions_across_world,
            enabled:
              profile.profileSections?.institutions_across_world?.enabled ??
              true,
            summary:
              profile.profileSections?.institutions_across_world?.summary || "",
          },
          alliance: {
            id:
              profile.profileSections?.alliance?.id ||
              PROFILE_SECTION_IDS.alliance,
            enabled: profile.profileSections?.alliance?.enabled ?? true,
            summary: profile.profileSections?.alliance?.summary || "",
            items: Array.isArray(profile.profileSections?.alliance?.items)
              ? profile.profileSections.alliance.items
              : [],
          },
          other_courses_offered: {
            id:
              profile.profileSections?.other_courses_offered?.id ||
              PROFILE_SECTION_IDS.other_courses_offered,
            enabled:
              profile.profileSections?.other_courses_offered?.enabled ?? true,
            summary:
              profile.profileSections?.other_courses_offered?.summary || "",
          },
          demo_graphics: {
            id:
              profile.profileSections?.demo_graphics?.id ||
              PROFILE_SECTION_IDS.demo_graphics,
            enabled: profile.profileSections?.demo_graphics?.enabled ?? true,
            summary: profile.profileSections?.demo_graphics?.summary || "",
          },
        },
      });

      // Load nested list state
      if (Array.isArray(profile.profileSections?.college_overview?.aminities)) {
        setAmenities(profile.profileSections.college_overview.aminities);
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.nearby_access?.transit,
        )
      ) {
        setTransitAccess(
          profile.profileSections.college_overview.nearby_access.transit,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.nearby_access?.essentials,
        )
      ) {
        setEssentialsAccess(
          profile.profileSections.college_overview.nearby_access.essentials,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.nearby_access?.utilities,
        )
      ) {
        setUtilitiesAccess(
          profile.profileSections.college_overview.nearby_access.utilities,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview
            ?.accreditation_and_affiliation,
        )
      ) {
        setOverviewRankings(
          profile.profileSections.college_overview
            .accreditation_and_affiliation,
        );
      } else if (
        Array.isArray(
          profile.profileSections?.college_overview
            ?.accreditation_and_affiliation?.rankings,
        )
      ) {
        // Backward compatibility for previously saved object-based payloads.
        setOverviewRankings(
          profile.profileSections.college_overview.accreditation_and_affiliation
            .rankings,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.inside_campus_facilities,
        )
      ) {
        setInsideCampusFacilities(
          profile.profileSections.college_overview.inside_campus_facilities,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.connectwithus?.links,
        )
      ) {
        setConnectLinks(
          profile.profileSections.college_overview.connectwithus.links,
        );
      }
      if (
        Array.isArray(profile.profileSections?.college_overview?.campus_reels)
      ) {
        setCampusReels(profile.profileSections.college_overview.campus_reels);
      }

      if (
        Array.isArray(profile.profileSections?.admission_policy?.seatMatrix)
      ) {
        setSeatMatrix(
          profile.profileSections.admission_policy.seatMatrix.map(
            (row: any) => ({
              quota: row.quotaCategory || row.quota || "General",
              total: String(row.total ?? ""),
              open: String(row.open ?? ""),
            }),
          ),
        );
      } else if (
        Array.isArray(profile.profileSections?.course_info?.seatMatrix)
      ) {
        setSeatMatrix(
          profile.profileSections.course_info.seatMatrix.map((row: any) => ({
            quota: row.quotaCategory || row.quota || "General",
            total: String(row.total ?? ""),
            open: String(row.open ?? ""),
          })),
        );
      }
      const admissionPolicySection = profile.profileSections
        ?.admission_policy as any;
      const eligibilityCriteria = admissionPolicySection?.eligibility_criteria;

      if (
        eligibilityCriteria &&
        Array.isArray(eligibilityCriteria.applicant_type_tabs)
      ) {
        const nextModel: EligibilityCriteriaModel = {
          applicant_type_tabs: eligibilityCriteria.applicant_type_tabs.map(
            (tab: any, tabIndex: number) => ({
              id:
                (typeof tab?.id === "string" && tab.id) ||
                createEligibilityId(
                  typeof tab?.label === "string" ? tab.label : "",
                  `applicant_${tabIndex + 1}`,
                ),
              label:
                (typeof tab?.label === "string" && tab.label) ||
                `Applicant Type ${tabIndex + 1}`,
              quota_categories: Array.isArray(tab?.quota_categories)
                ? tab.quota_categories.map(
                    (quota: any, quotaIndex: number) => ({
                      id:
                        (typeof quota?.id === "string" && quota.id) ||
                        createEligibilityId(
                          typeof quota?.label === "string" ? quota.label : "",
                          `quota_${quotaIndex + 1}`,
                        ),
                      label:
                        (typeof quota?.label === "string" && quota.label) ||
                        `Quota ${quotaIndex + 1}`,
                      criteria: Array.isArray(quota?.criteria)
                        ? quota.criteria.map(
                            (criterion: any, criterionIndex: number) => ({
                              title:
                                (typeof criterion?.title === "string" &&
                                  criterion.title) ||
                                (typeof criterion?.label === "string" &&
                                  criterion.label) ||
                                `Criteria ${criterionIndex + 1}`,
                              description:
                                (typeof criterion?.description === "string" &&
                                  criterion.description) ||
                                "",
                              logo:
                                (typeof criterion?.logo === "string" &&
                                  criterion.logo) ||
                                "",
                            }),
                          )
                        : [],
                    }),
                  )
                : ELIGIBILITY_DEFAULT_QUOTAS.map((quota) => ({
                    ...quota,
                    criteria: [],
                  })),
            }),
          ),
          default_applicant_type:
            typeof eligibilityCriteria?.default_applicant_type === "string" &&
            eligibilityCriteria.default_applicant_type
              ? eligibilityCriteria.default_applicant_type
              : "indian",
          default_quota:
            typeof eligibilityCriteria?.default_quota === "string" &&
            eligibilityCriteria.default_quota
              ? eligibilityCriteria.default_quota
              : "government_quota",
          cta: {
            label:
              typeof eligibilityCriteria?.cta?.label === "string" &&
              eligibilityCriteria.cta.label
                ? eligibilityCriteria.cta.label
                : "Check Eligibility",
            action:
              typeof eligibilityCriteria?.cta?.action === "string" &&
              eligibilityCriteria.cta.action
                ? eligibilityCriteria.cta.action
                : "check_eligibility",
          },
        };

        setEligibilityCriteriaModel(nextModel);
        setSelectedApplicantTypeId(nextModel.default_applicant_type);
        setSelectedQuotaId(nextModel.default_quota);
      } else {
        const legacyCriteria =
          admissionPolicySection?.eligibilityCriteria as any;
        const legacyRequirements = Array.isArray(
          admissionPolicySection?.requirements,
        )
          ? admissionPolicySection.requirements
          : [];

        const mergedCriteria = [
          ...(Array.isArray(legacyCriteria?.requirements)
            ? legacyCriteria.requirements
            : []),
          ...legacyRequirements,
        ]
          .filter(
            (item: any) =>
              (item?.title || "").trim() || (item?.description || "").trim(),
          )
          .map((item: any, index: number) => ({
            title: item?.title || `Criteria ${index + 1}`,
            description: item?.description || "",
            logo: item?.logo || "",
          }));

        const fallbackModel = createDefaultEligibilityCriteria();
        fallbackModel.applicant_type_tabs[0].quota_categories[0].criteria =
          mergedCriteria;
        setEligibilityCriteriaModel(fallbackModel);
        setSelectedApplicantTypeId(fallbackModel.default_applicant_type);
        setSelectedQuotaId(fallbackModel.default_quota);
      }
      if (
        Array.isArray(
          profile.profileSections?.admission_policy?.entranceExams
            ?.nationalLevel,
        )
      ) {
        setNationalExams(
          profile.profileSections.admission_policy.entranceExams.nationalLevel,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.admission_policy?.entranceExams?.stateLevel,
        )
      ) {
        setStateExams(
          profile.profileSections.admission_policy.entranceExams.stateLevel,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.admission_policy?.entranceExams
            ?.institutionalLevel,
        )
      ) {
        setInstitutionalExams(
          profile.profileSections.admission_policy.entranceExams
            .institutionalLevel,
        );
      }

      if (Array.isArray(profile.profileSections?.placements?.placementStats)) {
        setPlacementStats(profile.profileSections.placements.placementStats);
      }
      if (Array.isArray(profile.profileSections?.placements?.placementTrends)) {
        setPlacementTrends(profile.profileSections.placements.placementTrends);
      }
      if (Array.isArray(profile.profileSections?.placements?.notableOffers)) {
        setNotableOffers(profile.profileSections.placements.notableOffers);
      }
      const placementSection = profile.profileSections?.placements as
        | Record<string, unknown>
        | undefined;
      if (placementSection) {
        const report =
          (placementSection.report as Record<string, unknown>) ||
          DEFAULT_PLACEMENTS_ADVANCED.report;
        setPlacementsReportLabel(
          typeof report.label === "string"
            ? report.label
            : DEFAULT_PLACEMENTS_ADVANCED.report.label,
        );
        setPlacementsReportAction(
          typeof report.action === "string"
            ? report.action
            : DEFAULT_PLACEMENTS_ADVANCED.report.action,
        );

        const summaryStats = Array.isArray(placementSection.summary_stats)
          ? placementSection.summary_stats
          : DEFAULT_PLACEMENTS_ADVANCED.summary_stats;
        setPlacementsSummaryStatsRows(
          summaryStats.map((item, index) => {
            const stat = item as Record<string, unknown>;
            return {
              id:
                typeof stat.id === "string"
                  ? stat.id
                  : `summary_stat_${index + 1}`,
              label: typeof stat.label === "string" ? stat.label : "",
              value:
                typeof stat.value === "number"
                  ? String(stat.value)
                  : typeof stat.value === "string"
                    ? stat.value
                    : "",
              unit: typeof stat.unit === "string" ? stat.unit : "",
            };
          }),
        );

        const placementTrends =
          (placementSection.placement_trends as Record<string, unknown>) ||
          DEFAULT_PLACEMENTS_ADVANCED.placement_trends;
        setPlacementsTrendsLabel(
          typeof placementTrends.label === "string"
            ? placementTrends.label
            : DEFAULT_PLACEMENTS_ADVANCED.placement_trends.label,
        );
        setPlacementsTrendsPeriod(
          typeof placementTrends.period === "string"
            ? placementTrends.period
            : DEFAULT_PLACEMENTS_ADVANCED.placement_trends.period,
        );
        const years = Array.isArray(placementTrends.years)
          ? placementTrends.years
          : DEFAULT_PLACEMENTS_ADVANCED.placement_trends.years;
        setPlacementsTrendsYearsText(
          years.map((year) => String(year)).join(", "),
        );
        setPlacementsTrendsGrowthYoy(
          typeof placementTrends.avg_package_growth_yoy === "string"
            ? placementTrends.avg_package_growth_yoy
            : DEFAULT_PLACEMENTS_ADVANCED.placement_trends
                .avg_package_growth_yoy,
        );

        const industrySalaryReport =
          (placementSection.industry_salary_report as Record<
            string,
            unknown
          >) || DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report;
        setIndustrySalaryReportLabel(
          typeof industrySalaryReport.label === "string"
            ? industrySalaryReport.label
            : DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.label,
        );
        setIndustrySalaryReportColumnsText(
          Array.isArray(industrySalaryReport.columns)
            ? industrySalaryReport.columns
                .map((item) => String(item))
                .join(", ")
            : DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.columns.join(
                ", ",
              ),
        );
        const industryRows = Array.isArray(industrySalaryReport.industries)
          ? industrySalaryReport.industries
          : DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.industries;
        setIndustrySalaryRows(
          industryRows.map((item, index) => {
            const row = item as Record<string, unknown>;
            return {
              id: typeof row.id === "string" ? row.id : `industry_${index + 1}`,
              name: typeof row.name === "string" ? row.name : "",
              sub_label: typeof row.sub_label === "string" ? row.sub_label : "",
              students_placed:
                typeof row.students_placed === "number"
                  ? String(row.students_placed)
                  : typeof row.students_placed === "string"
                    ? row.students_placed
                    : "",
              avg_package:
                typeof row.avg_package === "string" ? row.avg_package : "",
              max_package:
                typeof row.max_package === "string" ? row.max_package : "",
            };
          }),
        );
        const industryCta =
          (industrySalaryReport.cta as Record<string, unknown>) ||
          DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.cta;
        setIndustryCtaLabel(
          typeof industryCta.label === "string"
            ? industryCta.label
            : DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.cta.label,
        );
        setIndustryCtaAction(
          typeof industryCta.action === "string"
            ? industryCta.action
            : DEFAULT_PLACEMENTS_ADVANCED.industry_salary_report.cta.action,
        );

        const notableOffersSection =
          (placementSection.notable_offers as Record<string, unknown>) ||
          DEFAULT_PLACEMENTS_ADVANCED.notable_offers;
        setNotableOffersLabel(
          typeof notableOffersSection.label === "string"
            ? notableOffersSection.label
            : DEFAULT_PLACEMENTS_ADVANCED.notable_offers.label,
        );
        const notableCta =
          (notableOffersSection.cta as Record<string, unknown>) ||
          DEFAULT_PLACEMENTS_ADVANCED.notable_offers.cta;
        setNotableOffersCtaLabel(
          typeof notableCta.label === "string"
            ? notableCta.label
            : DEFAULT_PLACEMENTS_ADVANCED.notable_offers.cta.label,
        );
        setNotableOffersCtaAction(
          typeof notableCta.action === "string"
            ? notableCta.action
            : DEFAULT_PLACEMENTS_ADVANCED.notable_offers.cta.action,
        );
        const featuredRows = Array.isArray(notableOffersSection.featured)
          ? notableOffersSection.featured
          : DEFAULT_PLACEMENTS_ADVANCED.notable_offers.featured;
        setNotableFeaturedRows(
          featuredRows.map((item) => {
            const featured = item as Record<string, unknown>;
            const offers = Array.isArray(featured.offers)
              ? featured.offers
              : [];
            return {
              company:
                typeof featured.company === "string" ? featured.company : "",
              tag: typeof featured.tag === "string" ? featured.tag : "",
              industry:
                typeof featured.industry === "string" ? featured.industry : "",
              offersText: offers
                .map((offer) => {
                  const offerRow = offer as Record<string, unknown>;
                  return [
                    typeof offerRow.role === "string" ? offerRow.role : "",
                    typeof offerRow.package === "number"
                      ? String(offerRow.package)
                      : typeof offerRow.package === "string"
                        ? offerRow.package
                        : "",
                    typeof offerRow.unit === "string" ? offerRow.unit : "",
                    typeof offerRow.type === "string" ? offerRow.type : "",
                  ].join("|");
                })
                .join("\n"),
            };
          }),
        );

        const allCompanyStatistics =
          (placementSection.all_company_statistics as Record<
            string,
            unknown
          >) || DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics;
        setAllCompanyStatisticsLabel(
          typeof allCompanyStatistics.label === "string"
            ? allCompanyStatistics.label
            : DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics.label,
        );
        setAllCompanyStatisticsColumnsText(
          Array.isArray(allCompanyStatistics.columns)
            ? allCompanyStatistics.columns
                .map((item) => String(item))
                .join(", ")
            : DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics.columns.join(
                ", ",
              ),
        );
        const companyRows = Array.isArray(allCompanyStatistics.companies)
          ? allCompanyStatistics.companies
          : DEFAULT_PLACEMENTS_ADVANCED.all_company_statistics.companies;
        setAllCompanyRows(
          companyRows.map((item, index) => {
            const row = item as Record<string, unknown>;
            return {
              id: typeof row.id === "string" ? row.id : `company_${index + 1}`,
              name: typeof row.name === "string" ? row.name : "",
              students:
                typeof row.students === "number"
                  ? String(row.students)
                  : typeof row.students === "string"
                    ? row.students
                    : "",
              avg_package:
                typeof row.avg_package === "string" ? row.avg_package : "",
              max_package:
                typeof row.max_package === "string" ? row.max_package : "",
            };
          }),
        );

        const studentSuccess = Array.isArray(placementSection.student_success)
          ? placementSection.student_success
          : DEFAULT_PLACEMENTS_ADVANCED.student_success;
        setStudentSuccessRows(
          studentSuccess.map((item) => {
            const row = item as Record<string, unknown>;
            return {
              name: typeof row.name === "string" ? row.name : "",
              placed_at: typeof row.placed_at === "string" ? row.placed_at : "",
              quote: typeof row.quote === "string" ? row.quote : "",
            };
          }),
        );
      }

      const feesSection = (profile.profileSections?.fees || {}) as Record<
        string,
        unknown
      >;
      const tuitionFees = (feesSection.tuition_fees || {}) as Record<
        string,
        unknown
      >;
      const tuitionDownload = (tuitionFees.download || {}) as Record<
        string,
        unknown
      >;
      setFeesDownload((prev) => ({
        label:
          typeof tuitionDownload.label === "string"
            ? tuitionDownload.label
            : prev.label,
        file_label:
          typeof tuitionDownload.file_label === "string"
            ? tuitionDownload.file_label
            : prev.file_label,
        file_size:
          typeof tuitionDownload.file_size === "string"
            ? tuitionDownload.file_size
            : prev.file_size,
        file_type:
          typeof tuitionDownload.file_type === "string"
            ? tuitionDownload.file_type
            : prev.file_type,
        action:
          typeof tuitionDownload.action === "string"
            ? tuitionDownload.action
            : prev.action,
      }));

      const tuitionFilters = (tuitionFees.filters || {}) as Record<
        string,
        unknown
      >;
      const quotaCategory = (tuitionFilters.quota_category || {}) as Record<
        string,
        unknown
      >;
      setFeesQuotaFilterLabel(
        typeof quotaCategory.label === "string"
          ? quotaCategory.label
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.label,
      );
      setFeesQuotaDefault(
        typeof quotaCategory.default === "string"
          ? quotaCategory.default
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.default,
      );
      setSelectedFeesQuotaFilter(
        typeof quotaCategory.default === "string"
          ? quotaCategory.default
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.default,
      );
      setFeesQuotaOptionsText(
        Array.isArray(quotaCategory.options)
          ? quotaCategory.options.map((item) => String(item)).join("\n")
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.quota_category.options.join(
              "\n",
            ),
      );

      const genderFilter = (tuitionFilters.gender || {}) as Record<
        string,
        unknown
      >;
      setFeesGenderFilterLabel(
        typeof genderFilter.label === "string"
          ? genderFilter.label
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.label,
      );
      setFeesGenderDefault(
        typeof genderFilter.default === "string"
          ? genderFilter.default
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.default,
      );
      setSelectedFeesGenderTab(
        typeof genderFilter.default === "string"
          ? genderFilter.default
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.default,
      );
      setFeesGenderOptionsText(
        Array.isArray(genderFilter.options)
          ? genderFilter.options.map((item) => String(item)).join("\n")
          : DEFAULT_FEES_ADVANCED.tuition_fees.filters.gender.options.join(
              "\n",
            ),
      );

      if (Array.isArray(tuitionFees.fee_matrix)) {
        setFeesMatrixRows(
          tuitionFees.fee_matrix.map((entry: any) => ({
            quota_category: entry?.quota_category || "",
            gender: entry?.gender || "",
            year1:
              entry?.year_wise_fees?.[0]?.amount == null
                ? ""
                : String(entry.year_wise_fees[0].amount),
            year2:
              entry?.year_wise_fees?.[1]?.amount == null
                ? ""
                : String(entry.year_wise_fees[1].amount),
            year3:
              entry?.year_wise_fees?.[2]?.amount == null
                ? ""
                : String(entry.year_wise_fees[2].amount),
            year4:
              entry?.year_wise_fees?.[3]?.amount == null
                ? ""
                : String(entry.year_wise_fees[3].amount),
          })),
        );
      }

      if (Array.isArray(feesSection.one_time_payable_fees)) {
        setOneTimePayableFees(
          feesSection.one_time_payable_fees.map((row: any, index: number) => ({
            id: row?.id || `one_time_${index + 1}`,
            label: row?.label || "",
            amount: row?.amount == null ? "" : String(row.amount),
          })),
        );
      }

      if (Array.isArray(feesSection.additional_fees)) {
        setAdditionalFees(
          feesSection.additional_fees.map((row: any, index: number) => ({
            id: row?.id || `additional_${index + 1}`,
            label: row?.label || "",
            amount: row?.amount == null ? "" : String(row.amount),
          })),
        );
      } else if (Array.isArray(feesSection.additionalFees)) {
        setAdditionalFees(
          feesSection.additionalFees.map((row: any, index: number) => ({
            id: row?.id || `additional_${index + 1}`,
            label: row?.label || row?.name || "",
            amount: row?.amount == null ? "" : String(row.amount),
          })),
        );
      }

      const inclusions = (feesSection.inclusions || {}) as Record<
        string,
        unknown
      >;
      if (Array.isArray(inclusions.whats_included)) {
        setInclusionIncludedText(inclusions.whats_included.join("\n"));
      }
      if (Array.isArray(inclusions.whats_excluded)) {
        setInclusionExcludedText(inclusions.whats_excluded.join("\n"));
      }

      if (Array.isArray(feesSection.deadlines_and_installments)) {
        setInstallmentSchedule(
          feesSection.deadlines_and_installments.map(
            (row: any, index: number) => ({
              id: row?.id || `installment_${index + 1}`,
              label: row?.label || row?.installmentNo || "",
              deadline: row?.deadline || row?.dueDate || "",
              amount: row?.amount == null ? "" : String(row.amount),
            }),
          ),
        );
      } else if (Array.isArray(feesSection.installments)) {
        setInstallmentSchedule(
          feesSection.installments.map((row: any, index: number) => ({
            id: row?.id || `installment_${index + 1}`,
            label:
              row?.label || row?.installmentNo || `Installment ${index + 1}`,
            deadline: row?.deadline || row?.dueDate || "",
            amount: row?.amount == null ? "" : String(row.amount),
          })),
        );
      }

      const feesSummary = (feesSection.fees_summary || {}) as Record<
        string,
        unknown
      >;
      setFeesSummaryFullCourseFee(
        feesSummary.full_course_fee == null
          ? ""
          : String(feesSummary.full_course_fee),
      );
      setFeesSummaryBookingAmount(
        feesSummary.booking_amount == null
          ? ""
          : String(feesSummary.booking_amount),
      );
      setFeesSummaryCurrency(
        typeof feesSummary.currency === "string"
          ? feesSummary.currency
          : DEFAULT_FEES_ADVANCED.fees_summary.currency,
      );

      if (Array.isArray(feesSection.refund_policy)) {
        setRefundPolicyText(feesSection.refund_policy.join("\n"));
      }
      if (
        Array.isArray(
          profile.profileSections?.financial_aid?.scholarshipCalculator?.inputs
            ?.portOfEntry,
        )
      ) {
        setCalculatorPortOfEntry(
          profile.profileSections.financial_aid.scholarshipCalculator.inputs
            .portOfEntry,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.financial_aid?.scholarshipCalculator?.inputs
            ?.rankRanges,
        )
      ) {
        setCalculatorRankRanges(
          profile.profileSections.financial_aid.scholarshipCalculator.inputs
            .rankRanges,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.financial_aid?.scholarshipCalculator
            ?.termsAndConditions,
        )
      ) {
        setCalculatorTerms(
          profile.profileSections.financial_aid.scholarshipCalculator
            .termsAndConditions,
        );
      }
      if (
        profile.profileSections?.financial_aid?.scholarshipCalculator
          ?.summary &&
        typeof profile.profileSections.financial_aid.scholarshipCalculator
          .summary === "object"
      ) {
        setCalculatorSummary({
          maxScholarship:
            profile.profileSections.financial_aid.scholarshipCalculator.summary
              .maxScholarship || "",
          netPayableFees:
            profile.profileSections.financial_aid.scholarshipCalculator.summary
              .netPayableFees || "",
        });
      }
      if (
        Array.isArray(
          profile.profileSections?.financial_aid?.financialConcessions,
        )
      ) {
        setFinancialConcessions(
          profile.profileSections.financial_aid.financialConcessions.map(
            (row: any) => ({
              type: row.type || "",
              discount: row.discount || "",
              details: row.details || "",
              eligibilityCriteriaText: Array.isArray(row.eligibilityCriteria)
                ? row.eligibilityCriteria.join("\n")
                : "",
              scholarshipAmount: row.scholarshipAmount || "",
              netPayable: row.netPayable || "",
            }),
          ),
        );
      } else if (
        Array.isArray(profile.profileSections?.financial_aid?.scholarships)
      ) {
        setFinancialConcessions(
          profile.profileSections.financial_aid.scholarships.map(
            (row: any) => ({
              type: row.name || "",
              discount: row.concession || "",
              details: "",
              eligibilityCriteriaText: row.criteria || "",
              scholarshipAmount: "",
              netPayable: "",
            }),
          ),
        );
      } else if (
        Array.isArray(profile.profileSections?.tuition_and_aid?.scholarships)
      ) {
        setFinancialConcessions(
          profile.profileSections.tuition_and_aid.scholarships.map(
            (row: any) => ({
              type: row.name || "",
              discount: row.concession || "",
              details: "",
              eligibilityCriteriaText: row.criteria || "",
              scholarshipAmount: "",
              netPayable: "",
            }),
          ),
        );
      }
      if (
        profile.profileSections?.financial_aid?.upfrontFeeConcession &&
        typeof profile.profileSections.financial_aid.upfrontFeeConcession ===
          "object"
      ) {
        setUpfrontFeeConcession({
          discount:
            profile.profileSections.financial_aid.upfrontFeeConcession
              .discount || "",
          details:
            profile.profileSections.financial_aid.upfrontFeeConcession
              .details || "",
        });
      }

      if (profile.profileSections?.exam_policy) {
        const examPolicy = profile.profileSections.exam_policy as any;

        setCourseWithPracticalMarks({
          theory: String(
            examPolicy?.course_with_practical?.marksDistribution?.theory ?? 50,
          ),
          practical: String(
            examPolicy?.course_with_practical?.marksDistribution?.practical ??
              20,
          ),
          internal: String(
            examPolicy?.course_with_practical?.marksDistribution?.internal ??
              30,
          ),
          total: String(
            examPolicy?.course_with_practical?.marksDistribution?.total ?? 100,
          ),
        });
        setCourseWithPracticalIsaTheory(
          Array.isArray(examPolicy?.course_with_practical?.isaTheory)
            ? examPolicy.course_with_practical.isaTheory
            : [],
        );
        setCourseWithPracticalIsaPractical(
          Array.isArray(examPolicy?.course_with_practical?.isaPractical)
            ? examPolicy.course_with_practical.isaPractical
            : [],
        );
        setCourseWithPracticalEsaTheory(
          Array.isArray(examPolicy?.course_with_practical?.esaTheory)
            ? examPolicy.course_with_practical.esaTheory
            : [],
        );
        setCourseWithPracticalEsaPractical(
          Array.isArray(examPolicy?.course_with_practical?.esaPractical)
            ? examPolicy.course_with_practical.esaPractical
            : [],
        );
        setCourseWithPracticalDuration(
          examPolicy?.course_with_practical?.duration || "",
        );

        setCourseWithoutPracticalMarks({
          theory: String(
            examPolicy?.course_without_practical?.marksDistribution?.theory ??
              75,
          ),
          internal: String(
            examPolicy?.course_without_practical?.marksDistribution?.internal ??
              25,
          ),
          total: String(
            examPolicy?.course_without_practical?.marksDistribution?.total ??
              100,
          ),
        });
        setCourseWithoutInternalAssessment(
          Array.isArray(
            examPolicy?.course_without_practical?.internalAssessment,
          )
            ? examPolicy.course_without_practical.internalAssessment
            : [],
        );
        setCourseWithoutAttendancePolicy(
          Array.isArray(examPolicy?.course_without_practical?.attendancePolicy)
            ? examPolicy.course_without_practical.attendancePolicy
            : [],
        );
        setCourseWithoutExternalPattern(
          Array.isArray(
            examPolicy?.course_without_practical?.externalExamPattern,
          )
            ? examPolicy.course_without_practical.externalExamPattern
            : [],
        );
        setCourseWithoutDuration(
          examPolicy?.course_without_practical?.duration || "",
        );

        setStandalonePracticalMarks({
          internal: String(
            examPolicy?.standalone_practical?.marksDistribution?.internal ?? 50,
          ),
          external: String(
            examPolicy?.standalone_practical?.marksDistribution?.external ?? 50,
          ),
          total: String(
            examPolicy?.standalone_practical?.marksDistribution?.total ?? 100,
          ),
        });
        setStandaloneInternalAssessment(
          Array.isArray(examPolicy?.standalone_practical?.internalAssessment)
            ? examPolicy.standalone_practical.internalAssessment
            : [],
        );
        setStandaloneExternalPattern(
          Array.isArray(examPolicy?.standalone_practical?.externalExamPattern)
            ? examPolicy.standalone_practical.externalExamPattern
            : [],
        );
        setStandaloneDuration(examPolicy?.standalone_practical?.duration || "");

        setProjectDissertationMarks({
          internal: String(
            examPolicy?.project_dissertation?.marksDistribution?.internal ?? 30,
          ),
          esa: String(
            examPolicy?.project_dissertation?.marksDistribution?.esa ?? 70,
          ),
          total: String(
            examPolicy?.project_dissertation?.marksDistribution?.total ?? 100,
          ),
        });
        setProjectInternalEvaluation(
          Array.isArray(examPolicy?.project_dissertation?.internalEvaluation)
            ? examPolicy.project_dissertation.internalEvaluation
            : [],
        );
        setProjectExternalEvaluation(
          Array.isArray(examPolicy?.project_dissertation?.externalEvaluation)
            ? examPolicy.project_dissertation.externalEvaluation
            : [],
        );

        setOjtAssessmentCriteria(
          Array.isArray(examPolicy?.ojt?.assessmentCriteria)
            ? examPolicy.ojt.assessmentCriteria
            : [],
        );
        setOjtTotalMarks(String(examPolicy?.ojt?.totalMarks ?? 100));

        setInternshipEvaluationComponents(
          Array.isArray(examPolicy?.internship?.evaluationComponents)
            ? examPolicy.internship.evaluationComponents
            : [],
        );
        setInternshipTotalMarks(
          String(examPolicy?.internship?.totalMarks ?? 100),
        );

        setGradingScaleRows(
          Array.isArray(examPolicy?.grading_scale)
            ? examPolicy.grading_scale
            : [],
        );

        setAcademicPoliciesRows(
          Array.isArray(examPolicy?.academic_policies)
            ? examPolicy.academic_policies
            : [],
        );
      }

      const reviewSection = profile.profileSections?.review as
        | {
            overallRating?: { rating?: number; totalReviews?: number };
            ratingDistribution?: { emoji?: string; count?: number }[];
            categoryRatings?: { category?: string; rating?: number }[];
            reviews?: {
              reviewerName?: string;
              reviewDate?: string;
              reviewText?: string;
            }[];
            pagination?: {
              loadMoreEnabled?: boolean;
              page?: number;
              pageSize?: number;
              hasMore?: boolean;
            };
          }
        | undefined;

      setReviewOverallRating(String(reviewSection?.overallRating?.rating ?? 0));
      setReviewTotalReviews(
        String(reviewSection?.overallRating?.totalReviews ?? 0),
      );
      setReviewRatingDistributionText(
        Array.isArray(reviewSection?.ratingDistribution)
          ? reviewSection.ratingDistribution
              .map((item) => `${item.emoji || ""}|${item.count ?? 0}`)
              .join("\n")
          : "",
      );
      setReviewCategoryRatingsText(
        Array.isArray(reviewSection?.categoryRatings)
          ? reviewSection.categoryRatings
              .map((item) => `${item.category || ""}|${item.rating ?? 0}`)
              .join("\n")
          : "",
      );
      setReviewEntriesText(
        Array.isArray(reviewSection?.reviews)
          ? reviewSection.reviews
              .map(
                (item) =>
                  `${item.reviewerName || ""}|${item.reviewDate || ""}|${item.reviewText || ""}`,
              )
              .join("\n")
          : "",
      );
      setReviewLoadMoreEnabled(
        reviewSection?.pagination?.loadMoreEnabled ?? true,
      );
      setReviewPage(String(reviewSection?.pagination?.page ?? 1));
      setReviewPageSize(String(reviewSection?.pagination?.pageSize ?? 10));
      setReviewHasMore(reviewSection?.pagination?.hasMore ?? true);

      const librarySection = profile.profileSections?.library as
        | {
            libraryInfo?: {
              libraryName?: string;
              areaSqFeet?: number;
              totalSeats?: number;
              totalVolumes?: number;
              researchCabins?: number;
            };
            availableResources?: { resourceType?: string; count?: number }[];
            libraryHours?: {
              day?: string;
              workingHours?: string;
              transactionHours?: string;
            }[];
            facilities?:
              | string[]
              | { title?: string; image?: string; img?: string }[];
          }
        | undefined;

      setLibraryName(librarySection?.libraryInfo?.libraryName || "");
      setLibraryAreaSqFeet(
        String(librarySection?.libraryInfo?.areaSqFeet ?? 0),
      );
      setLibraryTotalSeats(
        String(librarySection?.libraryInfo?.totalSeats ?? 0),
      );
      setLibraryTotalVolumes(
        String(librarySection?.libraryInfo?.totalVolumes ?? 0),
      );
      setLibraryResearchCabins(
        String(librarySection?.libraryInfo?.researchCabins ?? 0),
      );
      setLibraryResourceRows(
        Array.isArray(librarySection?.availableResources)
          ? librarySection.availableResources.map((item) => ({
              resourceType: item.resourceType || "",
              count: String(item.count ?? ""),
            }))
          : [],
      );
      setLibraryHourRows(
        Array.isArray(librarySection?.libraryHours)
          ? librarySection.libraryHours.map((item) => ({
              day: item.day || "",
              workingHours: item.workingHours || "",
              transactionHours: item.transactionHours || "",
            }))
          : [],
      );
      setLibraryFacilityRows(
        Array.isArray(librarySection?.facilities)
          ? librarySection.facilities.map((item) =>
              typeof item === "string"
                ? { title: item, image: "" }
                : {
                    title: item.title || "",
                    image: item.image || item.img || "",
                  },
            )
          : [],
      );

      const conductSection = profile.profileSections
        ?.student_code_of_conduct as
        | {
            title?: string;
            disciplineRules?: { order?: number; rule?: string }[];
          }
        | undefined;

      setConductTitle(conductSection?.title || "");
      setConductRulesText(
        Array.isArray(conductSection?.disciplineRules)
          ? conductSection.disciplineRules
              .map((item) => `${item.order ?? 0}|${item.rule || ""}`)
              .join("\n")
          : "",
      );

      const courseInfoSection = (profile.profileSections?.course_info ||
        {}) as any;
      const currentCourseInfo =
        courseInfoSection?.data &&
        typeof courseInfoSection.data === "object" &&
        !Array.isArray(courseInfoSection.data)
          ? {
              ...courseInfoSection.data,
              course_name:
                courseInfoSection.course_name ||
                courseInfoSection.data.course_name,
            }
          : courseInfoSection;
      const legacyCourseInfo =
        currentCourseInfo.course_details ||
        (profile.profileSections?.other_courses_offered as any) ||
        {};

      const admissions = Array.isArray(currentCourseInfo.admissions)
        ? currentCourseInfo.admissions
        : Array.isArray(legacyCourseInfo?.courseHeader?.admissionCycle)
          ? legacyCourseInfo.courseHeader.admissionCycle.map(
              (year: string) => ({
                year,
                status: legacyCourseInfo?.courseHeader?.admissionStatus || null,
                placement_rate: String(
                  legacyCourseInfo?.courseHeader?.seatAvailabilityPercent || "",
                ),
                seats_note:
                  legacyCourseInfo?.courseHeader?.seatAvailabilityMessage ||
                  null,
                basic_details: {
                  duration: legacyCourseInfo?.courseHeader?.duration || "",
                  study_mode: legacyCourseInfo?.courseHeader?.studyMode || "",
                  academic_cycle:
                    legacyCourseInfo?.courseHeader?.academicCycle || "",
                  total_credits: legacyCourseInfo?.courseHeader?.credits || 0,
                  gender_accepted:
                    legacyCourseInfo?.courseHeader?.genderAccepted || "",
                  course_category:
                    legacyCourseInfo?.courseHeader?.courseCategory || "",
                },
              }),
            )
          : [];

      const firstAdmission = admissions[0] || {};
      const firstAdmissionBasic = firstAdmission.basic_details || {};

      setAdmissionsMatrixText(
        admissions
          .map((item: any) => {
            const basicDetails = item?.basic_details || {};
            return [
              item?.year || "",
              item?.status || "",
              item?.placement_rate || "",
              item?.seats_note || "",
              basicDetails?.duration || "",
              basicDetails?.study_mode || "",
              basicDetails?.academic_cycle || "",
              String(basicDetails?.total_credits ?? 0),
              basicDetails?.gender_accepted || "",
              basicDetails?.course_category || "",
            ].join("|");
          })
          .join("\n"),
      );

      const selectedCourseName =
        currentCourseInfo.course_name ||
        legacyCourseInfo?.courseHeader?.courseName ||
        "";

      setOtherCourseName(selectedCourseName);

      const profileOtherCoursesSection = profile.profileSections
        ?.other_courses_offered as
        | {
            courses?: {
              id?: string;
              catalogCourseId?: string;
              catalog_course_id?: string;
              name?: string;
              courseName?: string;
              course_name?: string;
              code?: string;
              studyLevel?: string;
              study_level?: string;
            }[];
          }
        | undefined;

      setOtherCoursesRows(
        Array.isArray(profileOtherCoursesSection?.courses)
          ? profileOtherCoursesSection.courses
              .map((course) => ({
                id: course.id || "",
                catalogCourseId:
                  course.catalogCourseId || course.catalog_course_id || "",
                name:
                  course.name || course.courseName || course.course_name || "",
                code: course.code || "",
                studyLevel:
                  normalizeStudyLevelHeading(
                    course.studyLevel || course.study_level || "",
                  ) || "Other",
              }))
              .filter((course) => course.name || course.code)
          : [],
      );
      setOtherAdmissionCyclesText(
        admissions
          .map((item: any) => item?.year || "")
          .filter(Boolean)
          .join("\n"),
      );
      setOtherAdmissionStatus(firstAdmission?.status || "");
      setOtherSeatAvailabilityPercent(firstAdmission?.placement_rate || "");
      setOtherSeatAvailabilityMessage(firstAdmission?.seats_note || "");
      setOtherDuration(firstAdmissionBasic?.duration || "");
      setOtherStudyMode(firstAdmissionBasic?.study_mode || "");
      setOtherAcademicCycle(firstAdmissionBasic?.academic_cycle || "");
      setOtherCredits(String(firstAdmissionBasic?.total_credits ?? 0));
      setOtherGenderAccepted(firstAdmissionBasic?.gender_accepted || "");
      setOtherCourseCategory(firstAdmissionBasic?.course_category || "");

      setProgramHighlightsText(
        Array.isArray(currentCourseInfo?.program_highlights)
          ? currentCourseInfo.program_highlights.join("\n")
          : Array.isArray(legacyCourseInfo?.programHighlights)
            ? legacyCourseInfo.programHighlights
                .map((item: any) => item.description || "")
                .join("\n")
            : "",
      );
      setCourseAccoladesText(
        Array.isArray(currentCourseInfo?.course_accolades)
          ? currentCourseInfo.course_accolades
              .map(
                (item: any) =>
                  `${item.body || ""}|${item.rank || ""}|${item.image || ""}`,
              )
              .join("\n")
          : Array.isArray(legacyCourseInfo?.courseAccolades)
            ? legacyCourseInfo.courseAccolades
                .map(
                  (item: any) =>
                    `${item.title || ""}|${item.description || ""}|`,
                )
                .join("\n")
            : "",
      );

      setApplicationStartDate(
        currentCourseInfo?.key_dates?.application_start || "",
      );
      setApplicationCloseDate(
        currentCourseInfo?.key_dates?.application_close?.date || "",
      );
      setApplicationCloseUrgency(
        currentCourseInfo?.key_dates?.application_close?.urgency || "",
      );
      setClassCommencementDate(
        currentCourseInfo?.key_dates?.class_commencement?.date || "",
      );
      setClassCommencementNote(
        currentCourseInfo?.key_dates?.class_commencement?.note || "",
      );

      setCurriculumBrochureUrl(
        currentCourseInfo?.curriculum?.brochure_upload ||
          legacyCourseInfo?.curriculum?.brochureUrl ||
          "",
      );
      setCurriculumBrochureAvailable(
        Boolean(currentCourseInfo?.curriculum?.brochure_available),
      );
      setCurriculumSemestersText(
        Array.isArray(currentCourseInfo?.curriculum?.semesters)
          ? currentCourseInfo.curriculum.semesters
              .map(
                (item: any) =>
                  `${item.semester ?? 0}|${(item.core_subjects || []).join(", ")}|${item.specialization_1?.name || ""}|${(item.specialization_1?.electives || []).join(", ")}|${item.specialization_2?.name || ""}|${item.specialization_2?.note || ""}`,
              )
              .join("\n")
          : Array.isArray(legacyCourseInfo?.curriculum?.semesters)
            ? legacyCourseInfo.curriculum.semesters
                .map(
                  (item: any) =>
                    `${item.semester ?? 0}|${(item.subjects || []).join(", ")}|Specialization 1|${(item.specializations || []).join(", ")}|Select Elective|`,
                )
                .join("\n")
            : "",
      );
      setCourseStructureTotalCredits(
        String(
          currentCourseInfo?.curriculum?.course_structure?.total_credits ?? 0,
        ),
      );
      setCourseStructureText(
        Array.isArray(
          currentCourseInfo?.curriculum?.course_structure?.breakdown,
        )
          ? currentCourseInfo.curriculum.course_structure.breakdown
              .map((item: any) => `${item.track || ""}|${item.credits ?? 0}`)
              .join("\n")
          : Array.isArray(legacyCourseInfo?.courseStructure)
            ? legacyCourseInfo.courseStructure
                .map(
                  (item: any) => `${item.component || ""}|${item.credits ?? 0}`,
                )
                .join("\n")
            : "",
      );

      if (currentCourseInfo?.value_added_course) {
        setValueAddedCoursesText(
          `${currentCourseInfo.value_added_course.name || ""}|${currentCourseInfo.value_added_course.credits ?? ""}|${currentCourseInfo.value_added_course.delivery_mode || ""}|${currentCourseInfo.value_added_course.course_type || ""}`,
        );
      } else {
        setValueAddedCoursesText(
          Array.isArray(legacyCourseInfo?.valueAddedCourses)
            ? legacyCourseInfo.valueAddedCourses
                .map(
                  (item: any) =>
                    `${item.courseName || ""}|${item.credits || ""}|${item.deliveryMode || ""}|${item.courseType || ""}`,
                )
                .join("\n")
            : "",
        );
      }

      setCareerOpportunitiesText(
        Array.isArray(currentCourseInfo?.career_opportunities)
          ? currentCourseInfo.career_opportunities
              .map(
                (item: any) => `${item.role || ""}|${item.salary_range || ""}`,
              )
              .join("\n")
          : Array.isArray(legacyCourseInfo?.careerOpportunities)
            ? legacyCourseInfo.careerOpportunities
                .map(
                  (item: any) => `${item.role || ""}|${item.salaryRange || ""}`,
                )
                .join("\n")
            : "",
      );

      setHigherEducationHeadingsText(
        Array.isArray(currentCourseInfo?.higher_education_and_certifications)
          ? serializeHigherEducationHeadingsToText(
              currentCourseInfo.higher_education_and_certifications,
            )
          : serializeHigherEducationHeadingsToText([
              {
                title: "Global Certifications",
                description: Array.isArray(
                  legacyCourseInfo?.higherEducation?.globalCertifications,
                )
                  ? legacyCourseInfo.higherEducation.globalCertifications
                  : [],
              },
              {
                title: "Postgraduation",
                description: Array.isArray(
                  legacyCourseInfo?.higherEducation?.higherStudies,
                )
                  ? legacyCourseInfo.higherEducation.higherStudies
                  : [],
              },
            ]),
      );
      setExitOptionsText(
        Array.isArray(currentCourseInfo?.flexible_exit_options)
          ? currentCourseInfo.flexible_exit_options
              .map(
                (item: any) =>
                  `${item.after_years ?? 0}|${item.credential || ""}`,
              )
              .join("\n")
          : Array.isArray(legacyCourseInfo?.exitOptions)
            ? legacyCourseInfo.exitOptions
                .map(
                  (item: any) => `${item.after || ""}|${item.credential || ""}`,
                )
                .join("\n")
            : "",
      );
      setClassTimingsMode(currentCourseInfo?.class_timings?.mode || "");
      setClassTimingsText(
        Array.isArray(currentCourseInfo?.class_timings?.schedule)
          ? currentCourseInfo.class_timings.schedule
              .map(
                (item: any) =>
                  `${item.day || ""}|${item.timing || ""}|${item.status || ""}`,
              )
              .join("\n")
          : Array.isArray(legacyCourseInfo?.classTimings)
            ? legacyCourseInfo.classTimings
                .map((item: any) => `${item.day || ""}|${item.timing || ""}|`)
                .join("\n")
            : "",
      );
      setIndustryToolsText(
        Array.isArray(currentCourseInfo?.industry_tools)
          ? currentCourseInfo.industry_tools.join("\n")
          : Array.isArray(legacyCourseInfo?.industryTools)
            ? legacyCourseInfo.industryTools.join("\n")
            : "",
      );
      setLabFacilitiesText(
        Array.isArray(currentCourseInfo?.lab_facilities)
          ? currentCourseInfo.lab_facilities.join("\n")
          : Array.isArray(legacyCourseInfo?.labFacilities)
            ? legacyCourseInfo.labFacilities.join("\n")
            : "",
      );
      setClassroomFacilitiesText(
        Array.isArray(currentCourseInfo?.classroom_facilities)
          ? currentCourseInfo.classroom_facilities.join("\n")
          : Array.isArray(legacyCourseInfo?.classroomFacilities)
            ? legacyCourseInfo.classroomFacilities.join("\n")
            : "",
      );
      setBonusCertificationText(
        Array.isArray(currentCourseInfo?.bonus_certification)
          ? currentCourseInfo.bonus_certification
              .map(
                (item: any) =>
                  `${item?.name || ""}|${item?.note || ""}|${Boolean(item?.certificate_details_available)}|${item?.details_page || ""}`,
              )
              .join("\n")
          : currentCourseInfo?.bonus_certification &&
              typeof currentCourseInfo.bonus_certification === "object"
            ? `${currentCourseInfo?.bonus_certification?.name || ""}|${currentCourseInfo?.bonus_certification?.note || ""}|${Boolean(currentCourseInfo?.bonus_certification?.certificate_details_available)}|${currentCourseInfo?.bonus_certification?.details_page || ""}`
            : legacyCourseInfo?.bonusCertification
              ? `${legacyCourseInfo?.bonusCertification?.title || ""}|${legacyCourseInfo?.bonusCertification?.description || ""}|false|${legacyCourseInfo?.bonusCertification?.detailsPage || ""}`
              : "",
      );
      setFeaturedAlumniText(
        Array.isArray(currentCourseInfo?.featured_alumni)
          ? currentCourseInfo.featured_alumni
              .map(
                (item: any) =>
                  `${item.name || ""}|${item.designation || ""}|${(
                    item.career_progression || []
                  )
                    .map(
                      (progression: any) =>
                        `${progression.year || ""}:${progression.milestone || ""}`,
                    )
                    .join(";")}`,
              )
              .join("\n")
          : Array.isArray(legacyCourseInfo?.featuredAlumni)
            ? legacyCourseInfo.featuredAlumni
                .map(
                  (item: any) =>
                    `${item.name || ""}|${item.designation || ""}|${(item.journeyTimeline || []).join(";")}`,
                )
                .join("\n")
            : "",
      );
      setFaqsText(
        Array.isArray(currentCourseInfo?.faqs)
          ? serializeFaqsToText(currentCourseInfo.faqs)
          : Array.isArray(legacyCourseInfo?.faqs)
            ? legacyCourseInfo.faqs
                .map(
                  (item: any) => `${item.question || ""}|${item.answer || ""}`,
                )
                .join("\n")
            : "",
      );
      setStudentForumDescription(
        currentCourseInfo?.student_forum?.description ||
          legacyCourseInfo?.studentForum?.description ||
          "",
      );
      setStudentForumCtaLabel(
        currentCourseInfo?.student_forum?.cta ||
          legacyCourseInfo?.studentForum?.ctaLabel ||
          "",
      );

      const persistedCourseEntries =
        extractCourseInfoCourseEntries(courseInfoSection);

      const hydratedVariants = Object.entries(persistedCourseEntries).reduce<
        Record<string, CourseInfoDraft>
      >((acc, [courseName, payload]) => {
        if (!courseName.trim()) {
          return acc;
        }

        if (!hasMeaningfulCourseInfoDetails(payload)) {
          return acc;
        }

        acc[courseName] = hydrateCourseInfoDraftFromPayload(
          payload,
          courseName,
        );
        return acc;
      }, {});

      const activeCoursePayload = {
        ...currentCourseInfo,
        course_name: selectedCourseName,
        admissions,
      };

      if (
        selectedCourseName.trim() &&
        !hydratedVariants[selectedCourseName] &&
        hasMeaningfulCourseInfoDetails(activeCoursePayload)
      ) {
        hydratedVariants[selectedCourseName] =
          hydrateCourseInfoDraftFromPayload(
            activeCoursePayload,
            selectedCourseName,
          );
      }

      setCourseInfoDrafts(hydratedVariants);

      const preferredCourseName =
        selectedCourseName.trim() || Object.keys(hydratedVariants)[0] || "";

      if (preferredCourseName) {
        setOtherCourseName(preferredCourseName);
        const preferredDraft =
          hydratedVariants[preferredCourseName] ||
          createEmptyCourseInfoDraft(preferredCourseName);
        applyCourseInfoDraftToState(preferredDraft);
      }
    }
  }, [profile, reset]);

  useEffect(() => {
    setOtherCoursesRows((prev) => {
      const manualRows = prev.filter((row) => !row.catalogCourseId);
      const rowByCatalogId = new Map(
        prev
          .filter((row) => row.catalogCourseId)
          .map((row) => [row.catalogCourseId, row]),
      );

      const catalogRows = collegeCourses.map((course) => {
        const existing = rowByCatalogId.get(course.id);
        return {
          id: existing?.id || "",
          catalogCourseId: course.id,
          name: existing?.name || course.name || "",
          code: existing?.code || course.code || "",
          studyLevel: normalizeStudyLevelHeading(
            existing?.studyLevel || course.studyLevel?.name || "Other",
          ),
        };
      });

      return [...catalogRows, ...manualRows];
    });
  }, [collegeCourses]);

  useEffect(() => {
    const totalAdmissions = parsePipeRows(admissionsMatrixText).length;

    if (totalAdmissions === 0) {
      if (activeAdmissionIndex !== 0) {
        setActiveAdmissionIndex(0);
      }
      return;
    }

    if (activeAdmissionIndex >= totalAdmissions) {
      setActiveAdmissionIndex(totalAdmissions - 1);
    }
  }, [admissionsMatrixText, activeAdmissionIndex]);

  useEffect(() => {
    if (!allianceItems || allianceItems.length === 0) {
      if (selectedAllianceIndex !== null) {
        setSelectedAllianceIndex(null);
      }
      return;
    }

    if (
      selectedAllianceIndex === null ||
      selectedAllianceIndex >= allianceItems.length
    ) {
      setSelectedAllianceIndex(0);
    }
  }, [allianceItems, selectedAllianceIndex]);

  const filteredAllianceColleges = publicColleges
    .filter((college) => college.id !== profile?.id)
    .filter((college) => {
      const query = allianceSearchQuery.trim().toLowerCase();

      if (!query) {
        return false;
      }

      return [college.name, college.slug, college.code]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .slice(0, 8);

  const courseNameOptions = Array.from(
    new Set(
      [
        ...Object.keys(courseInfoDrafts),
        ...otherCoursesRows.map((course) => course.name),
        ...collegeCourses.map((course) => course.name),
        otherCourseName,
      ]
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );

  const groupedOtherCourses = otherCoursesRows.reduce<
    Record<
      string,
      {
        index: number;
        id: string;
        catalogCourseId: string;
        name: string;
        code: string;
        studyLevel: string;
      }[]
    >
  >((acc, course, rowIndex) => {
    const heading = normalizeStudyLevelHeading(course.studyLevel);

    if (!acc[heading]) {
      acc[heading] = [];
    }

    acc[heading].push({
      index: rowIndex,
      ...course,
    });
    return acc;
  }, {});

  const sortedOtherCourseHeadings = Object.keys(groupedOtherCourses).sort(
    (a, b) => {
      const order: Record<string, number> = {
        UG: 0,
        PG: 1,
        Doctorate: 2,
        Diploma: 3,
        Other: 99,
      };

      const indexA = order[a] ?? 50;
      const indexB = order[b] ?? 50;
      if (indexA === indexB) {
        return a.localeCompare(b);
      }

      return indexA - indexB;
    },
  );

  const setAllianceTextList = (
    index: number,
    field: "documents" | "allianceActivities",
    value: string,
  ) => {
    setValue(
      `profileSections.alliance.items.${index}.${field}` as const,
      fromLineText(value),
      { shouldDirty: true },
    );
  };

  const addAllianceFromCollege = (college: (typeof publicColleges)[number]) => {
    const nextIndex = allianceFields.length;

    appendAlliance({
      sourceCollegeId: college.id,
      sourceCollegeSlug: college.slug,
      sourceCollegeName: college.name,
      image: "",
      type: college.university?.type || "Academic",
      logo: college.logoUrl || college.university?.logoUrl || "",
      title: college.name,
      description: "",
      about: "",
      collaboration: "",
      keyFocus: "",
      legal: "",
      documents: [],
      allianceActivities: [],
    });
    setSelectedAllianceIndex(nextIndex);
    setAllianceSearchQuery("");
  };

  const handleAddOtherCourse = () => {
    if (
      !newOtherCourseForm.name.trim() ||
      !newOtherCourseForm.code.trim() ||
      !newOtherCourseForm.disciplineId ||
      !newOtherCourseForm.studyLevelId ||
      !newOtherCourseForm.programTypeId ||
      !newOtherCourseForm.studyMode
    ) {
      toast.error(
        "Please fill course name, code, discipline, study level, program type, and study mode.",
      );
      return;
    }

    createCourse(
      {
        name: newOtherCourseForm.name.trim(),
        code: newOtherCourseForm.code.trim(),
        disciplineId: newOtherCourseForm.disciplineId,
        studyLevelId: newOtherCourseForm.studyLevelId,
        programTypeId: newOtherCourseForm.programTypeId,
        studyMode: newOtherCourseForm.studyMode,
        campusId: newOtherCourseForm.campusId || null,
        duration: newOtherCourseForm.duration.trim() || null,
        eligibility: newOtherCourseForm.eligibility.trim() || null,
        intakeCapacity: newOtherCourseForm.intakeCapacity
          ? Number(newOtherCourseForm.intakeCapacity)
          : null,
      },
      {
        onSuccess: () => {
          toast.success("Course added successfully");
          setNewOtherCourseForm({
            name: "",
            code: "",
            disciplineId: "",
            studyLevelId: "",
            programTypeId: "",
            campusId: "",
            studyMode: "full_time",
            duration: "",
            eligibility: "",
            intakeCapacity: "",
          });
        },
      },
    );
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities([...amenities, customAmenity.trim()]);
      setCustomAmenity("");
    }
  };

  const submitProfile = (
    data: ProfileFormData,
    options?: { redirectToCampuses?: boolean },
  ) => {
    const parsePlacementValue = (value: string): number | string => {
      const trimmed = value.trim();
      if (!trimmed) return "";
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) && /^[-+]?\d*\.?\d+$/.test(trimmed)
        ? parsed
        : trimmed;
    };

    const parsedPlacementsAdvanced: Record<string, unknown> = {
      report: {
        label: placementsReportLabel,
        action: placementsReportAction,
      },
      summary_stats: placementsSummaryStatsRows
        .filter(
          (row) =>
            row.id.trim() ||
            row.label.trim() ||
            row.value.trim() ||
            row.unit.trim(),
        )
        .map((row, index) => ({
          id: row.id.trim() || `summary_stat_${index + 1}`,
          label: row.label,
          value: parsePlacementValue(row.value),
          unit: row.unit.trim() || null,
        })),
      placement_trends: {
        label: placementsTrendsLabel,
        period: placementsTrendsPeriod,
        years: placementsTrendsYearsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => Number(item))
          .filter(Number.isFinite),
        avg_package_growth_yoy: placementsTrendsGrowthYoy,
      },
      industry_salary_report: {
        label: industrySalaryReportLabel,
        columns: industrySalaryReportColumnsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        industries: industrySalaryRows
          .filter(
            (row) =>
              row.id.trim() ||
              row.name.trim() ||
              row.sub_label.trim() ||
              row.students_placed.trim() ||
              row.avg_package.trim() ||
              row.max_package.trim(),
          )
          .map((row, index) => ({
            id: row.id.trim() || `industry_${index + 1}`,
            name: row.name,
            sub_label: row.sub_label,
            students_placed: safeNumber(row.students_placed || "0"),
            avg_package: row.avg_package,
            max_package: row.max_package,
          })),
        cta: {
          label: industryCtaLabel,
          action: industryCtaAction,
        },
      },
      notable_offers: {
        label: notableOffersLabel,
        cta: {
          label: notableOffersCtaLabel,
          action: notableOffersCtaAction,
        },
        featured: notableFeaturedRows
          .filter(
            (row) =>
              row.company.trim() ||
              row.tag.trim() ||
              row.industry.trim() ||
              row.offersText.trim(),
          )
          .map((row) => ({
            company: row.company,
            tag: row.tag,
            industry: row.industry,
            offers: parsePipeRows(row.offersText)
              .filter(
                (offerRow) =>
                  offerRow[0] || offerRow[1] || offerRow[2] || offerRow[3],
              )
              .map(([role, pkg, unit, type]) => ({
                role: role || "",
                package: safeNumber(pkg || "0"),
                unit: unit || "",
                type: type || "",
              })),
          })),
      },
      all_company_statistics: {
        label: allCompanyStatisticsLabel,
        columns: allCompanyStatisticsColumnsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        companies: allCompanyRows
          .filter(
            (row) =>
              row.id.trim() ||
              row.name.trim() ||
              row.students.trim() ||
              row.avg_package.trim() ||
              row.max_package.trim(),
          )
          .map((row, index) => ({
            id: row.id.trim() || `company_${index + 1}`,
            name: row.name,
            students: safeNumber(row.students || "0"),
            avg_package: row.avg_package,
            max_package: row.max_package,
          })),
      },
      student_success: studentSuccessRows
        .filter(
          (row) => row.name.trim() || row.placed_at.trim() || row.quote.trim(),
        )
        .map((row) => ({
          name: row.name,
          placed_at: row.placed_at,
          quote: row.quote,
        })),
    };

    // Construct final JSON payload cleanly preserving both standard and complex attributes
    const normalizedAdmissionPolicy = normalizeSectionMeta(
      "admission_policy",
      data.profileSections.admission_policy as unknown as Record<
        string,
        unknown
      >,
    );
    const normalizedOverview = normalizeSectionMeta(
      "college_overview",
      data.profileSections.college_overview as unknown as Record<
        string,
        unknown
      >,
    );
    const normalizedCourseInfo = normalizeSectionMeta(
      "course_info",
      data.profileSections.course_info as unknown as Record<string, unknown>,
    );
    const normalizedPlacements = normalizeSectionMeta(
      "placements",
      data.profileSections.placements as unknown as Record<string, unknown>,
    );
    const normalizedExamPolicy = normalizeSectionMeta(
      "exam_policy",
      data.profileSections.exam_policy as unknown as Record<string, unknown>,
    );
    const normalizedFees = normalizeSectionMeta(
      "fees",
      data.profileSections.fees as unknown as Record<string, unknown>,
    );
    const normalizedFinancialAid = normalizeSectionMeta(
      "financial_aid",
      data.profileSections.financial_aid as unknown as Record<string, unknown>,
    );
    const normalizedReview = normalizeSectionMeta(
      "review",
      data.profileSections.review as unknown as Record<string, unknown>,
    );
    const normalizedOtherCoursesOffered = normalizeSectionMeta(
      "other_courses_offered",
      data.profileSections.other_courses_offered as unknown as Record<
        string,
        unknown
      >,
    );
    const normalizedLibrary = normalizeSectionMeta(
      "library",
      data.profileSections.library as unknown as Record<string, unknown>,
    );
    const normalizedStudentCodeOfConduct = normalizeSectionMeta(
      "student_code_of_conduct",
      data.profileSections.student_code_of_conduct as unknown as Record<
        string,
        unknown
      >,
    );

    const reviewDistributionRows = parsePipeRows(reviewRatingDistributionText)
      .filter((row) => row[0])
      .map(([emoji, count]) => ({
        emoji,
        count: safeNumber(count || "0"),
      }));
    const reviewCategoryRows = parsePipeRows(reviewCategoryRatingsText)
      .filter((row) => row[0])
      .map(([category, rating]) => ({
        category,
        rating: safeNumber(rating || "0"),
      }));
    const reviewRows = parsePipeRows(reviewEntriesText)
      .filter((row) => row[0] || row[1] || row[2])
      .map(([reviewerName, reviewDate, reviewText]) => ({
        reviewerName: reviewerName || "",
        reviewDate: reviewDate || "",
        reviewText: reviewText || "",
      }));

    const normalizedLibraryResourceRows = libraryResourceRows
      .filter((row) => row.resourceType || row.count)
      .map((row) => ({
        resourceType: row.resourceType,
        count: safeNumber(row.count || "0"),
      }));
    const normalizedLibraryHourRows = libraryHourRows
      .filter((row) => row.day || row.workingHours || row.transactionHours)
      .map((row) => ({
        day: row.day,
        workingHours: row.workingHours,
        transactionHours: row.transactionHours,
      }));
    const normalizedLibraryFacilityRows = libraryFacilityRows
      .filter((row) => row.title || row.image)
      .map((row) => ({
        title: row.title,
        image: row.image,
      }));
    const normalizedOtherCoursesRows = otherCoursesRows
      .filter((row) => row.name || row.code)
      .map((row) => ({
        id: row.id,
        catalogCourseId: row.catalogCourseId,
        name: row.name,
        code: row.code,
        studyLevel: normalizeStudyLevelHeading(row.studyLevel),
      }));

    const conductRuleRows = parsePipeRows(conductRulesText)
      .filter((row) => row[0] || row[1])
      .map(([order, rule]) => ({
        order: safeNumber(order || "0"),
        rule: rule || "",
      }));

    const currentCourseDraft =
      buildCourseInfoDraftFromCurrentState(otherCourseName);
    const currentCourseKey = currentCourseDraft.course_name.trim();
    const combinedCourseDrafts = { ...courseInfoDrafts };

    if (currentCourseKey) {
      combinedCourseDrafts[currentCourseKey] = currentCourseDraft;
    }

    const activeCourseInfoPayload =
      buildCourseInfoPayloadFromDraft(currentCourseDraft);

    const profileSectionsPayload = {
      ...data.profileSections,
      college_overview: {
        ...(() => {
          const {
            accreditation_and_affilation: _legacyAccreditation,
            ...rest
          } = normalizedOverview as Record<string, unknown>;
          return rest;
        })(),
        accreditation_and_affiliation: overviewRankings,
        institution_details: {
          established_year:
            data.profileSections.college_overview.instution_details.estd,
          total_courses: profile?.totalCourses ?? 0,
          institute_type: profile?.instituteType || "",
          gender_accepted:
            data.profileSections.college_overview.instution_details.gender,
          average_student_count:
            data.profileSections.college_overview.instution_details
              .average_student_count,
          campus_size:
            data.profileSections.college_overview.instution_details.campus_size,
          students_from_outside_state:
            data.profileSections.college_overview.instution_details
              .Student_from_outside,
          pincode: data.pinCode,
        },
        amenities,
        aminities: amenities,
        inside_campus_facilities: insideCampusFacilities,
        nearby_access: {
          transit: transitAccess,
          essentials: essentialsAccess,
          utilities: utilitiesAccess,
        },
        campusambassidors: profile?.campusAmbassadors ?? [],
        connectwithus: {
          links: connectLinks,
        },
        campus_reels: campusReels,
        campus: campusReels.map((reel) => ({
          title: reel.title,
          link: reel.link,
          link_type: reel.link.includes("youtube.com") ? "youtube" : "normal",
        })),
      },
      course_info: {
        id: (normalizedCourseInfo as Record<string, unknown>).id,
        enabled: (normalizedCourseInfo as Record<string, unknown>).enabled,
        course_name: activeCourseInfoPayload.course_name,
        data: activeCourseInfoPayload,
      },
      other_courses_offered: {
        ...normalizedOtherCoursesOffered,
        courses: normalizedOtherCoursesRows,
      },
      admission_policy: {
        ...normalizedAdmissionPolicy,
        seatMatrix: seatMatrix.map((row) => ({
          quotaCategory: row.quota,
          total: row.total,
          open: row.open,
        })),
        eligibility_criteria: {
          applicant_type_tabs: eligibilityCriteriaModel.applicant_type_tabs.map(
            (tab) => ({
              id: tab.id,
              label: tab.label,
              quota_categories: tab.quota_categories.map((quota) => ({
                id: quota.id,
                label: quota.label,
                criteria: quota.criteria
                  .filter(
                    (criterion) =>
                      criterion.title.trim().length > 0 ||
                      criterion.description.trim().length > 0 ||
                      criterion.logo.trim().length > 0,
                  )
                  .map((criterion) => ({
                    title: criterion.title,
                    description: criterion.description,
                    logo: criterion.logo,
                  })),
              })),
            }),
          ),
          default_applicant_type:
            eligibilityCriteriaModel.default_applicant_type,
          default_quota: eligibilityCriteriaModel.default_quota,
          cta: {
            label: eligibilityCriteriaModel.cta.label,
            action: eligibilityCriteriaModel.cta.action,
          },
        },
        entranceExams: {
          nationalLevel: nationalExams,
          stateLevel: stateExams,
          institutionalLevel: institutionalExams,
        },
      },
      placements: {
        id: normalizedPlacements.id,
        enabled: normalizedPlacements.enabled,
        ...parsedPlacementsAdvanced,
      },
      exam_policy: {
        ...normalizedExamPolicy,
        course_with_practical: {
          marksDistribution: {
            theory: Number(courseWithPracticalMarks.theory || 0),
            practical: Number(courseWithPracticalMarks.practical || 0),
            internal: Number(courseWithPracticalMarks.internal || 0),
            total: Number(courseWithPracticalMarks.total || 100),
          },
          isaTheory: courseWithPracticalIsaTheory,
          isaPractical: courseWithPracticalIsaPractical,
          esaTheory: courseWithPracticalEsaTheory,
          esaPractical: courseWithPracticalEsaPractical,
          summary: { title: "", description: "" },
          duration: courseWithPracticalDuration,
        },
        course_without_practical: {
          marksDistribution: {
            theory: Number(courseWithoutPracticalMarks.theory || 0),
            internal: Number(courseWithoutPracticalMarks.internal || 0),
            total: Number(courseWithoutPracticalMarks.total || 100),
          },
          internalAssessment: courseWithoutInternalAssessment,
          attendancePolicy: courseWithoutAttendancePolicy,
          externalExamPattern: courseWithoutExternalPattern,
          summary: { title: "", description: "" },
          duration: courseWithoutDuration,
        },
        standalone_practical: {
          marksDistribution: {
            internal: Number(standalonePracticalMarks.internal || 0),
            external: Number(standalonePracticalMarks.external || 0),
            total: Number(standalonePracticalMarks.total || 100),
          },
          internalAssessment: standaloneInternalAssessment,
          externalExamPattern: standaloneExternalPattern,
          summary: { title: "", description: "" },
          duration: standaloneDuration,
        },
        project_dissertation: {
          marksDistribution: {
            internal: Number(projectDissertationMarks.internal || 0),
            esa: Number(projectDissertationMarks.esa || 0),
            total: Number(projectDissertationMarks.total || 100),
          },
          internalEvaluation: projectInternalEvaluation,
          externalEvaluation: projectExternalEvaluation,
          summary: { title: "", description: "" },
        },
        ojt: {
          assessmentCriteria: ojtAssessmentCriteria,
          totalMarks: Number(ojtTotalMarks || 100),
        },
        internship: {
          evaluationComponents: internshipEvaluationComponents,
          totalMarks: Number(internshipTotalMarks || 100),
        },
        grading_scale: gradingScaleRows,
        academic_policies: academicPoliciesRows,
      },
      fees: {
        ...normalizedFees,
        tuition_fees: {
          download: {
            label: feesDownload.label,
            file_label: feesDownload.file_label,
            file_size: feesDownload.file_size,
            file_type: feesDownload.file_type,
            action: feesDownload.action,
          },
          filters: {
            quota_category: {
              label: feesQuotaFilterLabel,
              default: feesQuotaDefault,
              options: fromLineText(feesQuotaOptionsText),
            },
            gender: {
              label: feesGenderFilterLabel,
              default: feesGenderDefault,
              options: fromLineText(feesGenderOptionsText),
            },
          },
          fee_matrix: feesMatrixRows.map((row) => ({
            quota_category: row.quota_category,
            gender: row.gender,
            year_wise_fees: [
              {
                year: "1st Year",
                amount: row.year1.trim() ? safeNumber(row.year1) : null,
              },
              {
                year: "2nd Year",
                amount: row.year2.trim() ? safeNumber(row.year2) : null,
              },
              {
                year: "3rd Year",
                amount: row.year3.trim() ? safeNumber(row.year3) : null,
              },
              {
                year: "4th Year",
                amount: row.year4.trim() ? safeNumber(row.year4) : null,
              },
            ],
          })),
        },
        one_time_payable_fees: oneTimePayableFees.map((row) => ({
          id: row.id,
          label: row.label,
          amount: safeNumber(row.amount || "0"),
        })),
        additional_fees: additionalFees.map((row) => ({
          id: row.id,
          label: row.label,
          amount: safeNumber(row.amount || "0"),
        })),
        inclusions: {
          whats_included: fromLineText(inclusionIncludedText),
          whats_excluded: fromLineText(inclusionExcludedText),
        },
        deadlines_and_installments: installmentSchedule.map((row) => ({
          id: row.id,
          label: row.label,
          deadline: row.deadline,
          amount: safeNumber(row.amount || "0"),
        })),
        fees_summary: {
          full_course_fee: safeNumber(feesSummaryFullCourseFee || "0"),
          booking_amount: safeNumber(feesSummaryBookingAmount || "0"),
          currency: feesSummaryCurrency,
        },
        refund_policy: fromLineText(refundPolicyText),
      },
      financial_aid: {
        ...normalizedFinancialAid,
        meritScholarship: data.profileSections.financial_aid.meritScholarship,
        scholarshipCalculator: {
          enabled:
            data.profileSections.financial_aid.scholarshipCalculator.enabled,
          inputs: {
            portOfEntry: calculatorPortOfEntry,
            rankRanges: calculatorRankRanges,
          },
          termsAndConditions: calculatorTerms,
          summary: {
            maxScholarship: calculatorSummary.maxScholarship,
            netPayableFees: calculatorSummary.netPayableFees,
          },
        },
        financialConcessions: financialConcessions.map((item) => ({
          type: item.type,
          discount: item.discount,
          details: item.details,
          eligibilityCriteria: item.eligibilityCriteriaText
            .split(/\n|\|/)
            .map((line) => line.trim())
            .filter(Boolean),
          scholarshipAmount: item.scholarshipAmount,
          netPayable: item.netPayable,
        })),
        upfrontFeeConcession: upfrontFeeConcession,
      },
      review: {
        ...normalizedReview,
        overallRating: {
          rating: safeNumber(reviewOverallRating),
          totalReviews: safeNumber(reviewTotalReviews),
        },
        ratingDistribution: reviewDistributionRows,
        categoryRatings: reviewCategoryRows,
        reviews: reviewRows,
        pagination: {
          loadMoreEnabled: reviewLoadMoreEnabled,
          page: safeNumber(reviewPage),
          pageSize: safeNumber(reviewPageSize),
          hasMore: reviewHasMore,
        },
      },
      library: {
        ...normalizedLibrary,
        libraryInfo: {
          libraryName,
          areaSqFeet: safeNumber(libraryAreaSqFeet),
          totalSeats: safeNumber(libraryTotalSeats),
          totalVolumes: safeNumber(libraryTotalVolumes),
          researchCabins: safeNumber(libraryResearchCabins),
        },
        availableResources: normalizedLibraryResourceRows,
        libraryHours: normalizedLibraryHourRows,
        facilities: normalizedLibraryFacilityRows,
      },
      student_code_of_conduct: {
        ...normalizedStudentCodeOfConduct,
        title: conductTitle,
        disciplineRules: conductRuleRows,
      },
    };

    updateProfile(
      {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        state: data.state,
        district: data.district,
        pinCode: data.pinCode,
        logoUrl: data.logoUrl ? data.logoUrl : null,
        coverImageUrl: data.coverImageUrl ? data.coverImageUrl : null,
        requestedGroupCode: data.requestedGroupCode,
        profileSections: profileSectionsPayload,
      },
      {
        onSuccess: () => {
          toast.success("Profile saved successfully");
          if (options?.redirectToCampuses) {
            router.push(getPortalPath(collegeSlug, "/setup/campuses"));
          }
        },
      },
    );
  };

  const onSubmit = (data: ProfileFormData) => {
    submitProfile(data);
  };

  const onSubmitAndContinue = (data: ProfileFormData) => {
    submitProfile(data, { redirectToCampuses: true });
  };

  const onInvalidSubmit = (formErrors: FieldErrors<ProfileFormData>) => {
    const findFirstErrorPath = (
      value: unknown,
      trail: string[] = [],
    ): string[] | null => {
      if (!value || typeof value !== "object") {
        return null;
      }

      const asRecord = value as Record<string, unknown>;
      if (typeof asRecord.message === "string" && asRecord.message.length > 0) {
        return trail;
      }

      for (const key of Object.keys(asRecord)) {
        const nextPath = findFirstErrorPath(asRecord[key], [...trail, key]);
        if (nextPath) {
          return nextPath;
        }
      }

      return null;
    };

    const firstErrorPath = findFirstErrorPath(formErrors);
    const sectionTabId =
      firstErrorPath?.[0] === "profileSections" ? firstErrorPath[1] : "basic";

    if (
      sectionTabId &&
      ONBOARDING_TABS.some((tab) => tab.id === sectionTabId)
    ) {
      setActiveTab(sectionTabId as (typeof ONBOARDING_TABS)[number]["id"]);
    }

    if (firstErrorPath?.length) {
      toast.error(`Please fix: ${firstErrorPath.join(".")}`);
      return;
    }

    toast.error("Please fix the errors before saving");
  };

  const parsePipeRowsWithColumns = (value: string, columns: number) =>
    parsePipeRows(value).map((row) =>
      Array.from({ length: columns }, (_, index) => row[index] || ""),
    );

  const serializePipeRows = (
    rows: string[][],
    options?: { keepEmptyRows?: boolean },
  ) => {
    const normalizedRows = rows.map((row) => row.map((cell) => cell.trim()));
    const filteredRows = options?.keepEmptyRows
      ? normalizedRows
      : normalizedRows.filter((row) => row.some((cell) => cell.length > 0));
    return filteredRows.map((row) => row.join("|")).join("\n");
  };

  const updatePipeCell = (
    value: string,
    setValueFn: (next: string) => void,
    columns: number,
    rowIndex: number,
    columnIndex: number,
    nextValue: string,
  ) => {
    const rows = parsePipeRowsWithColumns(value, columns);
    while (rows.length <= rowIndex) {
      rows.push(Array.from({ length: columns }, () => ""));
    }
    rows[rowIndex][columnIndex] = nextValue;
    setValueFn(serializePipeRows(rows, { keepEmptyRows: true }));
  };

  const addPipeRow = (
    value: string,
    setValueFn: (next: string) => void,
    columns: number,
  ) => {
    const rows = parsePipeRowsWithColumns(value, columns);
    rows.push(Array.from({ length: columns }, () => ""));
    setValueFn(serializePipeRows(rows, { keepEmptyRows: true }));
  };

  const removePipeRow = (
    value: string,
    setValueFn: (next: string) => void,
    columns: number,
    rowIndex: number,
  ) => {
    const rows = parsePipeRowsWithColumns(value, columns).filter(
      (_, index) => index !== rowIndex,
    );
    setValueFn(serializePipeRows(rows));
  };

  const parseEditableFaqRows = (value: string) =>
    parsePipeRowsWithColumns(value, 2);

  const addFaqRow = () => {
    const rows = parseEditableFaqRows(faqsText);
    rows.push(["", ""]);
    setFaqsText(serializePipeRows(rows, { keepEmptyRows: true }));
  };

  const updateFaqRow = (
    rowIndex: number,
    columnIndex: number,
    nextValue: string,
  ) => {
    const rows = parseEditableFaqRows(faqsText);
    while (rows.length <= rowIndex) {
      rows.push(["", ""]);
    }
    while (rows[rowIndex].length < 2) {
      rows[rowIndex].push("");
    }
    rows[rowIndex][columnIndex] = nextValue;
    setFaqsText(serializePipeRows(rows, { keepEmptyRows: true }));
  };

  const removeFaqRow = (rowIndex: number) => {
    const rows = parseEditableFaqRows(faqsText).filter(
      (_, index) => index !== rowIndex,
    );
    setFaqsText(rows.length > 0 ? serializePipeRows(rows) : "");
  };

  const parseHigherEducationHeadingRows = (value: string) =>
    parsePipeRowsWithColumns(value, 2).map(([title, description]) => ({
      title,
      descriptions: (description || "").split(";").map((item) => item.trim()),
    }));

  const serializeHigherEducationHeadingRows = (
    rows: { title: string; descriptions: string[] }[],
  ) =>
    rows
      .map((row) => [row.title.trim(), row.descriptions.join(";")].join("|"))
      .join("\n");

  const addHigherEducationHeading = () => {
    const rows = parseHigherEducationHeadingRows(higherEducationHeadingsText);
    rows.push({ title: "", descriptions: [] });
    setHigherEducationHeadingsText(serializeHigherEducationHeadingRows(rows));
  };

  const updateHigherEducationHeadingTitle = (
    rowIndex: number,
    nextTitle: string,
  ) => {
    const rows = parseHigherEducationHeadingRows(higherEducationHeadingsText);
    while (rows.length <= rowIndex) {
      rows.push({ title: "", descriptions: [] });
    }
    rows[rowIndex].title = nextTitle;
    setHigherEducationHeadingsText(serializeHigherEducationHeadingRows(rows));
  };

  const removeHigherEducationHeading = (rowIndex: number) => {
    const rows = parseHigherEducationHeadingRows(
      higherEducationHeadingsText,
    ).filter((_, index) => index !== rowIndex);
    setHigherEducationHeadingsText(
      rows.length > 0 ? serializeHigherEducationHeadingRows(rows) : "",
    );
  };

  const addHigherEducationDescription = (rowIndex: number) => {
    const rows = parseHigherEducationHeadingRows(higherEducationHeadingsText);
    while (rows.length <= rowIndex) {
      rows.push({ title: "", descriptions: [] });
    }
    rows[rowIndex].descriptions.push("");
    setHigherEducationHeadingsText(serializeHigherEducationHeadingRows(rows));
  };

  const updateHigherEducationDescription = (
    rowIndex: number,
    descriptionIndex: number,
    nextValue: string,
  ) => {
    const rows = parseHigherEducationHeadingRows(higherEducationHeadingsText);
    while (rows.length <= rowIndex) {
      rows.push({ title: "", descriptions: [] });
    }
    while (rows[rowIndex].descriptions.length <= descriptionIndex) {
      rows[rowIndex].descriptions.push("");
    }
    rows[rowIndex].descriptions[descriptionIndex] = nextValue;
    setHigherEducationHeadingsText(serializeHigherEducationHeadingRows(rows));
  };

  const removeHigherEducationDescription = (
    rowIndex: number,
    descriptionIndex: number,
  ) => {
    const rows = parseHigherEducationHeadingRows(higherEducationHeadingsText);
    if (!rows[rowIndex]) {
      return;
    }
    rows[rowIndex].descriptions = rows[rowIndex].descriptions.filter(
      (_, index) => index !== descriptionIndex,
    );
    setHigherEducationHeadingsText(serializeHigherEducationHeadingRows(rows));
  };

  const parseEditableLineRows = (value: string) =>
    value.length > 0 ? value.split("\n") : [];

  const addLineRow = (value: string, setValueFn: (next: string) => void) => {
    const rows = parseEditableLineRows(value);
    rows.push("");
    setValueFn(rows.join("\n"));
  };

  const updateLineRow = (
    value: string,
    setValueFn: (next: string) => void,
    rowIndex: number,
    nextValue: string,
  ) => {
    const rows = parseEditableLineRows(value);
    while (rows.length <= rowIndex) {
      rows.push("");
    }
    rows[rowIndex] = nextValue;
    setValueFn(rows.join("\n"));
  };

  const removeLineRow = (
    value: string,
    setValueFn: (next: string) => void,
    rowIndex: number,
  ) => {
    const rows = parseEditableLineRows(value).filter(
      (_, index) => index !== rowIndex,
    );
    setValueFn(rows.join("\n"));
  };

  const parseBonusCertificationRows = (value: string) =>
    parsePipeRowsWithColumns(value, 4).map(
      ([name, note, certificateDetailsAvailable, detailsPage]) => ({
        name,
        note,
        certificateDetailsAvailable,
        detailsPage,
      }),
    );

  const addBonusCertificationRow = () => {
    const rows = parseBonusCertificationRows(bonusCertificationText);
    rows.push({
      name: "",
      note: "",
      certificateDetailsAvailable: "false",
      detailsPage: "",
    });
    setBonusCertificationText(
      rows
        .map((row) =>
          [
            row.name,
            row.note,
            row.certificateDetailsAvailable,
            row.detailsPage,
          ].join("|"),
        )
        .join("\n"),
    );
  };

  type FeaturedProgressionRow = { year: string; milestone: string };
  type FeaturedAlumniRow = {
    name: string;
    designation: string;
    progressions: FeaturedProgressionRow[];
  };

  const parseFeaturedAlumniRows = (value: string): FeaturedAlumniRow[] =>
    parsePipeRowsWithColumns(value, 3).map(
      ([name, designation, progression]) => ({
        name,
        designation,
        progressions:
          progression.length > 0
            ? progression.split(";").map((entry) => {
                const [year = "", ...milestoneParts] = entry.split(":");
                return {
                  year: year.trim(),
                  milestone: milestoneParts.join(":").trim(),
                };
              })
            : [],
      }),
    );

  const serializeFeaturedAlumniRows = (rows: FeaturedAlumniRow[]) =>
    rows
      .map((row) => {
        const progression = row.progressions
          .map((entry) => `${entry.year}:${entry.milestone}`)
          .join(";");
        return [row.name, row.designation, progression].join("|");
      })
      .join("\n");

  const addFeaturedAlumniRow = () => {
    const rows = parseFeaturedAlumniRows(featuredAlumniText);
    rows.push({
      name: "",
      designation: "",
      progressions: [{ year: "", milestone: "" }],
    });
    setFeaturedAlumniText(serializeFeaturedAlumniRows(rows));
  };

  const updateFeaturedAlumniField = (
    rowIndex: number,
    field: "name" | "designation",
    nextValue: string,
  ) => {
    const rows = parseFeaturedAlumniRows(featuredAlumniText);
    while (rows.length <= rowIndex) {
      rows.push({ name: "", designation: "", progressions: [] });
    }
    rows[rowIndex][field] = nextValue;
    setFeaturedAlumniText(serializeFeaturedAlumniRows(rows));
  };

  const addFeaturedAlumniProgression = (rowIndex: number) => {
    const rows = parseFeaturedAlumniRows(featuredAlumniText);
    while (rows.length <= rowIndex) {
      rows.push({ name: "", designation: "", progressions: [] });
    }
    rows[rowIndex].progressions.push({ year: "", milestone: "" });
    setFeaturedAlumniText(serializeFeaturedAlumniRows(rows));
  };

  const updateFeaturedAlumniProgression = (
    rowIndex: number,
    progressionIndex: number,
    field: "year" | "milestone",
    nextValue: string,
  ) => {
    const rows = parseFeaturedAlumniRows(featuredAlumniText);
    while (rows.length <= rowIndex) {
      rows.push({ name: "", designation: "", progressions: [] });
    }
    while (rows[rowIndex].progressions.length <= progressionIndex) {
      rows[rowIndex].progressions.push({ year: "", milestone: "" });
    }
    rows[rowIndex].progressions[progressionIndex][field] = nextValue;
    setFeaturedAlumniText(serializeFeaturedAlumniRows(rows));
  };

  const removeFeaturedAlumniProgression = (
    rowIndex: number,
    progressionIndex: number,
  ) => {
    const rows = parseFeaturedAlumniRows(featuredAlumniText);
    if (!rows[rowIndex]) {
      return;
    }
    rows[rowIndex].progressions = rows[rowIndex].progressions.filter(
      (_, index) => index !== progressionIndex,
    );
    setFeaturedAlumniText(serializeFeaturedAlumniRows(rows));
  };

  const removeFeaturedAlumniRow = (rowIndex: number) => {
    const rows = parseFeaturedAlumniRows(featuredAlumniText).filter(
      (_, index) => index !== rowIndex,
    );
    setFeaturedAlumniText(serializeFeaturedAlumniRows(rows));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sleek Custom Tabs Switcher with glassmorphism accenting */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {ONBOARDING_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        className="space-y-6"
      >
        {/* ==================== TAB 1: BASIC INFO ==================== */}
        {activeTab === "basic" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core identifiers and administrative contacts of your college.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">College Code</Label>
                  <Input
                    id="code"
                    placeholder="AMITY-N"
                    aria-invalid={!!errors.code}
                    {...register("code")}
                  />
                  {errors.code && (
                    <p className="text-xs text-destructive">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    aria-invalid={!!errors.address}
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    aria-invalid={!!errors.city}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    aria-invalid={!!errors.district}
                    {...register("district")}
                  />
                  {errors.district && (
                    <p className="text-xs text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    aria-invalid={!!errors.state}
                    {...register("state")}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    aria-invalid={!!errors.pinCode}
                    {...register("pinCode")}
                  />
                  {errors.pinCode && (
                    <p className="text-xs text-destructive">
                      {errors.pinCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">College Logo URL</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://example.com/logo.png"
                    aria-invalid={!!errors.logoUrl}
                    {...register("logoUrl")}
                  />
                  {errors.logoUrl && (
                    <p className="text-xs text-destructive">
                      {errors.logoUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                  <Input
                    id="coverImageUrl"
                    placeholder="https://example.com/cover.jpg"
                    aria-invalid={!!errors.coverImageUrl}
                    {...register("coverImageUrl")}
                  />
                  {errors.coverImageUrl && (
                    <p className="text-xs text-destructive">
                      {errors.coverImageUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 pt-4 border-t border-border/40">
                  <Label
                    htmlFor="requestedGroupCode"
                    className="flex items-center gap-2"
                  >
                    <Building className="h-4 w-4 text-primary" />
                    Institution Group Join Code (Optional)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    If you are joining an existing group of colleges, enter the
                    Group Code here. You will automatically be added once you
                    Submit and Go Live!
                  </p>
                  <Input
                    id="requestedGroupCode"
                    placeholder="e.g. IGC-ABCD-1234"
                    aria-invalid={!!errors.requestedGroupCode}
                    {...register("requestedGroupCode")}
                  />
                  {errors.requestedGroupCode && (
                    <p className="text-xs text-destructive">
                      {errors.requestedGroupCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/40">
                  <Label className="text-sm font-semibold">
                    Public Profile Tabs Visibility
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle each section on/off for public display. Every section
                    has a stable section id set automatically.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {PROFILE_SECTION_TABS.map((section) => (
                      <div
                        key={section.key}
                        className="flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-3 py-2"
                      >
                        <Label
                          htmlFor={`section-enabled-${section.key}`}
                          className="text-sm"
                        >
                          {section.label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="hidden"
                            {...register(
                              `profileSections.${section.key}.id` as const,
                            )}
                          />
                          <input
                            type="checkbox"
                            id={`section-enabled-${section.key}`}
                            className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                            {...register(
                              `profileSections.${section.key}.enabled` as const,
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB: COLLEGE OVERVIEW ==================== */}
        {activeTab === "college_overview" && (
          <div className="space-y-6">
            {/* Dynamic statistics and Read-only metrics banner */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Courses
                  </p>
                  <p className="text-3xl font-extrabold mt-1 text-blue-500">
                    {profile?.totalCourses ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Automatically computed from academic database
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-green-500/5 to-teal-500/5">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Institution Type
                  </p>
                  <p className="text-lg font-bold mt-2 text-green-600 truncate">
                    {profile?.instituteType || "State University"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Fetched from linked University details
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Linked Ambassadors
                  </p>
                  <p className="text-3xl font-extrabold mt-1 text-purple-500">
                    {profile?.campusAmbassadors?.length ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Active student/teacher representatives
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>College Overview</CardTitle>
                <CardDescription>
                  Tell students about campus life, amenities, and location
                  guides.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <input
                    type="hidden"
                    {...register("profileSections.college_overview.id")}
                  />
                  <input
                    type="checkbox"
                    id="overview-enabled"
                    className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                    {...register("profileSections.college_overview.enabled")}
                  />
                  <Label htmlFor="overview-enabled">
                    Show this section on public profile
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overview-desc">
                    Institutional Description
                  </Label>
                  <Textarea
                    id="overview-desc"
                    placeholder="Provide a compelling story about your university, history, and mission..."
                    className="min-h-[120px]"
                    {...register(
                      "profileSections.college_overview.description",
                    )}
                  />
                </div>

                <div className="border-t pt-6 border-border/40 space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> Accreditation &
                    Affiliations
                  </h3>

                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" /> Rankings
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOverviewRankings([
                          ...overviewRankings,
                          {
                            body: "",
                            rank: "",
                            logo: "",
                            recognitions: "",
                          },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Ranking
                    </Button>
                  </div>
                  {overviewRankings.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 md:grid-cols-4 items-center"
                    >
                      <Input
                        placeholder="Ranking body"
                        value={item.body}
                        onChange={(e) => {
                          const updated = [...overviewRankings];
                          updated[idx].body = e.target.value;
                          setOverviewRankings(updated);
                        }}
                      />
                      <Input
                        placeholder="Rank"
                        value={item.rank}
                        onChange={(e) => {
                          const updated = [...overviewRankings];
                          updated[idx].rank = e.target.value;
                          setOverviewRankings(updated);
                        }}
                      />
                      <Input
                        placeholder="Logo key"
                        value={item.logo}
                        onChange={(e) => {
                          const updated = [...overviewRankings];
                          updated[idx].logo = e.target.value;
                          setOverviewRankings(updated);
                        }}
                      />
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Recognition text"
                          value={item.recognitions}
                          onChange={(e) => {
                            const updated = [...overviewRankings];
                            updated[idx].recognitions = e.target.value;
                            setOverviewRankings(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setOverviewRankings(
                              overviewRankings.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Institution parameters */}
                <div className="grid gap-6 md:grid-cols-3 border-t pt-6 border-border/40">
                  <div className="space-y-2">
                    <Label htmlFor="details-estd">Established Year</Label>
                    <Input
                      id="details-estd"
                      placeholder="2005"
                      {...register(
                        "profileSections.college_overview.instution_details.estd",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-gender">Admission Target</Label>
                    <select
                      id="details-gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register(
                        "profileSections.college_overview.instution_details.gender",
                      )}
                    >
                      <option value="Co-Ed">Co-Educational</option>
                      <option value="Girls">Girls Only</option>
                      <option value="Boys">Boys Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-avg-stud">
                      Average Yearly Intake
                    </Label>
                    <Input
                      id="details-avg-stud"
                      placeholder="1500+"
                      {...register(
                        "profileSections.college_overview.instution_details.average_student_count",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-campus-size">
                      Campus Size (Acres)
                    </Label>
                    <Input
                      id="details-campus-size"
                      placeholder="120 Acres"
                      {...register(
                        "profileSections.college_overview.instution_details.campus_size",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-outside">
                      % of Outside State Students
                    </Label>
                    <Input
                      id="details-outside"
                      placeholder="35%"
                      {...register(
                        "profileSections.college_overview.instution_details.Student_from_outside",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-map">Google Maps Embed Link</Label>
                    <Input
                      id="details-map"
                      placeholder="https://google.com/maps/..."
                      {...register(
                        "profileSections.college_overview.location.map_link",
                      )}
                    />
                  </div>
                </div>

                {/* Predefined & Custom Amenities tags editor */}
                <div className="border-t pt-6 border-border/40 space-y-3">
                  <Label>Interactive Campus Amenities</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_AMENITIES.map((item) => {
                      const isSelected = amenities.includes(item);
                      return (
                        <Badge
                          key={item}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1 text-xs select-none transition-all duration-200"
                          onClick={() => toggleAmenity(item)}
                        >
                          {isSelected ? "✓ " : "+ "} {item}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <Input
                      placeholder="Add custom amenity..."
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addCustomAmenity}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {amenities
                      .filter((a) => !PREDEFINED_AMENITIES.includes(a))
                      .map((custom) => (
                        <Badge
                          key={custom}
                          variant="secondary"
                          className="pl-3 pr-2 py-1 text-xs flex items-center gap-1"
                        >
                          {custom}
                          <Trash2
                            className="h-3 w-3 text-destructive cursor-pointer hover:scale-110"
                            onClick={() => toggleAmenity(custom)}
                          />
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Nearby access */}
                <div className="border-t pt-6 border-border/40 space-y-5">
                  <Label className="text-sm font-semibold">Nearby Access</Label>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" /> Transit
                        Accessibility
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setTransitAccess([
                            ...transitAccess,
                            { type: "Metro", name: "", distance: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Transit
                      </Button>
                    </div>
                    {transitAccess.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          value={row.type}
                          onChange={(e) => {
                            const updated = [...transitAccess];
                            updated[idx].type = e.target.value;
                            setTransitAccess(updated);
                          }}
                        >
                          <option value="Metro">Metro</option>
                          <option value="Bus Station">Bus</option>
                          <option value="Railway">Railway</option>
                          <option value="Airport">Airport</option>
                        </select>
                        <Input
                          placeholder="Station Name"
                          className="h-8 text-xs"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...transitAccess];
                            updated[idx].name = e.target.value;
                            setTransitAccess(updated);
                          }}
                        />
                        <Input
                          placeholder="Distance (e.g. 2.5 km)"
                          className="h-8 text-xs w-28"
                          value={row.distance}
                          onChange={(e) => {
                            const updated = [...transitAccess];
                            updated[idx].distance = e.target.value;
                            setTransitAccess(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setTransitAccess(
                              transitAccess.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" /> Nearby
                        Essentials
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEssentialsAccess([
                            ...essentialsAccess,
                            { type: "Hospital", name: "", distance: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Essential
                      </Button>
                    </div>
                    {essentialsAccess.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          value={row.type}
                          onChange={(e) => {
                            const updated = [...essentialsAccess];
                            updated[idx].type = e.target.value;
                            setEssentialsAccess(updated);
                          }}
                        >
                          <option value="Hospital">Hospital</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Mall">Mall/Market</option>
                          <option value="ATM">ATM / Bank</option>
                        </select>
                        <Input
                          placeholder="Name"
                          className="h-8 text-xs"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...essentialsAccess];
                            updated[idx].name = e.target.value;
                            setEssentialsAccess(updated);
                          }}
                        />
                        <Input
                          placeholder="Distance (e.g. 1.2 km)"
                          className="h-8 text-xs w-28"
                          value={row.distance}
                          onChange={(e) => {
                            const updated = [...essentialsAccess];
                            updated[idx].distance = e.target.value;
                            setEssentialsAccess(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setEssentialsAccess(
                              essentialsAccess.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-500" /> Utilities
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setUtilitiesAccess([
                            ...utilitiesAccess,
                            { type: "ATM", name: "", distance: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Utility
                      </Button>
                    </div>
                    {utilitiesAccess.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Type"
                          className="h-8 text-xs"
                          value={row.type}
                          onChange={(e) => {
                            const updated = [...utilitiesAccess];
                            updated[idx].type = e.target.value;
                            setUtilitiesAccess(updated);
                          }}
                        />
                        <Input
                          placeholder="Name"
                          className="h-8 text-xs"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...utilitiesAccess];
                            updated[idx].name = e.target.value;
                            setUtilitiesAccess(updated);
                          }}
                        />
                        <Input
                          placeholder="Distance"
                          className="h-8 text-xs w-28"
                          value={row.distance}
                          onChange={(e) => {
                            const updated = [...utilitiesAccess];
                            updated[idx].distance = e.target.value;
                            setUtilitiesAccess(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setUtilitiesAccess(
                              utilitiesAccess.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-emerald-500" /> Inside
                      Campus Facilities
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setInsideCampusFacilities([
                          ...insideCampusFacilities,
                          { name: "", description: "", image: "" },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Facility
                    </Button>
                  </div>
                  {insideCampusFacilities.map((facility, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 md:grid-cols-3 items-center"
                    >
                      <Input
                        placeholder="Facility name"
                        value={facility.name}
                        onChange={(e) => {
                          const updated = [...insideCampusFacilities];
                          updated[idx].name = e.target.value;
                          setInsideCampusFacilities(updated);
                        }}
                      />
                      <Input
                        placeholder="Description"
                        value={facility.description}
                        onChange={(e) => {
                          const updated = [...insideCampusFacilities];
                          updated[idx].description = e.target.value;
                          setInsideCampusFacilities(updated);
                        }}
                      />
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Image URL"
                          value={facility.image}
                          onChange={(e) => {
                            const updated = [...insideCampusFacilities];
                            updated[idx].image = e.target.value;
                            setInsideCampusFacilities(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setInsideCampusFacilities(
                              insideCampusFacilities.filter(
                                (_, i) => i !== idx,
                              ),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Campus Ambassadors listing from database */}
                {profile?.campusAmbassadors &&
                  profile.campusAmbassadors.length > 0 && (
                    <div className="border-t pt-6 border-border/40 space-y-4">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" /> Campus
                        Ambassadors (Active representatives from DB)
                      </Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {profile.campusAmbassadors.map((amb: any) => (
                          <div
                            key={amb.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20"
                          >
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-600">
                              {amb.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {amb.fullName}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {amb.email}
                              </p>
                              {amb.phoneNumber && (
                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                  {amb.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Video reels */}
                <div className="border-t pt-6 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-red-500" /> Campus Short
                      Video Reels
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCampusReels([
                          ...campusReels,
                          { title: "", link: "" },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Reel
                    </Button>
                  </div>
                  {campusReels.map((reel, idx) => (
                    <div
                      key={idx}
                      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center"
                    >
                      <Input
                        placeholder="Reel Title (e.g. Campus tour)"
                        className="h-9 text-xs min-w-0"
                        value={reel.title}
                        onChange={(e) => {
                          const updated = [...campusReels];
                          updated[idx].title = e.target.value;
                          setCampusReels(updated);
                        }}
                      />
                      <Input
                        placeholder="Video Link (e.g. https://youtube.com/shorts/...)"
                        className="h-9 text-xs min-w-0"
                        value={reel.link}
                        onChange={(e) => {
                          const updated = [...campusReels];
                          updated[idx].link = e.target.value;
                          setCampusReels(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105"
                        onClick={() =>
                          setCampusReels(
                            campusReels.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-500" /> Connect With
                      Us Links
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConnectLinks([
                          ...connectLinks,
                          { platform: "", url: "" },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
                    </Button>
                  </div>
                  {connectLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Platform (Facebook, LinkedIn...)"
                        value={link.platform}
                        onChange={(e) => {
                          const updated = [...connectLinks];
                          updated[idx].platform = e.target.value;
                          setConnectLinks(updated);
                        }}
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...connectLinks];
                          updated[idx].url = e.target.value;
                          setConnectLinks(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105"
                        onClick={() =>
                          setConnectLinks(
                            connectLinks.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "faculty" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Faculty</CardTitle>
              <CardDescription>
                Create, update, and remove faculty members for the public
                college profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.faculty.id")}
                />
                <input
                  type="checkbox"
                  id="faculty-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.faculty.enabled")}
                />
                <Label htmlFor="faculty-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty-summary">Section Summary</Label>
                <Textarea
                  id="faculty-summary"
                  placeholder="Introduce the teaching team and academic leadership."
                  {...register("profileSections.faculty.summary")}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-6">
                <div>
                  <Label className="text-sm font-semibold">
                    Faculty Members
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required fields: name, photo, role, and department.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendFaculty({
                      name: "",
                      photo: "",
                      role: "",
                      department: "",
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add Faculty
                </Button>
              </div>

              <div className="space-y-4">
                {facultyFields.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                    No faculty members added yet.
                  </div>
                ) : (
                  facultyFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border/50 bg-background/40 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <Badge variant="outline">Faculty #{index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeFaculty(index)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Faculty name"
                          {...register(
                            `profileSections.faculty.members.${index}.name` as const,
                          )}
                        />
                        <Input
                          placeholder="Photo URL"
                          {...register(
                            `profileSections.faculty.members.${index}.photo` as const,
                          )}
                        />
                        <Input
                          placeholder="Role"
                          {...register(
                            `profileSections.faculty.members.${index}.role` as const,
                          )}
                        />
                        <Input
                          placeholder="Department"
                          {...register(
                            `profileSections.faculty.members.${index}.department` as const,
                          )}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "clubs_associations" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Clubs & Associations</CardTitle>
              <CardDescription>
                Manage club and association listings with service details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.clubs_associations.id")}
                />
                <input
                  type="checkbox"
                  id="clubs-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.clubs_associations.enabled")}
                />
                <Label htmlFor="clubs-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clubs-summary">Section Summary</Label>
                <Textarea
                  id="clubs-summary"
                  placeholder="Explain how students engage through clubs and associations."
                  {...register("profileSections.clubs_associations.summary")}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-6">
                <div>
                  <Label className="text-sm font-semibold">Club Entries</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required fields: club name, service, and service
                    description.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendClub({
                      clubName: "",
                      service: "",
                      serviceDescription: "",
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add Club
                </Button>
              </div>

              <div className="space-y-4">
                {clubFields.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                    No clubs or associations added yet.
                  </div>
                ) : (
                  clubFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border/50 bg-background/40 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <Badge variant="outline">Club #{index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeClub(index)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Club name"
                          {...register(
                            `profileSections.clubs_associations.items.${index}.clubName` as const,
                          )}
                        />
                        <Input
                          placeholder="Service"
                          {...register(
                            `profileSections.clubs_associations.items.${index}.service` as const,
                          )}
                        />
                      </div>
                      <Textarea
                        className="mt-4"
                        placeholder="Service description"
                        {...register(
                          `profileSections.clubs_associations.items.${index}.serviceDescription` as const,
                        )}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "happenings" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Happenings</CardTitle>
              <CardDescription>
                Manage upcoming and recent happenings with media, type, date,
                and description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.happenings.id")}
                />
                <input
                  type="checkbox"
                  id="happenings-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.happenings.enabled")}
                />
                <Label htmlFor="happenings-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="happenings-summary">Section Summary</Label>
                <Textarea
                  id="happenings-summary"
                  placeholder="Highlight the most important events and activities on campus."
                  {...register("profileSections.happenings.summary")}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-6">
                <div>
                  <Label className="text-sm font-semibold">
                    Happening Entries
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required fields: photo, type, title, date, and description.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendHappening({
                      photo: "",
                      type: "",
                      title: "",
                      date: "",
                      description: "",
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add Happening
                </Button>
              </div>

              <div className="space-y-4">
                {happeningFields.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                    No happenings added yet.
                  </div>
                ) : (
                  happeningFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border/50 bg-background/40 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <Badge variant="outline">Happening #{index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeHappening(index)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Photo URL"
                          {...register(
                            `profileSections.happenings.items.${index}.photo` as const,
                          )}
                        />
                        <Input
                          placeholder="Type"
                          {...register(
                            `profileSections.happenings.items.${index}.type` as const,
                          )}
                        />
                        <Input
                          placeholder="Title"
                          {...register(
                            `profileSections.happenings.items.${index}.title` as const,
                          )}
                        />
                        <Input
                          type="date"
                          {...register(
                            `profileSections.happenings.items.${index}.date` as const,
                          )}
                        />
                      </div>
                      <Textarea
                        className="mt-4"
                        placeholder="Description"
                        {...register(
                          `profileSections.happenings.items.${index}.description` as const,
                        )}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "alliance" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Alliance</CardTitle>
              <CardDescription>
                Search colleges, create alliance records, and manage the detail
                view content for each alliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.alliance.id")}
                />
                <input
                  type="checkbox"
                  id="alliance-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.alliance.enabled")}
                />
                <Label htmlFor="alliance-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alliance-summary">Section Summary</Label>
                <Textarea
                  id="alliance-summary"
                  placeholder="Summarize your institutional alliances and collaboration strategy."
                  {...register("profileSections.alliance.summary")}
                />
              </div>

              <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <Label
                    htmlFor="alliance-search"
                    className="text-sm font-semibold"
                  >
                    Search Existing Colleges
                  </Label>
                </div>
                <Input
                  id="alliance-search"
                  placeholder="Search by college name, slug, or code"
                  value={allianceSearchQuery}
                  onChange={(e) => setAllianceSearchQuery(e.target.value)}
                />
                {allianceSearchQuery.trim().length > 0 && (
                  <div className="mt-3 space-y-2">
                    {filteredAllianceColleges.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No colleges matched the search. You can still add a
                        manual alliance entry below.
                      </p>
                    ) : (
                      filteredAllianceColleges.map((college) => (
                        <button
                          key={college.id}
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-left hover:bg-muted/50"
                          onClick={() => addAllianceFromCollege(college)}
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {college.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {college.slug}{" "}
                              {college.code ? `• ${college.code}` : ""}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-primary">
                            Use
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-6">
                <div>
                  <Label className="text-sm font-semibold">
                    Alliance Entries
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    CRUD fields: title, type, description. Detail view fields:
                    image, logo, about, collaboration, key focus, legal,
                    documents, and activities.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextIndex = allianceFields.length;
                    appendAlliance({
                      sourceCollegeId: "",
                      sourceCollegeSlug: "",
                      sourceCollegeName: "",
                      image: "",
                      type: "",
                      logo: "",
                      title: "",
                      description: "",
                      about: "",
                      collaboration: "",
                      keyFocus: "",
                      legal: "",
                      documents: [],
                      allianceActivities: [],
                    });
                    setSelectedAllianceIndex(nextIndex);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Alliance
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-3">
                  {allianceFields.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                      No alliance entries added yet.
                    </div>
                  ) : (
                    allianceFields.map((field, index) => {
                      const item = allianceItems?.[index];
                      const isSelected = selectedAllianceIndex === index;

                      return (
                        <div
                          key={field.id}
                          role="button"
                          tabIndex={0}
                          className={`w-full rounded-xl border p-4 text-left transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border/50 bg-background/40 hover:bg-muted/40"
                          }`}
                          onClick={() => setSelectedAllianceIndex(index)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedAllianceIndex(index);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">
                                {item?.title ||
                                  item?.sourceCollegeName ||
                                  `Alliance #${index + 1}`}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item?.type || "No type set"}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeAlliance(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div>
                  {selectedAllianceIndex === null ||
                  !allianceItems?.[selectedAllianceIndex] ? (
                    <div className="rounded-xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground">
                      Select an alliance entry to edit its detail view.
                    </div>
                  ) : (
                    <div className="space-y-6 rounded-xl border border-border/50 bg-background/40 p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Title"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.title` as const,
                          )}
                        />
                        <Input
                          placeholder="Type"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.type` as const,
                          )}
                        />
                        <Input
                          placeholder="Description"
                          className="md:col-span-2"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.description` as const,
                          )}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Image URL"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.image` as const,
                          )}
                        />
                        <Input
                          placeholder="Logo URL"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.logo` as const,
                          )}
                        />
                        <Input
                          placeholder="Source college name"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.sourceCollegeName` as const,
                          )}
                        />
                        <Input
                          placeholder="Source college slug"
                          {...register(
                            `profileSections.alliance.items.${selectedAllianceIndex}.sourceCollegeSlug` as const,
                          )}
                        />
                      </div>

                      <Textarea
                        placeholder="About"
                        {...register(
                          `profileSections.alliance.items.${selectedAllianceIndex}.about` as const,
                        )}
                      />
                      <Textarea
                        placeholder="Collaboration"
                        {...register(
                          `profileSections.alliance.items.${selectedAllianceIndex}.collaboration` as const,
                        )}
                      />
                      <Textarea
                        placeholder="Key focus"
                        {...register(
                          `profileSections.alliance.items.${selectedAllianceIndex}.keyFocus` as const,
                        )}
                      />
                      <Textarea
                        placeholder="Legal"
                        {...register(
                          `profileSections.alliance.items.${selectedAllianceIndex}.legal` as const,
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Documents</Label>
                          <Textarea
                            placeholder="One document per line"
                            value={
                              allianceItems?.[
                                selectedAllianceIndex
                              ]?.documents?.join("\n") || ""
                            }
                            onChange={(e) =>
                              setAllianceTextList(
                                selectedAllianceIndex,
                                "documents",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alliance Activities</Label>
                          <Textarea
                            placeholder="One activity per line"
                            value={
                              allianceItems?.[
                                selectedAllianceIndex
                              ]?.allianceActivities?.join("\n") || ""
                            }
                            onChange={(e) =>
                              setAllianceTextList(
                                selectedAllianceIndex,
                                "allianceActivities",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "institutions_across_world" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Institutions Across World</CardTitle>
              <CardDescription>
                Linked colleges under your institution group code are listed
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.institutions_across_world.id")}
                />
                <input
                  type="checkbox"
                  id="institutions-across-world-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register(
                    "profileSections.institutions_across_world.enabled",
                  )}
                />
                <Label htmlFor="institutions-across-world-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutions-across-world-summary">
                  Section Summary
                </Label>
                <Textarea
                  id="institutions-across-world-summary"
                  placeholder="Highlight your global institution network and collaborations."
                  {...register(
                    "profileSections.institutions_across_world.summary",
                  )}
                />
              </div>

              <div className="space-y-3 border-t border-border/40 pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Mapped Institution Group
                  </Label>
                  {linkedInstitutionGroup?.groupCode ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {linkedInstitutionGroup.groupCode}
                    </Badge>
                  ) : null}
                </div>

                {isInstitutionGroupLoading ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading institution group members...
                  </div>
                ) : !linkedInstitutionGroup ? (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                    No institution group is linked yet. Join a group from
                    settings to list institutions here.
                  </div>
                ) : linkedInstitutionMembers.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                    No colleges are mapped in this institution group yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedInstitutionMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {member.college.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.college.code}
                            {[member.college.city, member.college.state]
                              .filter(Boolean)
                              .join(", ")
                              ? ` • ${[
                                  member.college.city,
                                  member.college.state,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}`
                              : ""}
                          </p>
                        </div>
                        <Badge
                          variant={
                            member.role === "admin" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "admission_policy" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Admission Policy</CardTitle>
              <CardDescription>
                Configure seat availability, eligibility rules, and entrance
                exam requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.admission_policy.id")}
                />
                <input
                  type="checkbox"
                  id="admission-policy-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.admission_policy.enabled")}
                />
                <Label htmlFor="admission-policy-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" /> Quota Seat
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSeatMatrix([
                        ...seatMatrix,
                        { quota: "General", total: "", open: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Quota
                  </Button>
                </div>
                {seatMatrix.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      value={row.quota}
                      onChange={(e) => {
                        const updated = [...seatMatrix];
                        updated[idx].quota = e.target.value;
                        setSeatMatrix(updated);
                      }}
                    >
                      <option value="General">General Quota</option>
                      <option value="Management">Management Quota</option>
                      <option value="NRI">NRI Quota</option>
                      <option value="State Domicile">State Domicile</option>
                      <option value="Sports/ECA">Sports/ECA Quota</option>
                    </select>
                    <Input
                      placeholder="Total Seats"
                      className="h-9"
                      value={row.total}
                      onChange={(e) => {
                        const updated = [...seatMatrix];
                        updated[idx].total = e.target.value;
                        setSeatMatrix(updated);
                      }}
                    />
                    <Input
                      placeholder="Open Seats"
                      className="h-9"
                      value={row.open}
                      onChange={(e) => {
                        const updated = [...seatMatrix];
                        updated[idx].open = e.target.value;
                        setSeatMatrix(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setSeatMatrix(seatMatrix.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />{" "}
                    Eligibility Checkpoints
                  </Label>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {eligibilityCriteriaModel.applicant_type_tabs.map((tab) => (
                      <Button
                        key={tab.id}
                        type="button"
                        size="sm"
                        variant={
                          selectedApplicantTypeId === tab.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          setSelectedApplicantTypeId(tab.id);
                          setSelectedQuotaId(
                            tab.quota_categories[0]?.id || "government_quota",
                          );
                        }}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>

                  {(() => {
                    const applicantType =
                      eligibilityCriteriaModel.applicant_type_tabs.find(
                        (tab) => tab.id === selectedApplicantTypeId,
                      ) || eligibilityCriteriaModel.applicant_type_tabs[0];

                    if (!applicantType) {
                      return null;
                    }

                    const selectedQuota =
                      applicantType.quota_categories.find(
                        (quota) => quota.id === selectedQuotaId,
                      ) || applicantType.quota_categories[0];

                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {applicantType.quota_categories.map((quota) => (
                            <Button
                              key={`${applicantType.id}-${quota.id}`}
                              type="button"
                              size="sm"
                              variant={
                                selectedQuota?.id === quota.id
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setSelectedQuotaId(quota.id)}
                            >
                              {quota.label}
                            </Button>
                          ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-border/40 pt-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            Admission Requirements
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!selectedQuota) {
                                return;
                              }
                              setEligibilityCriteriaModel((prev) => ({
                                ...prev,
                                applicant_type_tabs:
                                  prev.applicant_type_tabs.map((tab) =>
                                    tab.id !== applicantType.id
                                      ? tab
                                      : {
                                          ...tab,
                                          quota_categories:
                                            tab.quota_categories.map((quota) =>
                                              quota.id !== selectedQuota.id
                                                ? quota
                                                : {
                                                    ...quota,
                                                    criteria: [
                                                      ...quota.criteria,
                                                      {
                                                        title: "",
                                                        description: "",
                                                        logo: "",
                                                      },
                                                    ],
                                                  },
                                            ),
                                        },
                                  ),
                              }));
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                            Eligibility
                          </Button>
                        </div>

                        {(selectedQuota?.criteria || []).map(
                          (criterion, idx) => (
                            <div
                              key={`${selectedQuota?.id}-${idx}`}
                              className="grid gap-3 md:grid-cols-[1fr_2fr_2fr_auto] items-center"
                            >
                              <Input
                                placeholder="Title (e.g. Academic Grades)"
                                value={criterion.title}
                                onChange={(e) => {
                                  const nextTitle = e.target.value;
                                  setEligibilityCriteriaModel((prev) => ({
                                    ...prev,
                                    applicant_type_tabs:
                                      prev.applicant_type_tabs.map((tab) =>
                                        tab.id !== applicantType.id
                                          ? tab
                                          : {
                                              ...tab,
                                              quota_categories:
                                                tab.quota_categories.map(
                                                  (quota) =>
                                                    quota.id !==
                                                    selectedQuota?.id
                                                      ? quota
                                                      : {
                                                          ...quota,
                                                          criteria:
                                                            quota.criteria.map(
                                                              (
                                                                item,
                                                                itemIndex,
                                                              ) =>
                                                                itemIndex !==
                                                                idx
                                                                  ? item
                                                                  : {
                                                                      ...item,
                                                                      title:
                                                                        nextTitle,
                                                                    },
                                                            ),
                                                        },
                                                ),
                                            },
                                      ),
                                  }));
                                }}
                              />
                              <Input
                                placeholder="Description"
                                value={criterion.description}
                                onChange={(e) => {
                                  const nextDescription = e.target.value;
                                  setEligibilityCriteriaModel((prev) => ({
                                    ...prev,
                                    applicant_type_tabs:
                                      prev.applicant_type_tabs.map((tab) =>
                                        tab.id !== applicantType.id
                                          ? tab
                                          : {
                                              ...tab,
                                              quota_categories:
                                                tab.quota_categories.map(
                                                  (quota) =>
                                                    quota.id !==
                                                    selectedQuota?.id
                                                      ? quota
                                                      : {
                                                          ...quota,
                                                          criteria:
                                                            quota.criteria.map(
                                                              (
                                                                item,
                                                                itemIndex,
                                                              ) =>
                                                                itemIndex !==
                                                                idx
                                                                  ? item
                                                                  : {
                                                                      ...item,
                                                                      description:
                                                                        nextDescription,
                                                                    },
                                                            ),
                                                        },
                                                ),
                                            },
                                      ),
                                  }));
                                }}
                              />
                              <Input
                                placeholder="Logo SVG"
                                value={criterion.logo}
                                onChange={(e) => {
                                  const nextLogo = e.target.value;
                                  setEligibilityCriteriaModel((prev) => ({
                                    ...prev,
                                    applicant_type_tabs:
                                      prev.applicant_type_tabs.map((tab) =>
                                        tab.id !== applicantType.id
                                          ? tab
                                          : {
                                              ...tab,
                                              quota_categories:
                                                tab.quota_categories.map(
                                                  (quota) =>
                                                    quota.id !==
                                                    selectedQuota?.id
                                                      ? quota
                                                      : {
                                                          ...quota,
                                                          criteria:
                                                            quota.criteria.map(
                                                              (
                                                                item,
                                                                itemIndex,
                                                              ) =>
                                                                itemIndex !==
                                                                idx
                                                                  ? item
                                                                  : {
                                                                      ...item,
                                                                      logo: nextLogo,
                                                                    },
                                                            ),
                                                        },
                                                ),
                                            },
                                      ),
                                  }));
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  setEligibilityCriteriaModel((prev) => ({
                                    ...prev,
                                    applicant_type_tabs:
                                      prev.applicant_type_tabs.map((tab) =>
                                        tab.id !== applicantType.id
                                          ? tab
                                          : {
                                              ...tab,
                                              quota_categories:
                                                tab.quota_categories.map(
                                                  (quota) =>
                                                    quota.id !==
                                                    selectedQuota?.id
                                                      ? quota
                                                      : {
                                                          ...quota,
                                                          criteria:
                                                            quota.criteria.filter(
                                                              (_, itemIndex) =>
                                                                itemIndex !==
                                                                idx,
                                                            ),
                                                        },
                                                ),
                                            },
                                      ),
                                  }));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ),
                        )}

                        {(selectedQuota?.criteria || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No eligibility criteria added for this quota yet.
                          </p>
                        ) : null}

                        <div className="grid gap-3 border-t border-border/40 pt-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">
                              Default Applicant Type
                            </Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={
                                eligibilityCriteriaModel.default_applicant_type
                              }
                              onChange={(e) =>
                                setEligibilityCriteriaModel((prev) => ({
                                  ...prev,
                                  default_applicant_type: e.target.value,
                                }))
                              }
                            >
                              {eligibilityCriteriaModel.applicant_type_tabs.map(
                                (tab) => (
                                  <option key={tab.id} value={tab.id}>
                                    {tab.label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">
                              Default Quota
                            </Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={eligibilityCriteriaModel.default_quota}
                              onChange={(e) =>
                                setEligibilityCriteriaModel((prev) => ({
                                  ...prev,
                                  default_quota: e.target.value,
                                }))
                              }
                            >
                              {ELIGIBILITY_DEFAULT_QUOTAS.map((quota) => (
                                <option key={quota.id} value={quota.id}>
                                  {quota.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">
                              CTA Label
                            </Label>
                            <Input
                              value={eligibilityCriteriaModel.cta.label}
                              onChange={(e) =>
                                setEligibilityCriteriaModel((prev) => ({
                                  ...prev,
                                  cta: { ...prev.cta, label: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">
                              CTA Action
                            </Label>
                            <Input
                              value={eligibilityCriteriaModel.cta.action}
                              onChange={(e) =>
                                setEligibilityCriteriaModel((prev) => ({
                                  ...prev,
                                  cta: { ...prev.cta, action: e.target.value },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-4">
                <Label className="text-sm font-semibold">
                  Entrance Exams (Grouped)
                </Label>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs uppercase text-muted-foreground">
                      National Level
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setNationalExams([
                          ...nationalExams,
                          {
                            shortName: "",
                            fullName: "",
                            minPercentile: "",
                            code: "",
                          },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Exam
                    </Button>
                  </div>
                  {nationalExams.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 gap-3 items-center"
                    >
                      <Input
                        placeholder="Short"
                        value={row.shortName}
                        onChange={(e) => {
                          const updated = [...nationalExams];
                          updated[idx].shortName = e.target.value;
                          setNationalExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Full Name"
                        value={row.fullName}
                        onChange={(e) => {
                          const updated = [...nationalExams];
                          updated[idx].fullName = e.target.value;
                          setNationalExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Min Percentile"
                        value={row.minPercentile}
                        onChange={(e) => {
                          const updated = [...nationalExams];
                          updated[idx].minPercentile = e.target.value;
                          setNationalExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Code"
                        value={row.code}
                        onChange={(e) => {
                          const updated = [...nationalExams];
                          updated[idx].code = e.target.value;
                          setNationalExams(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105 justify-self-start"
                        onClick={() =>
                          setNationalExams(
                            nationalExams.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs uppercase text-muted-foreground">
                      State Level
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStateExams([
                          ...stateExams,
                          {
                            shortName: "",
                            fullName: "",
                            minRank: "",
                            code: "",
                          },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Exam
                    </Button>
                  </div>
                  {stateExams.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 gap-3 items-center"
                    >
                      <Input
                        placeholder="Short"
                        value={row.shortName}
                        onChange={(e) => {
                          const updated = [...stateExams];
                          updated[idx].shortName = e.target.value;
                          setStateExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Full Name"
                        value={row.fullName}
                        onChange={(e) => {
                          const updated = [...stateExams];
                          updated[idx].fullName = e.target.value;
                          setStateExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Min Rank"
                        value={row.minRank}
                        onChange={(e) => {
                          const updated = [...stateExams];
                          updated[idx].minRank = e.target.value;
                          setStateExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Code"
                        value={row.code}
                        onChange={(e) => {
                          const updated = [...stateExams];
                          updated[idx].code = e.target.value;
                          setStateExams(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105 justify-self-start"
                        onClick={() =>
                          setStateExams(stateExams.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Institutional Level
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setInstitutionalExams([
                          ...institutionalExams,
                          {
                            shortName: "",
                            fullName: "",
                            minScore: "",
                            code: "",
                          },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Exam
                    </Button>
                  </div>
                  {institutionalExams.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 gap-3 items-center"
                    >
                      <Input
                        placeholder="Short"
                        value={row.shortName}
                        onChange={(e) => {
                          const updated = [...institutionalExams];
                          updated[idx].shortName = e.target.value;
                          setInstitutionalExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Full Name"
                        value={row.fullName}
                        onChange={(e) => {
                          const updated = [...institutionalExams];
                          updated[idx].fullName = e.target.value;
                          setInstitutionalExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Min Score"
                        value={row.minScore}
                        onChange={(e) => {
                          const updated = [...institutionalExams];
                          updated[idx].minScore = e.target.value;
                          setInstitutionalExams(updated);
                        }}
                      />
                      <Input
                        placeholder="Code"
                        value={row.code}
                        onChange={(e) => {
                          const updated = [...institutionalExams];
                          updated[idx].code = e.target.value;
                          setInstitutionalExams(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105 justify-self-start"
                        onClick={() =>
                          setInstitutionalExams(
                            institutionalExams.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-2">
                <Label htmlFor="eligibility-sum">
                  Overview of Admissions Criteria
                </Label>
                <Textarea
                  id="eligibility-sum"
                  placeholder="Provide brief guidelines about entrance tests, interviews, and timeline..."
                  {...register(
                    "profileSections.admission_policy.policySummary",
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB: EXAM POLICY ==================== */}
        {activeTab === "exam_policy" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Exam Policy</CardTitle>
              <CardDescription>
                Configure exam patterns, grading scale, and academic policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.exam_policy.id")}
                />
                <input
                  type="checkbox"
                  id="exam-policy-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.exam_policy.enabled")}
                />
                <Label htmlFor="exam-policy-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Course With Practical
                </Label>
                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    placeholder="Theory %"
                    value={courseWithPracticalMarks.theory}
                    onChange={(e) =>
                      setCourseWithPracticalMarks((prev) => ({
                        ...prev,
                        theory: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Practical %"
                    value={courseWithPracticalMarks.practical}
                    onChange={(e) =>
                      setCourseWithPracticalMarks((prev) => ({
                        ...prev,
                        practical: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Internal %"
                    value={courseWithPracticalMarks.internal}
                    onChange={(e) =>
                      setCourseWithPracticalMarks((prev) => ({
                        ...prev,
                        internal: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Total"
                    value={courseWithPracticalMarks.total}
                    onChange={(e) =>
                      setCourseWithPracticalMarks((prev) => ({
                        ...prev,
                        total: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Textarea
                    placeholder="ISA Theory (one per line)"
                    value={toLineText(courseWithPracticalIsaTheory)}
                    onChange={(e) =>
                      setCourseWithPracticalIsaTheory(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                  <Textarea
                    placeholder="ISA Practical (one per line)"
                    value={toLineText(courseWithPracticalIsaPractical)}
                    onChange={(e) =>
                      setCourseWithPracticalIsaPractical(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                  <Textarea
                    placeholder="ESA Theory (one per line)"
                    value={toLineText(courseWithPracticalEsaTheory)}
                    onChange={(e) =>
                      setCourseWithPracticalEsaTheory(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                  <Textarea
                    placeholder="ESA Practical (one per line)"
                    value={toLineText(courseWithPracticalEsaPractical)}
                    onChange={(e) =>
                      setCourseWithPracticalEsaPractical(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                </div>
                <Input
                  placeholder="Duration"
                  value={courseWithPracticalDuration}
                  onChange={(e) =>
                    setCourseWithPracticalDuration(e.target.value)
                  }
                />
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Course Without Practical
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Theory %"
                    value={courseWithoutPracticalMarks.theory}
                    onChange={(e) =>
                      setCourseWithoutPracticalMarks((prev) => ({
                        ...prev,
                        theory: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Internal %"
                    value={courseWithoutPracticalMarks.internal}
                    onChange={(e) =>
                      setCourseWithoutPracticalMarks((prev) => ({
                        ...prev,
                        internal: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Total"
                    value={courseWithoutPracticalMarks.total}
                    onChange={(e) =>
                      setCourseWithoutPracticalMarks((prev) => ({
                        ...prev,
                        total: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Textarea
                    placeholder="Internal Assessment (one per line)"
                    value={toLineText(courseWithoutInternalAssessment)}
                    onChange={(e) =>
                      setCourseWithoutInternalAssessment(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                  <Textarea
                    placeholder="Attendance Policy (one per line)"
                    value={toLineText(courseWithoutAttendancePolicy)}
                    onChange={(e) =>
                      setCourseWithoutAttendancePolicy(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                  <Textarea
                    placeholder="External Exam Pattern (one per line)"
                    value={toLineText(courseWithoutExternalPattern)}
                    onChange={(e) =>
                      setCourseWithoutExternalPattern(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                </div>
                <Input
                  placeholder="Duration"
                  value={courseWithoutDuration}
                  onChange={(e) => setCourseWithoutDuration(e.target.value)}
                />
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Standalone Practical
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Internal %"
                    value={standalonePracticalMarks.internal}
                    onChange={(e) =>
                      setStandalonePracticalMarks((prev) => ({
                        ...prev,
                        internal: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="External %"
                    value={standalonePracticalMarks.external}
                    onChange={(e) =>
                      setStandalonePracticalMarks((prev) => ({
                        ...prev,
                        external: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Total"
                    value={standalonePracticalMarks.total}
                    onChange={(e) =>
                      setStandalonePracticalMarks((prev) => ({
                        ...prev,
                        total: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Textarea
                    placeholder="Internal Assessment (one per line)"
                    value={toLineText(standaloneInternalAssessment)}
                    onChange={(e) =>
                      setStandaloneInternalAssessment(
                        fromLineText(e.target.value),
                      )
                    }
                  />
                  <Textarea
                    placeholder="External Exam Pattern (one per line)"
                    value={toLineText(standaloneExternalPattern)}
                    onChange={(e) =>
                      setStandaloneExternalPattern(fromLineText(e.target.value))
                    }
                  />
                </div>
                <Input
                  placeholder="Duration"
                  value={standaloneDuration}
                  onChange={(e) => setStandaloneDuration(e.target.value)}
                />
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Project / Dissertation
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Internal %"
                    value={projectDissertationMarks.internal}
                    onChange={(e) =>
                      setProjectDissertationMarks((prev) => ({
                        ...prev,
                        internal: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="ESA %"
                    value={projectDissertationMarks.esa}
                    onChange={(e) =>
                      setProjectDissertationMarks((prev) => ({
                        ...prev,
                        esa: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Total"
                    value={projectDissertationMarks.total}
                    onChange={(e) =>
                      setProjectDissertationMarks((prev) => ({
                        ...prev,
                        total: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Textarea
                    placeholder="Internal Evaluation (one per line)"
                    value={toLineText(projectInternalEvaluation)}
                    onChange={(e) =>
                      setProjectInternalEvaluation(fromLineText(e.target.value))
                    }
                  />
                  <Textarea
                    placeholder="External Evaluation (one per line)"
                    value={toLineText(projectExternalEvaluation)}
                    onChange={(e) =>
                      setProjectExternalEvaluation(fromLineText(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  OJT & Internship
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="OJT Assessment Criteria (one per line)"
                      value={toLineText(ojtAssessmentCriteria)}
                      onChange={(e) =>
                        setOjtAssessmentCriteria(fromLineText(e.target.value))
                      }
                    />
                    <Input
                      placeholder="OJT Total Marks"
                      value={ojtTotalMarks}
                      onChange={(e) => setOjtTotalMarks(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Internship Evaluation Components (one per line)"
                      value={toLineText(internshipEvaluationComponents)}
                      onChange={(e) =>
                        setInternshipEvaluationComponents(
                          fromLineText(e.target.value),
                        )
                      }
                    />
                    <Input
                      placeholder="Internship Total Marks"
                      value={internshipTotalMarks}
                      onChange={(e) => setInternshipTotalMarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Grading Scale</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setGradingScaleRows([
                        ...gradingScaleRows,
                        { percentage: "", grade: "", gradePoint: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Grade Row
                  </Button>
                </div>
                {gradingScaleRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-3 items-center"
                  >
                    <Input
                      placeholder="Percentage"
                      value={row.percentage}
                      onChange={(e) => {
                        const updated = [...gradingScaleRows];
                        updated[idx].percentage = e.target.value;
                        setGradingScaleRows(updated);
                      }}
                    />
                    <Input
                      placeholder="Grade"
                      value={row.grade}
                      onChange={(e) => {
                        const updated = [...gradingScaleRows];
                        updated[idx].grade = e.target.value;
                        setGradingScaleRows(updated);
                      }}
                    />
                    <Input
                      placeholder="Grade Point"
                      value={row.gradePoint}
                      onChange={(e) => {
                        const updated = [...gradingScaleRows];
                        updated[idx].gradePoint = e.target.value;
                        setGradingScaleRows(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setGradingScaleRows(
                          gradingScaleRows.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    Academic Policies
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAcademicPoliciesRows([
                        ...academicPoliciesRows,
                        {
                          title: "",
                          shortValue: "",
                          description: "",
                          readMoreEnabled: true,
                        },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Policy
                  </Button>
                </div>
                {academicPoliciesRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-3 items-center"
                  >
                    <Input
                      placeholder="Title"
                      value={row.title}
                      onChange={(e) => {
                        const updated = [...academicPoliciesRows];
                        updated[idx].title = e.target.value;
                        setAcademicPoliciesRows(updated);
                      }}
                    />
                    <Input
                      placeholder="Short Value"
                      value={row.shortValue}
                      onChange={(e) => {
                        const updated = [...academicPoliciesRows];
                        updated[idx].shortValue = e.target.value;
                        setAcademicPoliciesRows(updated);
                      }}
                    />
                    <Input
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) => {
                        const updated = [...academicPoliciesRows];
                        updated[idx].description = e.target.value;
                        setAcademicPoliciesRows(updated);
                      }}
                    />
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={row.readMoreEnabled}
                        onChange={(e) => {
                          const updated = [...academicPoliciesRows];
                          updated[idx].readMoreEnabled = e.target.checked;
                          setAcademicPoliciesRows(updated);
                        }}
                      />
                      Read More
                    </label>
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setAcademicPoliciesRows(
                          academicPoliciesRows.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB: PLACEMENTS ==================== */}
        {activeTab === "placements" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Placements & Recruiter Highlights</CardTitle>
              <CardDescription>
                Configure the placements section with structured input fields
                for every nested model property.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.placements.id")}
                />
                <input
                  type="checkbox"
                  id="placements-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.placements.enabled")}
                />
                <Label htmlFor="placements-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-4">
                <Label className="text-sm font-semibold">Report</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Report label"
                    value={placementsReportLabel}
                    onChange={(e) => setPlacementsReportLabel(e.target.value)}
                  />
                  <Input
                    placeholder="Report action"
                    value={placementsReportAction}
                    onChange={(e) => setPlacementsReportAction(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Summary Stats</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPlacementsSummaryStatsRows([
                        ...placementsSummaryStatsRows,
                        { id: "", label: "", value: "", unit: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
                  </Button>
                </div>
                {placementsSummaryStatsRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-3 items-center"
                  >
                    <Input
                      placeholder="id"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...placementsSummaryStatsRows];
                        updated[idx].id = e.target.value;
                        setPlacementsSummaryStatsRows(updated);
                      }}
                    />
                    <Input
                      placeholder="label"
                      value={row.label}
                      onChange={(e) => {
                        const updated = [...placementsSummaryStatsRows];
                        updated[idx].label = e.target.value;
                        setPlacementsSummaryStatsRows(updated);
                      }}
                    />
                    <Input
                      placeholder="value"
                      value={row.value}
                      onChange={(e) => {
                        const updated = [...placementsSummaryStatsRows];
                        updated[idx].value = e.target.value;
                        setPlacementsSummaryStatsRows(updated);
                      }}
                    />
                    <Input
                      placeholder="unit"
                      value={row.unit}
                      onChange={(e) => {
                        const updated = [...placementsSummaryStatsRows];
                        updated[idx].unit = e.target.value;
                        setPlacementsSummaryStatsRows(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setPlacementsSummaryStatsRows(
                          placementsSummaryStatsRows.filter(
                            (_, i) => i !== idx,
                          ),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Placement Trends
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Label"
                    value={placementsTrendsLabel}
                    onChange={(e) => setPlacementsTrendsLabel(e.target.value)}
                  />
                  <Input
                    placeholder="Period"
                    value={placementsTrendsPeriod}
                    onChange={(e) => setPlacementsTrendsPeriod(e.target.value)}
                  />
                  <Input
                    placeholder="Years comma separated (2020, 2021, 2022)"
                    value={placementsTrendsYearsText}
                    onChange={(e) =>
                      setPlacementsTrendsYearsText(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Avg package growth YoY"
                    value={placementsTrendsGrowthYoy}
                    onChange={(e) =>
                      setPlacementsTrendsGrowthYoy(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Industry Salary Report
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Label"
                    value={industrySalaryReportLabel}
                    onChange={(e) =>
                      setIndustrySalaryReportLabel(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Columns comma separated"
                    value={industrySalaryReportColumnsText}
                    onChange={(e) =>
                      setIndustrySalaryReportColumnsText(e.target.value)
                    }
                  />
                  <Input
                    placeholder="CTA Label"
                    value={industryCtaLabel}
                    onChange={(e) => setIndustryCtaLabel(e.target.value)}
                  />
                  <Input
                    placeholder="CTA Action"
                    value={industryCtaAction}
                    onChange={(e) => setIndustryCtaAction(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Industries
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setIndustrySalaryRows([
                        ...industrySalaryRows,
                        {
                          id: "",
                          name: "",
                          sub_label: "",
                          students_placed: "",
                          avg_package: "",
                          max_package: "",
                        },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Industry
                  </Button>
                </div>
                {industrySalaryRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-6 gap-3 items-center"
                  >
                    <Input
                      placeholder="id"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...industrySalaryRows];
                        updated[idx].id = e.target.value;
                        setIndustrySalaryRows(updated);
                      }}
                    />
                    <Input
                      placeholder="name"
                      value={row.name}
                      onChange={(e) => {
                        const updated = [...industrySalaryRows];
                        updated[idx].name = e.target.value;
                        setIndustrySalaryRows(updated);
                      }}
                    />
                    <Input
                      placeholder="sub label"
                      value={row.sub_label}
                      onChange={(e) => {
                        const updated = [...industrySalaryRows];
                        updated[idx].sub_label = e.target.value;
                        setIndustrySalaryRows(updated);
                      }}
                    />
                    <Input
                      placeholder="students placed"
                      value={row.students_placed}
                      onChange={(e) => {
                        const updated = [...industrySalaryRows];
                        updated[idx].students_placed = e.target.value;
                        setIndustrySalaryRows(updated);
                      }}
                    />
                    <Input
                      placeholder="avg package"
                      value={row.avg_package}
                      onChange={(e) => {
                        const updated = [...industrySalaryRows];
                        updated[idx].avg_package = e.target.value;
                        setIndustrySalaryRows(updated);
                      }}
                    />
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="max package"
                        value={row.max_package}
                        onChange={(e) => {
                          const updated = [...industrySalaryRows];
                          updated[idx].max_package = e.target.value;
                          setIndustrySalaryRows(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105"
                        onClick={() =>
                          setIndustrySalaryRows(
                            industrySalaryRows.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">Notable Offers</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Label"
                    value={notableOffersLabel}
                    onChange={(e) => setNotableOffersLabel(e.target.value)}
                  />
                  <Input
                    placeholder="CTA Label"
                    value={notableOffersCtaLabel}
                    onChange={(e) => setNotableOffersCtaLabel(e.target.value)}
                  />
                  <Input
                    placeholder="CTA Action"
                    value={notableOffersCtaAction}
                    onChange={(e) => setNotableOffersCtaAction(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Featured Companies
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNotableFeaturedRows([
                        ...notableFeaturedRows,
                        {
                          company: "",
                          tag: "",
                          industry: "",
                          offersText: "",
                        },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Featured
                  </Button>
                </div>
                {notableFeaturedRows.map((row, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border p-3">
                    <div className="grid gap-3 md:grid-cols-4 items-center">
                      <Input
                        placeholder="Company"
                        value={row.company}
                        onChange={(e) => {
                          const updated = [...notableFeaturedRows];
                          updated[idx].company = e.target.value;
                          setNotableFeaturedRows(updated);
                        }}
                      />
                      <Input
                        placeholder="Tag"
                        value={row.tag}
                        onChange={(e) => {
                          const updated = [...notableFeaturedRows];
                          updated[idx].tag = e.target.value;
                          setNotableFeaturedRows(updated);
                        }}
                      />
                      <Input
                        placeholder="Industry"
                        value={row.industry}
                        onChange={(e) => {
                          const updated = [...notableFeaturedRows];
                          updated[idx].industry = e.target.value;
                          setNotableFeaturedRows(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105 justify-self-start"
                        onClick={() =>
                          setNotableFeaturedRows(
                            notableFeaturedRows.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Textarea
                      placeholder="Offers (role|package|unit|type one per line)"
                      value={row.offersText}
                      onChange={(e) => {
                        const updated = [...notableFeaturedRows];
                        updated[idx].offersText = e.target.value;
                        setNotableFeaturedRows(updated);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  All Company Statistics
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Label"
                    value={allCompanyStatisticsLabel}
                    onChange={(e) =>
                      setAllCompanyStatisticsLabel(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Columns comma separated"
                    value={allCompanyStatisticsColumnsText}
                    onChange={(e) =>
                      setAllCompanyStatisticsColumnsText(e.target.value)
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Company Rows
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAllCompanyRows([
                        ...allCompanyRows,
                        {
                          id: "",
                          name: "",
                          students: "",
                          avg_package: "",
                          max_package: "",
                        },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Company
                  </Button>
                </div>
                {allCompanyRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-3 items-center"
                  >
                    <Input
                      placeholder="id"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...allCompanyRows];
                        updated[idx].id = e.target.value;
                        setAllCompanyRows(updated);
                      }}
                    />
                    <Input
                      placeholder="name"
                      value={row.name}
                      onChange={(e) => {
                        const updated = [...allCompanyRows];
                        updated[idx].name = e.target.value;
                        setAllCompanyRows(updated);
                      }}
                    />
                    <Input
                      placeholder="students"
                      value={row.students}
                      onChange={(e) => {
                        const updated = [...allCompanyRows];
                        updated[idx].students = e.target.value;
                        setAllCompanyRows(updated);
                      }}
                    />
                    <Input
                      placeholder="avg package"
                      value={row.avg_package}
                      onChange={(e) => {
                        const updated = [...allCompanyRows];
                        updated[idx].avg_package = e.target.value;
                        setAllCompanyRows(updated);
                      }}
                    />
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="max package"
                        value={row.max_package}
                        onChange={(e) => {
                          const updated = [...allCompanyRows];
                          updated[idx].max_package = e.target.value;
                          setAllCompanyRows(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105"
                        onClick={() =>
                          setAllCompanyRows(
                            allCompanyRows.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    Student Success
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setStudentSuccessRows([
                        ...studentSuccessRows,
                        { name: "", placed_at: "", quote: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Student
                  </Button>
                </div>
                {studentSuccessRows.map((row, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border p-3">
                    <div className="grid gap-3 md:grid-cols-3 items-center">
                      <Input
                        placeholder="Name"
                        value={row.name}
                        onChange={(e) => {
                          const updated = [...studentSuccessRows];
                          updated[idx].name = e.target.value;
                          setStudentSuccessRows(updated);
                        }}
                      />
                      <Input
                        placeholder="Placed at"
                        value={row.placed_at}
                        onChange={(e) => {
                          const updated = [...studentSuccessRows];
                          updated[idx].placed_at = e.target.value;
                          setStudentSuccessRows(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105 justify-self-start"
                        onClick={() =>
                          setStudentSuccessRows(
                            studentSuccessRows.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Textarea
                      placeholder="Quote"
                      value={row.quote}
                      onChange={(e) => {
                        const updated = [...studentSuccessRows];
                        updated[idx].quote = e.target.value;
                        setStudentSuccessRows(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB: FEES ==================== */}
        {activeTab === "fees" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Tuition Fees, Deadlines & Scholarships</CardTitle>
              <CardDescription>
                Setup clear tuition structures, utility charges, deadlines, and
                aid calculator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input type="hidden" {...register("profileSections.fees.id")} />
                <input
                  type="checkbox"
                  id="fees-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.fees.enabled")}
                />
                <Label htmlFor="fees-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Tuition Fees Download
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Label"
                    value={feesDownload.label}
                    onChange={(e) =>
                      setFeesDownload((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="File Label"
                    value={feesDownload.file_label}
                    onChange={(e) =>
                      setFeesDownload((prev) => ({
                        ...prev,
                        file_label: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="File Size"
                    value={feesDownload.file_size}
                    onChange={(e) =>
                      setFeesDownload((prev) => ({
                        ...prev,
                        file_size: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="File Type"
                    value={feesDownload.file_type}
                    onChange={(e) =>
                      setFeesDownload((prev) => ({
                        ...prev,
                        file_type: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Action"
                    value={feesDownload.action}
                    onChange={(e) =>
                      setFeesDownload((prev) => ({
                        ...prev,
                        action: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">Filters</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Quota label"
                    value={feesQuotaFilterLabel}
                    onChange={(e) => setFeesQuotaFilterLabel(e.target.value)}
                  />
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedFeesQuotaFilter}
                    onChange={(e) => setSelectedFeesQuotaFilter(e.target.value)}
                  >
                    {fromLineText(feesQuotaOptionsText).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="Quota options (one per line)"
                    value={feesQuotaOptionsText}
                    onChange={(e) => setFeesQuotaOptionsText(e.target.value)}
                  />
                  <div className="space-y-4">
                    <Input
                      placeholder="Gender label"
                      value={feesGenderFilterLabel}
                      onChange={(e) => setFeesGenderFilterLabel(e.target.value)}
                    />
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedFeesGenderTab}
                      onChange={(e) => setSelectedFeesGenderTab(e.target.value)}
                    >
                      {fromLineText(feesGenderOptionsText).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      placeholder="Gender options (one per line)"
                      value={feesGenderOptionsText}
                      onChange={(e) => setFeesGenderOptionsText(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Fee Matrix</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFeesMatrixRows([
                        ...feesMatrixRows,
                        {
                          quota_category: selectedFeesQuotaFilter,
                          gender: selectedFeesGenderTab,
                          year1: "",
                          year2: "",
                          year3: "",
                          year4: "",
                        },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {fromLineText(feesGenderOptionsText).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={
                        selectedFeesGenderTab === option ? "default" : "outline"
                      }
                      onClick={() => setSelectedFeesGenderTab(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {feesMatrixRows.map((row, idx) => {
                  if (row.gender !== selectedFeesGenderTab) {
                    return null;
                  }
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-7 gap-3 items-center"
                    >
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={row.quota_category}
                        onChange={(e) => {
                          const updated = [...feesMatrixRows];
                          updated[idx].quota_category = e.target.value;
                          setFeesMatrixRows(updated);
                        }}
                      >
                        {fromLineText(feesQuotaOptionsText).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={row.gender}
                        onChange={(e) => {
                          const updated = [...feesMatrixRows];
                          updated[idx].gender = e.target.value;
                          setFeesMatrixRows(updated);
                        }}
                      >
                        {fromLineText(feesGenderOptionsText).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="1st Year"
                        value={row.year1}
                        onChange={(e) => {
                          const updated = [...feesMatrixRows];
                          updated[idx].year1 = e.target.value;
                          setFeesMatrixRows(updated);
                        }}
                      />
                      <Input
                        placeholder="2nd Year"
                        value={row.year2}
                        onChange={(e) => {
                          const updated = [...feesMatrixRows];
                          updated[idx].year2 = e.target.value;
                          setFeesMatrixRows(updated);
                        }}
                      />
                      <Input
                        placeholder="3rd Year"
                        value={row.year3}
                        onChange={(e) => {
                          const updated = [...feesMatrixRows];
                          updated[idx].year3 = e.target.value;
                          setFeesMatrixRows(updated);
                        }}
                      />
                      <Input
                        placeholder="4th Year"
                        value={row.year4}
                        onChange={(e) => {
                          const updated = [...feesMatrixRows];
                          updated[idx].year4 = e.target.value;
                          setFeesMatrixRows(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105"
                        onClick={() =>
                          setFeesMatrixRows(
                            feesMatrixRows.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    One Time Payable Fees
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOneTimePayableFees([
                        ...oneTimePayableFees,
                        { id: "", label: "", amount: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Fee
                  </Button>
                </div>
                {oneTimePayableFees.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-3 items-center"
                  >
                    <Input
                      placeholder="id"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...oneTimePayableFees];
                        updated[idx].id = e.target.value;
                        setOneTimePayableFees(updated);
                      }}
                    />
                    <Input
                      placeholder="label"
                      value={row.label}
                      onChange={(e) => {
                        const updated = [...oneTimePayableFees];
                        updated[idx].label = e.target.value;
                        setOneTimePayableFees(updated);
                      }}
                    />
                    <Input
                      placeholder="amount"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...oneTimePayableFees];
                        updated[idx].amount = e.target.value;
                        setOneTimePayableFees(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setOneTimePayableFees(
                          oneTimePayableFees.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    Additional Fees
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAdditionalFees([
                        ...additionalFees,
                        { id: "", label: "", amount: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Fee
                  </Button>
                </div>
                {additionalFees.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-3 items-center"
                  >
                    <Input
                      placeholder="id"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].id = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <Input
                      placeholder="label"
                      value={row.label}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].label = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <Input
                      placeholder="amount"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].amount = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setAdditionalFees(
                          additionalFees.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">Inclusions</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Textarea
                    placeholder="What's Included (one per line)"
                    value={inclusionIncludedText}
                    onChange={(e) => setInclusionIncludedText(e.target.value)}
                  />
                  <Textarea
                    placeholder="What's Excluded (one per line)"
                    value={inclusionExcludedText}
                    onChange={(e) => setInclusionExcludedText(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    Deadlines and Installments
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setInstallmentSchedule([
                        ...installmentSchedule,
                        { id: "", label: "", deadline: "", amount: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Installment
                  </Button>
                </div>
                {installmentSchedule.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-3 items-center"
                  >
                    <Input
                      placeholder="id"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].id = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="label"
                      value={row.label}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].label = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="deadline"
                      value={row.deadline}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].deadline = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="amount"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].amount = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setInstallmentSchedule(
                          installmentSchedule.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">Fees Summary</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Full course fee"
                    value={feesSummaryFullCourseFee}
                    onChange={(e) =>
                      setFeesSummaryFullCourseFee(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Booking amount"
                    value={feesSummaryBookingAmount}
                    onChange={(e) =>
                      setFeesSummaryBookingAmount(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Currency"
                    value={feesSummaryCurrency}
                    onChange={(e) => setFeesSummaryCurrency(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-2">
                <Label className="text-sm font-semibold">Refund Policy</Label>
                <Textarea
                  placeholder="One refund point per line"
                  value={refundPolicyText}
                  onChange={(e) => setRefundPolicyText(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB: FINANCIAL AID ==================== */}
        {activeTab === "financial_aid" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Financial Aid</CardTitle>
              <CardDescription>
                Configure merit scholarship, calculator, concessions, and
                upfront fee concession.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.financial_aid.id")}
                />
                <input
                  type="checkbox"
                  id="financial-aid-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.financial_aid.enabled")}
                />
                <Label htmlFor="financial-aid-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="merit-scholarship-title">
                    Merit Scholarship Title
                  </Label>
                  <Input
                    id="merit-scholarship-title"
                    placeholder="Merit Scholarship"
                    {...register(
                      "profileSections.financial_aid.meritScholarship.title",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merit-scholarship-desc">Description</Label>
                  <Input
                    id="merit-scholarship-desc"
                    placeholder="Details about merit scholarship"
                    {...register(
                      "profileSections.financial_aid.meritScholarship.description",
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t pt-6 border-border/40">
                <input
                  type="checkbox"
                  id="financial-aid-calc-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register(
                    "profileSections.financial_aid.scholarshipCalculator.enabled",
                  )}
                />
                <Label htmlFor="financial-aid-calc-enabled">
                  Enable Scholarship Calculator
                </Label>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Scholarship Calculator Inputs
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="port-of-entry">
                      Port Of Entry (comma separated)
                    </Label>
                    <Input
                      id="port-of-entry"
                      placeholder="KCET, COMEDK, Management"
                      value={calculatorPortOfEntry.join(", ")}
                      onChange={(e) =>
                        setCalculatorPortOfEntry(
                          e.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank-ranges">
                      Rank Ranges (comma separated)
                    </Label>
                    <Input
                      id="rank-ranges"
                      placeholder="1-1000, 1001-5000"
                      value={calculatorRankRanges.join(", ")}
                      onChange={(e) =>
                        setCalculatorRankRanges(
                          e.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-2">
                <Label htmlFor="calculator-terms">
                  Terms & Conditions (one per line)
                </Label>
                <Textarea
                  id="calculator-terms"
                  placeholder="Students can avail 25% scholarship\nApplicable only for first year"
                  value={calculatorTerms.join("\n")}
                  onChange={(e) =>
                    setCalculatorTerms(
                      e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">Final Summary</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-scholarship">Max Scholarship</Label>
                    <Input
                      id="max-scholarship"
                      placeholder="150000"
                      value={calculatorSummary.maxScholarship}
                      onChange={(e) =>
                        setCalculatorSummary((prev) => ({
                          ...prev,
                          maxScholarship: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net-payable-fees">Net Payable Fees</Label>
                    <Input
                      id="net-payable-fees"
                      placeholder="245000"
                      value={calculatorSummary.netPayableFees}
                      onChange={(e) =>
                        setCalculatorSummary((prev) => ({
                          ...prev,
                          netPayableFees: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" /> Financial
                    Concessions
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFinancialConcessions([
                        ...financialConcessions,
                        {
                          type: "",
                          discount: "",
                          details: "",
                          eligibilityCriteriaText: "",
                          scholarshipAmount: "",
                          netPayable: "",
                        },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Concession
                  </Button>
                </div>

                {financialConcessions.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-6 gap-3 items-center"
                  >
                    <Input
                      placeholder="Concession Type"
                      className="h-9"
                      value={row.type}
                      onChange={(e) => {
                        const updated = [...financialConcessions];
                        updated[idx].type = e.target.value;
                        setFinancialConcessions(updated);
                      }}
                    />
                    <Input
                      placeholder="Discount"
                      className="h-9"
                      value={row.discount}
                      onChange={(e) => {
                        const updated = [...financialConcessions];
                        updated[idx].discount = e.target.value;
                        setFinancialConcessions(updated);
                      }}
                    />
                    <Input
                      placeholder="Details"
                      className="h-9"
                      value={row.details}
                      onChange={(e) => {
                        const updated = [...financialConcessions];
                        updated[idx].details = e.target.value;
                        setFinancialConcessions(updated);
                      }}
                    />
                    <Input
                      placeholder="Eligibility (line1|line2)"
                      className="h-9"
                      value={row.eligibilityCriteriaText}
                      onChange={(e) => {
                        const updated = [...financialConcessions];
                        updated[idx].eligibilityCriteriaText = e.target.value;
                        setFinancialConcessions(updated);
                      }}
                    />
                    <Input
                      placeholder="Scholarship Amount"
                      className="h-9"
                      value={row.scholarshipAmount}
                      onChange={(e) => {
                        const updated = [...financialConcessions];
                        updated[idx].scholarshipAmount = e.target.value;
                        setFinancialConcessions(updated);
                      }}
                    />
                    <Input
                      placeholder="Net Payable"
                      className="h-9"
                      value={row.netPayable}
                      onChange={(e) => {
                        const updated = [...financialConcessions];
                        updated[idx].netPayable = e.target.value;
                        setFinancialConcessions(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setFinancialConcessions(
                          financialConcessions.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">
                  Upfront Fee Concession
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="upfront-concession-discount">
                      Discount
                    </Label>
                    <Input
                      id="upfront-concession-discount"
                      placeholder="5%"
                      value={upfrontFeeConcession.discount}
                      onChange={(e) =>
                        setUpfrontFeeConcession((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upfront-concession-details">Details</Label>
                    <Input
                      id="upfront-concession-details"
                      placeholder="Applicable for full upfront payment"
                      value={upfrontFeeConcession.details}
                      onChange={(e) =>
                        setUpfrontFeeConcession((prev) => ({
                          ...prev,
                          details: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "review" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Review</CardTitle>
              <CardDescription>
                Configure overall rating, sentiment distribution, category
                ratings, review list, and pagination.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.review.id")}
                />
                <input
                  type="checkbox"
                  id="review-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.review.enabled")}
                />
                <Label htmlFor="review-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="review-rating">Overall Rating</Label>
                  <Input
                    id="review-rating"
                    placeholder="4.5"
                    value={reviewOverallRating}
                    onChange={(e) => setReviewOverallRating(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-total">Total Reviews</Label>
                  <Input
                    id="review-total"
                    placeholder="2909"
                    value={reviewTotalReviews}
                    onChange={(e) => setReviewTotalReviews(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="review-distribution">
                  Emoji Rating Distribution (emoji|count per line)
                </Label>
                <Textarea
                  id="review-distribution"
                  placeholder={"😍|1000\n😁|500"}
                  value={reviewRatingDistributionText}
                  onChange={(e) =>
                    setReviewRatingDistributionText(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="review-categories">
                  Category Ratings (category|rating per line)
                </Label>
                <Textarea
                  id="review-categories"
                  placeholder={"Faculty & Course|4\nCampus Life|4"}
                  value={reviewCategoryRatingsText}
                  onChange={(e) => setReviewCategoryRatingsText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="review-list">
                  Reviews (reviewerName|reviewDate|reviewText per line)
                </Label>
                <Textarea
                  id="review-list"
                  placeholder={"Anonymous|2025-10-10|Great infrastructure..."}
                  value={reviewEntriesText}
                  onChange={(e) => setReviewEntriesText(e.target.value)}
                />
              </div>

              <div className="border-t pt-6 border-border/40 space-y-3">
                <Label className="text-sm font-semibold">Pagination</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="review-page">Page</Label>
                    <Input
                      id="review-page"
                      value={reviewPage}
                      onChange={(e) => setReviewPage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-page-size">Page Size</Label>
                    <Input
                      id="review-page-size"
                      value={reviewPageSize}
                      onChange={(e) => setReviewPageSize(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex items-end gap-6 pb-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={reviewLoadMoreEnabled}
                        onChange={(e) =>
                          setReviewLoadMoreEnabled(e.target.checked)
                        }
                      />
                      Load More Enabled
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={reviewHasMore}
                        onChange={(e) => setReviewHasMore(e.target.checked)}
                      />
                      Has More
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "library" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Library</CardTitle>
              <CardDescription>
                Configure library overview, resources, hours, and facilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.library.id")}
                />
                <input
                  type="checkbox"
                  id="library-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.library.enabled")}
                />
                <Label htmlFor="library-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="library-name">Library Name</Label>
                  <Input
                    id="library-name"
                    placeholder="Central Library"
                    value={libraryName}
                    onChange={(e) => setLibraryName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library-area">Area (Sq Feet)</Label>
                  <Input
                    id="library-area"
                    value={libraryAreaSqFeet}
                    onChange={(e) => setLibraryAreaSqFeet(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library-seats">Total Seats</Label>
                  <Input
                    id="library-seats"
                    value={libraryTotalSeats}
                    onChange={(e) => setLibraryTotalSeats(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library-volumes">Total Volumes</Label>
                  <Input
                    id="library-volumes"
                    value={libraryTotalVolumes}
                    onChange={(e) => setLibraryTotalVolumes(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library-cabins">Research Cabins</Label>
                  <Input
                    id="library-cabins"
                    value={libraryResearchCabins}
                    onChange={(e) => setLibraryResearchCabins(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-6 border-border/40">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    Available Resources
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLibraryResourceRows((prev) => [
                        ...prev,
                        { resourceType: "", count: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Resource
                  </Button>
                </div>
                {libraryResourceRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-3 items-center md:grid-cols-[1fr_220px_auto]"
                  >
                    <Input
                      placeholder="Resource Type"
                      value={row.resourceType}
                      onChange={(e) =>
                        setLibraryResourceRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, resourceType: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Count"
                      value={row.count}
                      onChange={(e) =>
                        setLibraryResourceRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, count: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setLibraryResourceRows((prev) =>
                          prev.filter((_, itemIdx) => itemIdx !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-6 border-border/40">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Library Hours</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLibraryHourRows((prev) => [
                        ...prev,
                        { day: "", workingHours: "", transactionHours: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Hours
                  </Button>
                </div>
                {libraryHourRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-3 items-center md:grid-cols-[220px_1fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Day"
                      value={row.day}
                      onChange={(e) =>
                        setLibraryHourRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, day: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Working Hours"
                      value={row.workingHours}
                      onChange={(e) =>
                        setLibraryHourRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, workingHours: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Transaction Hours"
                      value={row.transactionHours}
                      onChange={(e) =>
                        setLibraryHourRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, transactionHours: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setLibraryHourRows((prev) =>
                          prev.filter((_, itemIdx) => itemIdx !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-6 border-border/40">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Facilities</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLibraryFacilityRows((prev) => [
                        ...prev,
                        { title: "", image: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Facility
                  </Button>
                </div>
                {libraryFacilityRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-3 items-center md:grid-cols-[1fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Facility Title"
                      value={row.title}
                      onChange={(e) =>
                        setLibraryFacilityRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, title: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Facility Image URL"
                      value={row.image}
                      onChange={(e) =>
                        setLibraryFacilityRows((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? { ...item, image: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setLibraryFacilityRows((prev) =>
                          prev.filter((_, itemIdx) => itemIdx !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "student_code_of_conduct" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Student Code of Conduct</CardTitle>
              <CardDescription>
                Configure section title and numbered discipline rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.student_code_of_conduct.id")}
                />
                <input
                  type="checkbox"
                  id="conduct-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register(
                    "profileSections.student_code_of_conduct.enabled",
                  )}
                />
                <Label htmlFor="conduct-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conduct-title">Section Title</Label>
                <Input
                  id="conduct-title"
                  placeholder="General Rules of Discipline"
                  value={conductTitle}
                  onChange={(e) => setConductTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="conduct-rules">
                  Rules List (order|rule per line)
                </Label>
                <Textarea
                  id="conduct-rules"
                  placeholder={
                    "1|Always carry the Identity Card while in college or hospital.\n2|Attend classes and clinical postings on time."
                  }
                  value={conductRulesText}
                  onChange={(e) => setConductRulesText(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "course_info" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Course Info</CardTitle>
              <CardDescription>
                Configure course name, admissions, curriculum, opportunities,
                facilities, alumni, FAQs, and forum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.course_info.id")}
                />
                <input
                  type="checkbox"
                  id="course-info-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.course_info.enabled")}
                />
                <Label htmlFor="course-info-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Course Name</Label>
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={otherCourseName}
                    onChange={(e) =>
                      handleCourseInfoSelectionChange(e.target.value)
                    }
                  >
                    <option value="">Select Course</option>
                    {courseNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Or type a custom course name"
                    value={otherCourseName}
                    onChange={(e) =>
                      handleCourseInfoSelectionChange(e.target.value)
                    }
                  />
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Admissions</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentRows = parsePipeRowsWithColumns(
                          admissionsMatrixText,
                          10,
                        );
                        addPipeRow(
                          admissionsMatrixText,
                          setAdmissionsMatrixText,
                          10,
                        );
                        setActiveAdmissionIndex(currentRows.length);
                      }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add Admission
                    </Button>
                  </div>
                  {(() => {
                    const rows =
                      parsePipeRowsWithColumns(admissionsMatrixText, 10)
                        .length > 0
                        ? parsePipeRowsWithColumns(admissionsMatrixText, 10)
                        : [["", "", "", "", "", "", "", "", "", ""]];

                    const selectedIndex = Math.min(
                      activeAdmissionIndex,
                      rows.length - 1,
                    );
                    const selected = rows[selectedIndex] || [
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                    ];

                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {rows.map((row, rowIndex) => {
                            const isActive = rowIndex === selectedIndex;
                            return (
                              <Button
                                key={`admission-tab-${rowIndex}`}
                                type="button"
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                onClick={() =>
                                  setActiveAdmissionIndex(rowIndex)
                                }
                              >
                                {row[0]?.trim() || `Admission ${rowIndex + 1}`}
                              </Button>
                            );
                          })}
                        </div>

                        <div className="space-y-2 rounded-lg border border-border/50 p-3">
                          <div className="rounded-md bg-muted/40 px-3 py-2 text-sm font-medium">
                            {selected[0]?.trim() ||
                              `Admission ${selectedIndex + 1}`}
                          </div>

                          <Input
                            placeholder="Year (Admissions 2025)"
                            value={selected[0]}
                            onChange={(e) =>
                              updatePipeCell(
                                admissionsMatrixText,
                                setAdmissionsMatrixText,
                                10,
                                selectedIndex,
                                0,
                                e.target.value,
                              )
                            }
                          />

                          <div className="grid gap-2 md:grid-cols-2">
                            <Input
                              placeholder="Status"
                              value={selected[1]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  1,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Placement Rate"
                              value={selected[2]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  2,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Seats Note"
                              value={selected[3]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  3,
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Basic Details
                          </div>

                          <div className="grid gap-2 md:grid-cols-2">
                            <Input
                              placeholder="Duration"
                              value={selected[4]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  4,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Study Mode"
                              value={selected[5]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  5,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Academic Cycle"
                              value={selected[6]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  6,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Total Credits"
                              value={selected[7]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  7,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Gender Accepted"
                              value={selected[8]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  8,
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Course Category"
                              value={selected[9]}
                              onChange={(e) =>
                                updatePipeCell(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                  9,
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() =>
                                removePipeRow(
                                  admissionsMatrixText,
                                  setAdmissionsMatrixText,
                                  10,
                                  selectedIndex,
                                )
                              }
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Program Highlights</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addLineRow(
                        programHighlightsText,
                        setProgramHighlightsText,
                      )
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Highlight
                  </Button>
                </div>
                {(fromLineText(programHighlightsText).length > 0
                  ? fromLineText(programHighlightsText)
                  : [""]
                ).map((item, index) => (
                  <div
                    key={`program-highlight-${index}`}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Program highlight"
                      value={item}
                      onChange={(e) =>
                        updateLineRow(
                          programHighlightsText,
                          setProgramHighlightsText,
                          index,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removeLineRow(
                          programHighlightsText,
                          setProgramHighlightsText,
                          index,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Course Accolades</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addPipeRow(courseAccoladesText, setCourseAccoladesText, 3)
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Accolade
                  </Button>
                </div>
                {(parsePipeRowsWithColumns(courseAccoladesText, 3).length > 0
                  ? parsePipeRowsWithColumns(courseAccoladesText, 3)
                  : [["", "", ""]]
                ).map((row, rowIndex) => (
                  <div
                    key={`accolade-${rowIndex}`}
                    className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Body"
                      value={row[0]}
                      onChange={(e) =>
                        updatePipeCell(
                          courseAccoladesText,
                          setCourseAccoladesText,
                          3,
                          rowIndex,
                          0,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Rank"
                      value={row[1]}
                      onChange={(e) =>
                        updatePipeCell(
                          courseAccoladesText,
                          setCourseAccoladesText,
                          3,
                          rowIndex,
                          1,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Image"
                      value={row[2]}
                      onChange={(e) =>
                        updatePipeCell(
                          courseAccoladesText,
                          setCourseAccoladesText,
                          3,
                          rowIndex,
                          2,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removePipeRow(
                          courseAccoladesText,
                          setCourseAccoladesText,
                          3,
                          rowIndex,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 border-t pt-6 border-border/40">
                <Input
                  placeholder="Application Start (e.g. 10th June 2024)"
                  value={applicationStartDate}
                  onChange={(e) => setApplicationStartDate(e.target.value)}
                />
                <Input
                  placeholder="Application Close Date"
                  value={applicationCloseDate}
                  onChange={(e) => setApplicationCloseDate(e.target.value)}
                />
                <Input
                  placeholder="Application Close Urgency (e.g. URGENT)"
                  value={applicationCloseUrgency}
                  onChange={(e) => setApplicationCloseUrgency(e.target.value)}
                />
                <Input
                  placeholder="Class Commencement Date"
                  value={classCommencementDate}
                  onChange={(e) => setClassCommencementDate(e.target.value)}
                />
                <Input
                  className="md:col-span-2"
                  placeholder="Class Commencement Note"
                  value={classCommencementNote}
                  onChange={(e) => setClassCommencementNote(e.target.value)}
                />
              </div>

              <div className="space-y-3 border-t pt-6 border-border/40">
                <Label className="text-sm font-semibold">Curriculum</Label>
                <Input
                  placeholder="Brochure Upload"
                  value={curriculumBrochureUrl}
                  onChange={(e) => setCurriculumBrochureUrl(e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={curriculumBrochureAvailable}
                    onChange={(e) =>
                      setCurriculumBrochureAvailable(e.target.checked)
                    }
                  />
                  Brochure available
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Semesters</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addPipeRow(
                          curriculumSemestersText,
                          setCurriculumSemestersText,
                          6,
                        )
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add Semester
                    </Button>
                  </div>
                  {(parsePipeRowsWithColumns(curriculumSemestersText, 6)
                    .length > 0
                    ? parsePipeRowsWithColumns(curriculumSemestersText, 6)
                    : [["", "", "", "", "", ""]]
                  ).map((row, rowIndex) => (
                    <div
                      key={`semester-${rowIndex}`}
                      className="space-y-2 rounded-lg border border-border/50 p-3"
                    >
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input
                          placeholder="Semester"
                          value={row[0]}
                          onChange={(e) =>
                            updatePipeCell(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                              0,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Core subjects (comma separated)"
                          value={row[1]}
                          onChange={(e) =>
                            updatePipeCell(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                              1,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Specialization 1 name"
                          value={row[2]}
                          onChange={(e) =>
                            updatePipeCell(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                              2,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Specialization 1 electives (comma separated)"
                          value={row[3]}
                          onChange={(e) =>
                            updatePipeCell(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                              3,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Specialization 2 name"
                          value={row[4]}
                          onChange={(e) =>
                            updatePipeCell(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                              4,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Specialization 2 note"
                          value={row[5]}
                          onChange={(e) =>
                            updatePipeCell(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                              5,
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            removePipeRow(
                              curriculumSemestersText,
                              setCurriculumSemestersText,
                              6,
                              rowIndex,
                            )
                          }
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                {/* <Input
                  placeholder="Course Structure Total Credits"
                  value={courseStructureTotalCredits}
                  onChange={(e) => setCourseStructureTotalCredits(e.target.value)}
                /> */}
                <div className="flex items-center justify-between">
                  <Label>Course Structure Breakdown</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addPipeRow(courseStructureText, setCourseStructureText, 2)
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Track
                  </Button>
                </div>
                {(parsePipeRowsWithColumns(courseStructureText, 2).length > 0
                  ? parsePipeRowsWithColumns(courseStructureText, 2)
                  : [["", ""]]
                ).map((row, rowIndex) => (
                  <div
                    key={`course-structure-${rowIndex}`}
                    className="grid gap-2 md:grid-cols-[1.5fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Track"
                      value={row[0]}
                      onChange={(e) =>
                        updatePipeCell(
                          courseStructureText,
                          setCourseStructureText,
                          2,
                          rowIndex,
                          0,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Credits"
                      value={row[1]}
                      onChange={(e) =>
                        updatePipeCell(
                          courseStructureText,
                          setCourseStructureText,
                          2,
                          rowIndex,
                          1,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removePipeRow(
                          courseStructureText,
                          setCourseStructureText,
                          2,
                          rowIndex,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Value Added Course</Label>
                <div className="grid gap-2 md:grid-cols-4">
                  {(() => {
                    const valueAddedRow = parsePipeRowsWithColumns(
                      valueAddedCoursesText,
                      4,
                    )[0] || ["", "", "", ""];

                    return (
                      <>
                        <Input
                          placeholder="Name"
                          value={valueAddedRow[0]}
                          onChange={(e) =>
                            updatePipeCell(
                              valueAddedCoursesText,
                              setValueAddedCoursesText,
                              4,
                              0,
                              0,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Credits"
                          value={valueAddedRow[1]}
                          onChange={(e) =>
                            updatePipeCell(
                              valueAddedCoursesText,
                              setValueAddedCoursesText,
                              4,
                              0,
                              1,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Delivery Mode"
                          value={valueAddedRow[2]}
                          onChange={(e) =>
                            updatePipeCell(
                              valueAddedCoursesText,
                              setValueAddedCoursesText,
                              4,
                              0,
                              2,
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Course Type"
                          value={valueAddedRow[3]}
                          onChange={(e) =>
                            updatePipeCell(
                              valueAddedCoursesText,
                              setValueAddedCoursesText,
                              4,
                              0,
                              3,
                              e.target.value,
                            )
                          }
                        />
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Career Opportunities</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addPipeRow(
                        careerOpportunitiesText,
                        setCareerOpportunitiesText,
                        2,
                      )
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Opportunity
                  </Button>
                </div>
                {(parsePipeRowsWithColumns(careerOpportunitiesText, 2).length >
                0
                  ? parsePipeRowsWithColumns(careerOpportunitiesText, 2)
                  : [["", ""]]
                ).map((row, rowIndex) => (
                  <div
                    key={`career-opportunity-${rowIndex}`}
                    className="grid gap-2 md:grid-cols-[1.4fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Role"
                      value={row[0]}
                      onChange={(e) =>
                        updatePipeCell(
                          careerOpportunitiesText,
                          setCareerOpportunitiesText,
                          2,
                          rowIndex,
                          0,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Salary Range"
                      value={row[1]}
                      onChange={(e) =>
                        updatePipeCell(
                          careerOpportunitiesText,
                          setCareerOpportunitiesText,
                          2,
                          rowIndex,
                          1,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removePipeRow(
                          careerOpportunitiesText,
                          setCareerOpportunitiesText,
                          2,
                          rowIndex,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Higher Education and Certifications</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addHigherEducationHeading}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Heading
                  </Button>
                </div>
                {(parseHigherEducationHeadingRows(higherEducationHeadingsText)
                  .length > 0
                  ? parseHigherEducationHeadingRows(higherEducationHeadingsText)
                  : [{ title: "", descriptions: [""] }]
                ).map((row, rowIndex) => (
                  <div
                    key={`higher-education-heading-${rowIndex}`}
                    className="space-y-3 rounded-lg border border-border/50 p-3"
                  >
                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                      <Input
                        placeholder="Heading Title"
                        value={row.title}
                        onChange={(e) =>
                          updateHigherEducationHeadingTitle(
                            rowIndex,
                            e.target.value,
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeHigherEducationHeading(rowIndex)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Remove Heading
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Description Items
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            addHigherEducationDescription(rowIndex)
                          }
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add Description
                        </Button>
                      </div>
                      {(
                        (row.descriptions.length > 0
                          ? row.descriptions
                          : [""]) || [""]
                      ).map((description, descriptionIndex) => (
                        <div
                          key={`higher-education-description-${rowIndex}-${descriptionIndex}`}
                          className="grid gap-2 md:grid-cols-[1fr_auto]"
                        >
                          <Input
                            placeholder="Description"
                            value={description}
                            onChange={(e) =>
                              updateHigherEducationDescription(
                                rowIndex,
                                descriptionIndex,
                                e.target.value,
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              removeHigherEducationDescription(
                                rowIndex,
                                descriptionIndex,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Flexible Exit Options</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addPipeRow(exitOptionsText, setExitOptionsText, 2)
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Exit Option
                  </Button>
                </div>
                {(parsePipeRowsWithColumns(exitOptionsText, 2).length > 0
                  ? parsePipeRowsWithColumns(exitOptionsText, 2)
                  : [["", ""]]
                ).map((row, rowIndex) => (
                  <div
                    key={`exit-option-${rowIndex}`}
                    className="grid gap-2 md:grid-cols-[1fr_1.6fr_auto]"
                  >
                    <Input
                      placeholder="After years"
                      value={row[0]}
                      onChange={(e) =>
                        updatePipeCell(
                          exitOptionsText,
                          setExitOptionsText,
                          2,
                          rowIndex,
                          0,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Credential"
                      value={row[1]}
                      onChange={(e) =>
                        updatePipeCell(
                          exitOptionsText,
                          setExitOptionsText,
                          2,
                          rowIndex,
                          1,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removePipeRow(
                          exitOptionsText,
                          setExitOptionsText,
                          2,
                          rowIndex,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Input
                  placeholder="Class Timings Mode (e.g. Regular Classes)"
                  value={classTimingsMode}
                  onChange={(e) => setClassTimingsMode(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <Label>Class Timings Schedule</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addPipeRow(classTimingsText, setClassTimingsText, 3)
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Day
                  </Button>
                </div>
                {(parsePipeRowsWithColumns(classTimingsText, 3).length > 0
                  ? parsePipeRowsWithColumns(classTimingsText, 3)
                  : [["", "", ""]]
                ).map((row, rowIndex) => (
                  <div
                    key={`class-timing-${rowIndex}`}
                    className="grid gap-2 md:grid-cols-[1fr_1.3fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Day"
                      value={row[0]}
                      onChange={(e) =>
                        updatePipeCell(
                          classTimingsText,
                          setClassTimingsText,
                          3,
                          rowIndex,
                          0,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Timing"
                      value={row[1]}
                      onChange={(e) =>
                        updatePipeCell(
                          classTimingsText,
                          setClassTimingsText,
                          3,
                          rowIndex,
                          1,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Status (open/closed)"
                      value={row[2]}
                      onChange={(e) =>
                        updatePipeCell(
                          classTimingsText,
                          setClassTimingsText,
                          3,
                          rowIndex,
                          2,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removePipeRow(
                          classTimingsText,
                          setClassTimingsText,
                          3,
                          rowIndex,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3 border-t pt-6 border-border/40">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Industry Tools</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addLineRow(industryToolsText, setIndustryToolsText)
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {(parseEditableLineRows(industryToolsText).length > 0
                    ? parseEditableLineRows(industryToolsText)
                    : [""]
                  ).map((item, index) => (
                    <div key={`industry-tool-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Tool"
                        value={item}
                        onChange={(e) =>
                          updateLineRow(
                            industryToolsText,
                            setIndustryToolsText,
                            index,
                            e.target.value,
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() =>
                          removeLineRow(
                            industryToolsText,
                            setIndustryToolsText,
                            index,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Lab Facilities</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addLineRow(labFacilitiesText, setLabFacilitiesText)
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {(parseEditableLineRows(labFacilitiesText).length > 0
                    ? parseEditableLineRows(labFacilitiesText)
                    : [""]
                  ).map((item, index) => (
                    <div key={`lab-facility-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Lab facility"
                        value={item}
                        onChange={(e) =>
                          updateLineRow(
                            labFacilitiesText,
                            setLabFacilitiesText,
                            index,
                            e.target.value,
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() =>
                          removeLineRow(
                            labFacilitiesText,
                            setLabFacilitiesText,
                            index,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Classroom Facilities</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addLineRow(
                          classroomFacilitiesText,
                          setClassroomFacilitiesText,
                        )
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {(parseEditableLineRows(classroomFacilitiesText).length > 0
                    ? parseEditableLineRows(classroomFacilitiesText)
                    : [""]
                  ).map((item, index) => (
                    <div
                      key={`classroom-facility-${index}`}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Classroom facility"
                        value={item}
                        onChange={(e) =>
                          updateLineRow(
                            classroomFacilitiesText,
                            setClassroomFacilitiesText,
                            index,
                            e.target.value,
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() =>
                          removeLineRow(
                            classroomFacilitiesText,
                            setClassroomFacilitiesText,
                            index,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Bonus Certification</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addBonusCertificationRow}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Certification
                  </Button>
                </div>
                {(parseBonusCertificationRows(bonusCertificationText).length > 0
                  ? parseBonusCertificationRows(bonusCertificationText)
                  : [
                      {
                        name: "",
                        note: "",
                        certificateDetailsAvailable: "false",
                        detailsPage: "",
                      },
                    ]
                ).map((row, rowIndex) => (
                  <div
                    key={`bonus-certification-${rowIndex}`}
                    className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto_auto]"
                  >
                    <Input
                      placeholder="Certification Name"
                      value={row.name}
                      onChange={(e) =>
                        updatePipeCell(
                          bonusCertificationText,
                          setBonusCertificationText,
                          4,
                          rowIndex,
                          0,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Certification Note"
                      value={row.note}
                      onChange={(e) =>
                        updatePipeCell(
                          bonusCertificationText,
                          setBonusCertificationText,
                          4,
                          rowIndex,
                          1,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Details Page URL"
                      value={row.detailsPage}
                      onChange={(e) =>
                        updatePipeCell(
                          bonusCertificationText,
                          setBonusCertificationText,
                          4,
                          rowIndex,
                          3,
                          e.target.value,
                        )
                      }
                    />
                    <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={
                          String(
                            row.certificateDetailsAvailable,
                          ).toLowerCase() === "true"
                        }
                        onChange={(e) =>
                          updatePipeCell(
                            bonusCertificationText,
                            setBonusCertificationText,
                            4,
                            rowIndex,
                            2,
                            String(e.target.checked),
                          )
                        }
                      />
                      Details Available
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removePipeRow(
                          bonusCertificationText,
                          setBonusCertificationText,
                          4,
                          rowIndex,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>Featured Alumni</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addFeaturedAlumniRow}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Alumni
                  </Button>
                </div>
                {(parseFeaturedAlumniRows(featuredAlumniText).length > 0
                  ? parseFeaturedAlumniRows(featuredAlumniText)
                  : [
                      {
                        name: "",
                        designation: "",
                        progressions: [{ year: "", milestone: "" }],
                      },
                    ]
                ).map((row, rowIndex) => (
                  <div
                    key={`featured-alumni-${rowIndex}`}
                    className="space-y-3 rounded-lg border border-border/50 p-3"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input
                        placeholder="Name"
                        value={row.name}
                        onChange={(e) =>
                          updateFeaturedAlumniField(
                            rowIndex,
                            "name",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="Designation"
                        value={row.designation}
                        onChange={(e) =>
                          updateFeaturedAlumniField(
                            rowIndex,
                            "designation",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Career Progression
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addFeaturedAlumniProgression(rowIndex)}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add Progression
                        </Button>
                      </div>
                      {(row.progressions.length > 0
                        ? row.progressions
                        : [{ year: "", milestone: "" }]
                      ).map((progression, progressionIndex) => (
                        <div
                          key={`alumni-progression-${rowIndex}-${progressionIndex}`}
                          className="grid gap-2 md:grid-cols-[180px_1fr_auto]"
                        >
                          <Input
                            placeholder="Year"
                            value={progression.year}
                            onChange={(e) =>
                              updateFeaturedAlumniProgression(
                                rowIndex,
                                progressionIndex,
                                "year",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Milestone"
                            value={progression.milestone}
                            onChange={(e) =>
                              updateFeaturedAlumniProgression(
                                rowIndex,
                                progressionIndex,
                                "milestone",
                                e.target.value,
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              removeFeaturedAlumniProgression(
                                rowIndex,
                                progressionIndex,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeFeaturedAlumniRow(rowIndex)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <div className="flex items-center justify-between">
                  <Label>FAQs</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addFaqRow}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add FAQ
                  </Button>
                </div>
                {parseEditableFaqRows(faqsText).map((row, index) => (
                  <div
                    key={`faq-${index}`}
                    className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <Input
                      placeholder="FAQ Title"
                      value={row[0] || ""}
                      onChange={(e) => updateFaqRow(index, 0, e.target.value)}
                    />
                    <Input
                      placeholder="FAQ Description"
                      value={row[1] || ""}
                      onChange={(e) => updateFaqRow(index, 1, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeFaqRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 border-t pt-6 border-border/40">
                <Input
                  placeholder="Student Forum Description"
                  value={studentForumDescription}
                  onChange={(e) => setStudentForumDescription(e.target.value)}
                />
                <Input
                  placeholder="Student Forum CTA"
                  value={studentForumCtaLabel}
                  onChange={(e) => setStudentForumCtaLabel(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "other_courses_offered" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Other Courses</CardTitle>
              <CardDescription>
                Manage all courses and group them by study level. Courses added
                in Academics Catalog are auto-synced here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <input
                  type="hidden"
                  {...register("profileSections.other_courses_offered.id")}
                />
                <input
                  type="checkbox"
                  id="other-courses-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("profileSections.other_courses_offered.enabled")}
                />
                <Label htmlFor="other-courses-enabled">
                  Show this section on public profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-courses-summary">Section Summary</Label>
                <Textarea
                  id="other-courses-summary"
                  placeholder="Describe your UG, PG, and advanced course offerings."
                  {...register("profileSections.other_courses_offered.summary")}
                />
              </div>

              <div className="border-t pt-6 border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    New Course Details
                  </Label>
                </div>

                <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-border/50 p-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Course Name</Label>
                    <Input
                      placeholder="e.g. Bachelor of Technology in Computer Science"
                      value={newOtherCourseForm.name}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input
                      placeholder="e.g. BTECH-CS"
                      value={newOtherCourseForm.code}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          code: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Discipline</Label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newOtherCourseForm.disciplineId}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          disciplineId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select discipline</option>
                      {disciplines.map((discipline) => (
                        <option key={discipline.id} value={discipline.id}>
                          {discipline.name} ({discipline.streamName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Study Level</Label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newOtherCourseForm.studyLevelId}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          studyLevelId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select level</option>
                      {studyLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Program Type</Label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newOtherCourseForm.programTypeId}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          programTypeId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select type</option>
                      {programTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Campus (optional)</Label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newOtherCourseForm.campusId}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          campusId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select campus</option>
                      {campuses.map((campus) => (
                        <option key={campus.id} value={campus.id}>
                          {campus.name} {campus.isMainCampus ? "(Main)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Study Mode</Label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newOtherCourseForm.studyMode}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          studyMode: e.target.value,
                        }))
                      }
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (optional)</Label>
                    <Input
                      placeholder="e.g. 4 Years"
                      value={newOtherCourseForm.duration}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Eligibility (optional)</Label>
                    <Input
                      placeholder="e.g. 10+2 with PCM"
                      value={newOtherCourseForm.eligibility}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          eligibility: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Intake Capacity (optional)</Label>
                    <Input
                      type="number"
                      value={newOtherCourseForm.intakeCapacity}
                      onChange={(e) =>
                        setNewOtherCourseForm((prev) => ({
                          ...prev,
                          intakeCapacity: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleAddOtherCourse}
                      disabled={isCreatingCourse}
                    >
                      {isCreatingCourse && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add Course
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB: GENERIC SECTIONS ==================== */}
        {isGenericSectionTab(activeTab) &&
          ![
            "faculty",
            "clubs_associations",
            "happenings",
            "alliance",
            "institutions_across_world",
          ].includes(activeTab) && (
            <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>
                  {ONBOARDING_TABS.find((tab) => tab.id === activeTab)?.label ||
                    "Section"}
                </CardTitle>
                <CardDescription>
                  Manage visibility and summary content for this section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <input
                    type="hidden"
                    {...register(`profileSections.${activeTab}.id` as const)}
                  />
                  <input
                    type="checkbox"
                    id={`generic-enabled-${activeTab}`}
                    className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                    {...register(
                      `profileSections.${activeTab}.enabled` as const,
                    )}
                  />
                  <Label htmlFor={`generic-enabled-${activeTab}`}>
                    Show this section on public profile
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`generic-summary-${activeTab}`}>
                    Section Summary
                  </Label>
                  <Textarea
                    id={`generic-summary-${activeTab}`}
                    placeholder="Add section summary content..."
                    {...register(
                      `profileSections.${activeTab}.summary` as const,
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

        {/* Global save actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Progress
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={() => {
              void handleSubmit(onSubmitAndContinue, onInvalidSubmit)();
            }}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
