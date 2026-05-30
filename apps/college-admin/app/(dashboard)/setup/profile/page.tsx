"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  useCollegeProfile,
  useMyInstitutionGroup,
  useUpdateCollegeProfile,
} from "@/hooks/use-colleges";
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
  facilities: z.array(z.string()).default([]),
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
  courseHeader: z.object({
    courseName: z.string().default(""),
    admissionCycle: z.array(z.string()).default([]),
    admissionStatus: z.string().default(""),
    seatAvailabilityPercent: z.number().default(0),
    seatAvailabilityMessage: z.string().default(""),
    duration: z.string().default(""),
    studyMode: z.string().default(""),
    academicCycle: z.string().default(""),
    credits: z.number().default(0),
    genderAccepted: z.string().default(""),
    courseCategory: z.string().default(""),
  }),
  programHighlights: z
    .array(
      z.object({
        description: z.string().default(""),
      }),
    )
    .default([]),
  courseAccolades: z
    .array(
      z.object({
        title: z.string().default(""),
        description: z.string().default(""),
      }),
    )
    .default([]),
  importantDates: z
    .array(
      z.object({
        event: z.string().default(""),
        date: z.string().default(""),
        tag: z.string().default(""),
      }),
    )
    .default([]),
  curriculum: z.object({
    brochureUrl: z.string().default(""),
    semesters: z
      .array(
        z.object({
          semester: z.number().default(0),
          subjects: z.array(z.string()).default([]),
          specializations: z.array(z.string()).default([]),
        }),
      )
      .default([]),
  }),
  courseStructure: z
    .array(
      z.object({
        component: z.string().default(""),
        credits: z.number().default(0),
      }),
    )
    .default([]),
  valueAddedCourses: z
    .array(
      z.object({
        courseName: z.string().default(""),
        credits: z.string().default(""),
        deliveryMode: z.string().default(""),
      }),
    )
    .default([]),
  careerOpportunities: z
    .array(
      z.object({
        role: z.string().default(""),
        salaryRange: z.string().default(""),
      }),
    )
    .default([]),
  higherEducation: z.object({
    globalCertifications: z.array(z.string()).default([]),
    higherStudies: z.array(z.string()).default([]),
  }),
  exitOptions: z
    .array(
      z.object({
        after: z.string().default(""),
        credential: z.string().default(""),
      }),
    )
    .default([]),
  classTimings: z
    .array(
      z.object({
        day: z.string().default(""),
        timing: z.string().default(""),
      }),
    )
    .default([]),
  industryTools: z.array(z.string()).default([]),
  labFacilities: z.array(z.string()).default([]),
  classroomFacilities: z.array(z.string()).default([]),
  bonusCertification: z.object({
    title: z.string().default(""),
    description: z.string().default(""),
    certificateUrl: z.string().default(""),
  }),
  featuredAlumni: z
    .array(
      z.object({
        name: z.string().default(""),
        designation: z.string().default(""),
        journeyTimeline: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().default(""),
        answer: z.string().default(""),
      }),
    )
    .default([]),
  studentForum: z.object({
    description: z.string().default(""),
    ctaLabel: z.string().default(""),
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

// Define a unified form schema supporting Basic info & complex profileSections
const profileFormSchema = z.object({
  name: z.string().min(2, "College name is required"),
  code: z.string().min(2, "College code is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  pinCode: z.string().min(6, "Valid PIN code is required"),
  logoUrl: z
    .string()
    .url("Enter a valid logo URL")
    .optional()
    .or(z.literal("")),
  coverImageUrl: z
    .string()
    .url("Enter a valid cover image URL")
    .optional()
    .or(z.literal("")),
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
      eligibilitySummary: z.string().default(""),
      course_details: otherCoursesOfferedSectionSchema.omit({
        id: true,
        enabled: true,
      }),
    }),
    admission_policy: z.object({
      id: z.string().min(1).default(PROFILE_SECTION_IDS.admission_policy),
      enabled: z.boolean().default(true),
      policySummary: z.string().default(""),
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

export default function SetupProfilePage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const { data: profile, isLoading } = useCollegeProfile();
  const { data: institutionGroupData, isLoading: isInstitutionGroupLoading } =
    useMyInstitutionGroup();
  const { mutate: updateProfile, isPending } = useUpdateCollegeProfile();

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
  const [campusReels, setCampusReels] = useState<
    { title: string; link: string }[]
  >([]);

  const [seatMatrix, setSeatMatrix] = useState<
    { quota: string; total: string; open: string }[]
  >([]);
  const [eligibilityCriteria, setEligibilityCriteria] = useState<
    { studentType: string; criteria: string }[]
  >([]);
  const [admissionRequirements, setAdmissionRequirements] = useState<
    { title: string; description: string }[]
  >([]);
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
  const [libraryResourcesText, setLibraryResourcesText] = useState("");
  const [libraryHoursText, setLibraryHoursText] = useState("");
  const [libraryFacilitiesText, setLibraryFacilitiesText] = useState("");

  const [conductTitle, setConductTitle] = useState("");
  const [conductRulesText, setConductRulesText] = useState("");

  const [otherCourseName, setOtherCourseName] = useState("");
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

  const [programHighlightsText, setProgramHighlightsText] = useState("");
  const [courseAccoladesText, setCourseAccoladesText] = useState("");
  const [importantDatesText, setImportantDatesText] = useState("");
  const [curriculumBrochureUrl, setCurriculumBrochureUrl] = useState("");
  const [curriculumSemestersText, setCurriculumSemestersText] = useState("");
  const [courseStructureText, setCourseStructureText] = useState("");
  const [valueAddedCoursesText, setValueAddedCoursesText] = useState("");
  const [careerOpportunitiesText, setCareerOpportunitiesText] = useState("");
  const [higherEducationCertsText, setHigherEducationCertsText] = useState("");
  const [higherEducationStudiesText, setHigherEducationStudiesText] =
    useState("");
  const [exitOptionsText, setExitOptionsText] = useState("");
  const [classTimingsText, setClassTimingsText] = useState("");
  const [industryToolsText, setIndustryToolsText] = useState("");
  const [labFacilitiesText, setLabFacilitiesText] = useState("");
  const [classroomFacilitiesText, setClassroomFacilitiesText] = useState("");
  const [bonusCertificationTitle, setBonusCertificationTitle] = useState("");
  const [bonusCertificationDescription, setBonusCertificationDescription] =
    useState("");
  const [bonusCertificationUrl, setBonusCertificationUrl] = useState("");
  const [featuredAlumniText, setFeaturedAlumniText] = useState("");
  const [faqsText, setFaqsText] = useState("");
  const [studentForumDescription, setStudentForumDescription] = useState("");
  const [studentForumCtaLabel, setStudentForumCtaLabel] = useState("");

  const [placementStats, setPlacementStats] = useState<
    { title: string; value: string }[]
  >([]);
  const [placementTrends, setPlacementTrends] = useState<
    { year: string; averagePackage: string; highestPackage: string }[]
  >([]);
  const [notableOffers, setNotableOffers] = useState<
    { studentName: string; company: string; package: string }[]
  >([]);

  const [additionalFees, setAdditionalFees] = useState<
    { name: string; amount: string; frequency: string }[]
  >([]);
  const [installmentSchedule, setInstallmentSchedule] = useState<
    { installmentNo: string; dueDate: string; percentage: string }[]
  >([]);
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
          eligibilitySummary: "",
          course_details: {
            courseHeader: {
              courseName: "",
              admissionCycle: [],
              admissionStatus: "",
              seatAvailabilityPercent: 0,
              seatAvailabilityMessage: "",
              duration: "",
              studyMode: "",
              academicCycle: "",
              credits: 0,
              genderAccepted: "",
              courseCategory: "",
            },
            programHighlights: [],
            courseAccolades: [],
            importantDates: [],
            curriculum: {
              brochureUrl: "",
              semesters: [],
            },
            courseStructure: [],
            valueAddedCourses: [],
            careerOpportunities: [],
            higherEducation: {
              globalCertifications: [],
              higherStudies: [],
            },
            exitOptions: [],
            classTimings: [],
            industryTools: [],
            labFacilities: [],
            classroomFacilities: [],
            bonusCertification: {
              title: "",
              description: "",
              certificateUrl: "",
            },
            featuredAlumni: [],
            faqs: [],
            studentForum: {
              description: "",
              ctaLabel: "",
            },
          },
        },
        admission_policy: {
          id: PROFILE_SECTION_IDS.admission_policy,
          enabled: true,
          policySummary: "",
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
            eligibilitySummary:
              profile.profileSections?.course_info?.eligibilitySummary || "",
            course_details: profile.profileSections?.course_info
              ?.course_details ||
              profile.profileSections?.other_courses_offered || {
                courseHeader: {
                  courseName: "",
                  admissionCycle: [],
                  admissionStatus: "",
                  seatAvailabilityPercent: 0,
                  seatAvailabilityMessage: "",
                  duration: "",
                  studyMode: "",
                  academicCycle: "",
                  credits: 0,
                  genderAccepted: "",
                  courseCategory: "",
                },
                programHighlights: [],
                courseAccolades: [],
                importantDates: [],
                curriculum: {
                  brochureUrl: "",
                  semesters: [],
                },
                courseStructure: [],
                valueAddedCourses: [],
                careerOpportunities: [],
                higherEducation: {
                  globalCertifications: [],
                  higherStudies: [],
                },
                exitOptions: [],
                classTimings: [],
                industryTools: [],
                labFacilities: [],
                classroomFacilities: [],
                bonusCertification: {
                  title: "",
                  description: "",
                  certificateUrl: "",
                },
                featuredAlumni: [],
                faqs: [],
                studentForum: {
                  description: "",
                  ctaLabel: "",
                },
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
      if (
        profile.profileSections?.admission_policy?.eligibilityCriteria &&
        typeof profile.profileSections.admission_policy.eligibilityCriteria ===
          "object"
      ) {
        const criteria = profile.profileSections.admission_policy
          .eligibilityCriteria as any;
        setEligibilityCriteria(
          Array.isArray(criteria.requirements)
            ? criteria.requirements.map((item: any) => ({
                studentType: item.title || "Indian",
                criteria: item.description || "",
              }))
            : [],
        );
      } else if (
        Array.isArray(profile.profileSections?.course_info?.eligibilityCriteria)
      ) {
        setEligibilityCriteria(
          profile.profileSections.course_info.eligibilityCriteria,
        );
      }
      if (
        Array.isArray(profile.profileSections?.admission_policy?.requirements)
      ) {
        setAdmissionRequirements(
          profile.profileSections.admission_policy.requirements,
        );
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

      if (Array.isArray(profile.profileSections?.fees?.additionalFees)) {
        setAdditionalFees(profile.profileSections.fees.additionalFees);
      } else if (
        Array.isArray(profile.profileSections?.tuition_and_aid?.additionalFees)
      ) {
        setAdditionalFees(
          profile.profileSections.tuition_and_aid.additionalFees,
        );
      }
      if (Array.isArray(profile.profileSections?.fees?.installments)) {
        setInstallmentSchedule(profile.profileSections.fees.installments);
      } else if (
        Array.isArray(profile.profileSections?.tuition_and_aid?.installments)
      ) {
        setInstallmentSchedule(
          profile.profileSections.tuition_and_aid.installments,
        );
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
            facilities?: string[];
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
      setLibraryResourcesText(
        Array.isArray(librarySection?.availableResources)
          ? librarySection.availableResources
              .map((item) => `${item.resourceType || ""}|${item.count ?? 0}`)
              .join("\n")
          : "",
      );
      setLibraryHoursText(
        Array.isArray(librarySection?.libraryHours)
          ? librarySection.libraryHours
              .map(
                (item) =>
                  `${item.day || ""}|${item.workingHours || ""}|${item.transactionHours || ""}`,
              )
              .join("\n")
          : "",
      );
      setLibraryFacilitiesText(
        Array.isArray(librarySection?.facilities)
          ? librarySection.facilities.join("\n")
          : "",
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

      const otherCoursesSection =
        ((profile.profileSections?.course_info as any)?.course_details as
          | {
              courseHeader?: {
                courseName?: string;
                admissionCycle?: string[];
                admissionStatus?: string;
                seatAvailabilityPercent?: number;
                seatAvailabilityMessage?: string;
                duration?: string;
                studyMode?: string;
                academicCycle?: string;
                credits?: number;
                genderAccepted?: string;
                courseCategory?: string;
              };
              programHighlights?: { description?: string }[];
              courseAccolades?: { title?: string; description?: string }[];
              importantDates?: {
                event?: string;
                date?: string;
                tag?: string;
              }[];
              curriculum?: {
                brochureUrl?: string;
                semesters?: {
                  semester?: number;
                  subjects?: string[];
                  specializations?: string[];
                }[];
              };
              courseStructure?: { component?: string; credits?: number }[];
              valueAddedCourses?: {
                courseName?: string;
                credits?: string;
                deliveryMode?: string;
              }[];
              careerOpportunities?: { role?: string; salaryRange?: string }[];
              higherEducation?: {
                globalCertifications?: string[];
                higherStudies?: string[];
              };
              exitOptions?: { after?: string; credential?: string }[];
              classTimings?: { day?: string; timing?: string }[];
              industryTools?: string[];
              labFacilities?: string[];
              classroomFacilities?: string[];
              bonusCertification?: {
                title?: string;
                description?: string;
                certificateUrl?: string;
              };
              featuredAlumni?: {
                name?: string;
                designation?: string;
                journeyTimeline?: string[];
              }[];
              faqs?: { question?: string; answer?: string }[];
              studentForum?: { description?: string; ctaLabel?: string };
            }
          | undefined) ??
        (profile.profileSections?.other_courses_offered as
          | {
              courseHeader?: {
                courseName?: string;
                admissionCycle?: string[];
                admissionStatus?: string;
                seatAvailabilityPercent?: number;
                seatAvailabilityMessage?: string;
                duration?: string;
                studyMode?: string;
                academicCycle?: string;
                credits?: number;
                genderAccepted?: string;
                courseCategory?: string;
              };
              programHighlights?: { description?: string }[];
              courseAccolades?: { title?: string; description?: string }[];
              importantDates?: {
                event?: string;
                date?: string;
                tag?: string;
              }[];
              curriculum?: {
                brochureUrl?: string;
                semesters?: {
                  semester?: number;
                  subjects?: string[];
                  specializations?: string[];
                }[];
              };
              courseStructure?: { component?: string; credits?: number }[];
              valueAddedCourses?: {
                courseName?: string;
                credits?: string;
                deliveryMode?: string;
              }[];
              careerOpportunities?: { role?: string; salaryRange?: string }[];
              higherEducation?: {
                globalCertifications?: string[];
                higherStudies?: string[];
              };
              exitOptions?: { after?: string; credential?: string }[];
              classTimings?: { day?: string; timing?: string }[];
              industryTools?: string[];
              labFacilities?: string[];
              classroomFacilities?: string[];
              bonusCertification?: {
                title?: string;
                description?: string;
                certificateUrl?: string;
              };
              featuredAlumni?: {
                name?: string;
                designation?: string;
                journeyTimeline?: string[];
              }[];
              faqs?: { question?: string; answer?: string }[];
              studentForum?: { description?: string; ctaLabel?: string };
            }
          | undefined);

      setOtherCourseName(otherCoursesSection?.courseHeader?.courseName || "");
      setOtherAdmissionCyclesText(
        Array.isArray(otherCoursesSection?.courseHeader?.admissionCycle)
          ? otherCoursesSection.courseHeader.admissionCycle.join("\n")
          : "",
      );
      setOtherAdmissionStatus(
        otherCoursesSection?.courseHeader?.admissionStatus || "",
      );
      setOtherSeatAvailabilityPercent(
        String(otherCoursesSection?.courseHeader?.seatAvailabilityPercent ?? 0),
      );
      setOtherSeatAvailabilityMessage(
        otherCoursesSection?.courseHeader?.seatAvailabilityMessage || "",
      );
      setOtherDuration(otherCoursesSection?.courseHeader?.duration || "");
      setOtherStudyMode(otherCoursesSection?.courseHeader?.studyMode || "");
      setOtherAcademicCycle(
        otherCoursesSection?.courseHeader?.academicCycle || "",
      );
      setOtherCredits(String(otherCoursesSection?.courseHeader?.credits ?? 0));
      setOtherGenderAccepted(
        otherCoursesSection?.courseHeader?.genderAccepted || "",
      );
      setOtherCourseCategory(
        otherCoursesSection?.courseHeader?.courseCategory || "",
      );
      setProgramHighlightsText(
        Array.isArray(otherCoursesSection?.programHighlights)
          ? otherCoursesSection.programHighlights
              .map((item) => item.description || "")
              .join("\n")
          : "",
      );
      setCourseAccoladesText(
        Array.isArray(otherCoursesSection?.courseAccolades)
          ? otherCoursesSection.courseAccolades
              .map((item) => `${item.title || ""}|${item.description || ""}`)
              .join("\n")
          : "",
      );
      setImportantDatesText(
        Array.isArray(otherCoursesSection?.importantDates)
          ? otherCoursesSection.importantDates
              .map(
                (item) =>
                  `${item.event || ""}|${item.date || ""}|${item.tag || ""}`,
              )
              .join("\n")
          : "",
      );
      setCurriculumBrochureUrl(
        otherCoursesSection?.curriculum?.brochureUrl || "",
      );
      setCurriculumSemestersText(
        Array.isArray(otherCoursesSection?.curriculum?.semesters)
          ? otherCoursesSection.curriculum.semesters
              .map(
                (item) =>
                  `${item.semester ?? 0}|${(item.subjects || []).join(", ")}|${(item.specializations || []).join(", ")}`,
              )
              .join("\n")
          : "",
      );
      setCourseStructureText(
        Array.isArray(otherCoursesSection?.courseStructure)
          ? otherCoursesSection.courseStructure
              .map((item) => `${item.component || ""}|${item.credits ?? 0}`)
              .join("\n")
          : "",
      );
      setValueAddedCoursesText(
        Array.isArray(otherCoursesSection?.valueAddedCourses)
          ? otherCoursesSection.valueAddedCourses
              .map(
                (item) =>
                  `${item.courseName || ""}|${item.credits || ""}|${item.deliveryMode || ""}`,
              )
              .join("\n")
          : "",
      );
      setCareerOpportunitiesText(
        Array.isArray(otherCoursesSection?.careerOpportunities)
          ? otherCoursesSection.careerOpportunities
              .map((item) => `${item.role || ""}|${item.salaryRange || ""}`)
              .join("\n")
          : "",
      );
      setHigherEducationCertsText(
        Array.isArray(
          otherCoursesSection?.higherEducation?.globalCertifications,
        )
          ? otherCoursesSection.higherEducation.globalCertifications.join("\n")
          : "",
      );
      setHigherEducationStudiesText(
        Array.isArray(otherCoursesSection?.higherEducation?.higherStudies)
          ? otherCoursesSection.higherEducation.higherStudies.join("\n")
          : "",
      );
      setExitOptionsText(
        Array.isArray(otherCoursesSection?.exitOptions)
          ? otherCoursesSection.exitOptions
              .map((item) => `${item.after || ""}|${item.credential || ""}`)
              .join("\n")
          : "",
      );
      setClassTimingsText(
        Array.isArray(otherCoursesSection?.classTimings)
          ? otherCoursesSection.classTimings
              .map((item) => `${item.day || ""}|${item.timing || ""}`)
              .join("\n")
          : "",
      );
      setIndustryToolsText(
        Array.isArray(otherCoursesSection?.industryTools)
          ? otherCoursesSection.industryTools.join("\n")
          : "",
      );
      setLabFacilitiesText(
        Array.isArray(otherCoursesSection?.labFacilities)
          ? otherCoursesSection.labFacilities.join("\n")
          : "",
      );
      setClassroomFacilitiesText(
        Array.isArray(otherCoursesSection?.classroomFacilities)
          ? otherCoursesSection.classroomFacilities.join("\n")
          : "",
      );
      setBonusCertificationTitle(
        otherCoursesSection?.bonusCertification?.title || "",
      );
      setBonusCertificationDescription(
        otherCoursesSection?.bonusCertification?.description || "",
      );
      setBonusCertificationUrl(
        otherCoursesSection?.bonusCertification?.certificateUrl || "",
      );
      setFeaturedAlumniText(
        Array.isArray(otherCoursesSection?.featuredAlumni)
          ? otherCoursesSection.featuredAlumni
              .map(
                (item) =>
                  `${item.name || ""}|${item.designation || ""}|${(item.journeyTimeline || []).join(";")}`,
              )
              .join("\n")
          : "",
      );
      setFaqsText(
        Array.isArray(otherCoursesSection?.faqs)
          ? otherCoursesSection.faqs
              .map((item) => `${item.question || ""}|${item.answer || ""}`)
              .join("\n")
          : "",
      );
      setStudentForumDescription(
        otherCoursesSection?.studentForum?.description || "",
      );
      setStudentForumCtaLabel(
        otherCoursesSection?.studentForum?.ctaLabel || "",
      );
    }
  }, [profile, reset]);

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

    const libraryResourceRows = parsePipeRows(libraryResourcesText)
      .filter((row) => row[0])
      .map(([resourceType, count]) => ({
        resourceType,
        count: safeNumber(count || "0"),
      }));
    const libraryHourRows = parsePipeRows(libraryHoursText)
      .filter((row) => row[0] || row[1] || row[2])
      .map(([day, workingHours, transactionHours]) => ({
        day: day || "",
        workingHours: workingHours || "",
        transactionHours: transactionHours || "",
      }));

    const conductRuleRows = parsePipeRows(conductRulesText)
      .filter((row) => row[0] || row[1])
      .map(([order, rule]) => ({
        order: safeNumber(order || "0"),
        rule: rule || "",
      }));

    const curriculumSemesterRows = parsePipeRows(curriculumSemestersText)
      .filter((row) => row[0] || row[1] || row[2])
      .map(([semester, subjects, specializations]) => ({
        semester: safeNumber(semester || "0"),
        subjects: (subjects || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        specializations: (specializations || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }));

    const featuredAlumniRows = parsePipeRows(featuredAlumniText)
      .filter((row) => row[0] || row[1] || row[2])
      .map(([name, designation, journeyTimeline]) => ({
        name: name || "",
        designation: designation || "",
        journeyTimeline: (journeyTimeline || "")
          .split(";")
          .map((item) => item.trim())
          .filter(Boolean),
      }));

    const profileSectionsPayload = {
      ...data.profileSections,
      college_overview: {
        ...normalizedOverview,
        aminities: amenities,
        nearby_access: {
          transit: transitAccess,
          essentials: essentialsAccess,
        },
        campus_reels: campusReels,
      },
      course_info: {
        ...normalizedCourseInfo,
        course_details: {
          courseHeader: {
            courseName: otherCourseName,
            admissionCycle: fromLineText(otherAdmissionCyclesText),
            admissionStatus: otherAdmissionStatus,
            seatAvailabilityPercent: safeNumber(otherSeatAvailabilityPercent),
            seatAvailabilityMessage: otherSeatAvailabilityMessage,
            duration: otherDuration,
            studyMode: otherStudyMode,
            academicCycle: otherAcademicCycle,
            credits: safeNumber(otherCredits),
            genderAccepted: otherGenderAccepted,
            courseCategory: otherCourseCategory,
          },
          programHighlights: fromLineText(programHighlightsText).map(
            (description) => ({ description }),
          ),
          courseAccolades: parsePipeRows(courseAccoladesText)
            .filter((row) => row[0] || row[1])
            .map(([title, description]) => ({
              title: title || "",
              description: description || "",
            })),
          importantDates: parsePipeRows(importantDatesText)
            .filter((row) => row[0] || row[1] || row[2])
            .map(([event, date, tag]) => ({
              event: event || "",
              date: date || "",
              tag: tag || "",
            })),
          curriculum: {
            brochureUrl: curriculumBrochureUrl,
            semesters: curriculumSemesterRows,
          },
          courseStructure: parsePipeRows(courseStructureText)
            .filter((row) => row[0] || row[1])
            .map(([component, credits]) => ({
              component: component || "",
              credits: safeNumber(credits || "0"),
            })),
          valueAddedCourses: parsePipeRows(valueAddedCoursesText)
            .filter((row) => row[0] || row[1] || row[2])
            .map(([courseName, credits, deliveryMode]) => ({
              courseName: courseName || "",
              credits: credits || "",
              deliveryMode: deliveryMode || "",
            })),
          careerOpportunities: parsePipeRows(careerOpportunitiesText)
            .filter((row) => row[0] || row[1])
            .map(([role, salaryRange]) => ({
              role: role || "",
              salaryRange: salaryRange || "",
            })),
          higherEducation: {
            globalCertifications: fromLineText(higherEducationCertsText),
            higherStudies: fromLineText(higherEducationStudiesText),
          },
          exitOptions: parsePipeRows(exitOptionsText)
            .filter((row) => row[0] || row[1])
            .map(([after, credential]) => ({
              after: after || "",
              credential: credential || "",
            })),
          classTimings: parsePipeRows(classTimingsText)
            .filter((row) => row[0] || row[1])
            .map(([day, timing]) => ({
              day: day || "",
              timing: timing || "",
            })),
          industryTools: fromLineText(industryToolsText),
          labFacilities: fromLineText(labFacilitiesText),
          classroomFacilities: fromLineText(classroomFacilitiesText),
          bonusCertification: {
            title: bonusCertificationTitle,
            description: bonusCertificationDescription,
            certificateUrl: bonusCertificationUrl,
          },
          featuredAlumni: featuredAlumniRows,
          faqs: parsePipeRows(faqsText)
            .filter((row) => row[0] || row[1])
            .map(([question, answer]) => ({
              question: question || "",
              answer: answer || "",
            })),
          studentForum: {
            description: studentForumDescription,
            ctaLabel: studentForumCtaLabel,
          },
        },
      },
      admission_policy: {
        ...normalizedAdmissionPolicy,
        seatMatrix: seatMatrix.map((row) => ({
          quotaCategory: row.quota,
          total: row.total,
          open: row.open,
        })),
        eligibilityCriteria: {
          studentTypes: Array.from(
            new Set(eligibilityCriteria.map((item) => item.studentType)),
          ),
          quotaCategories: [],
          requirements: eligibilityCriteria
            .filter((item) => item.criteria.trim().length > 0)
            .map((item) => ({
              title: item.studentType,
              description: item.criteria,
            })),
        },
        requirements: admissionRequirements,
        entranceExams: {
          nationalLevel: nationalExams,
          stateLevel: stateExams,
          institutionalLevel: institutionalExams,
        },
      },
      placements: {
        ...normalizedPlacements,
        placementStats: placementStats,
        placementTrends: placementTrends,
        notableOffers: notableOffers,
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
        additionalFees: additionalFees,
        installments: installmentSchedule,
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
        availableResources: libraryResourceRows,
        libraryHours: libraryHourRows,
        facilities: fromLineText(libraryFacilitiesText),
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input id="name" {...register("name")} />
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
                  <Input id="address" {...register("address")} />
                  {errors.address && (
                    <p className="text-xs text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" {...register("district")} />
                  {errors.district && (
                    <p className="text-xs text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} />
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input id="pinCode" {...register("pinCode")} />
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
                <CardTitle>College Experience & Vibes</CardTitle>
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

                <div className="grid gap-6 md:grid-cols-2 border-t pt-6 border-border/40">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" /> Accreditation &
                      Affiliations
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="accred-img">Badge Image URL</Label>
                      <Input
                        id="accred-img"
                        placeholder="https://example.com/naac.png"
                        {...register(
                          "profileSections.college_overview.accreditation_and_affilation.img",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accred-desc">Accreditation Summary</Label>
                      <Textarea
                        id="accred-desc"
                        placeholder="NAAC A++ Grade, AICTE Approved..."
                        {...register(
                          "profileSections.college_overview.accreditation_and_affilation.description",
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" /> Inside Campus
                      Highlights
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="campus-img">Highlight Cover URL</Label>
                      <Input
                        id="campus-img"
                        placeholder="https://example.com/campus-life.jpg"
                        {...register(
                          "profileSections.college_overview.inside_campus.img",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus-desc">Inside Campus Vibe</Label>
                      <Textarea
                        id="campus-desc"
                        placeholder="Modern high-tech corridors, interactive smart boards, greenery..."
                        {...register(
                          "profileSections.college_overview.inside_campus.description",
                        )}
                      />
                    </div>
                  </div>
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

                {/* Transit & Essentials accessibility grids */}
                <div className="grid gap-6 md:grid-cols-2 border-t pt-6 border-border/40">
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
                    <div key={idx} className="flex gap-4 items-center">
                      <Input
                        placeholder="Reel Title (e.g. Campus tour)"
                        className="h-9 text-xs"
                        value={reel.title}
                        onChange={(e) => {
                          const updated = [...campusReels];
                          updated[idx].title = e.target.value;
                          setCampusReels(updated);
                        }}
                      />
                      <Input
                        placeholder="Video Link (e.g. https://youtube.com/shorts/...)"
                        className="h-9 text-xs flex-1"
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

                {/* Social links */}
                <div className="grid gap-6 md:grid-cols-2 border-t pt-6 border-border/40">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url">LinkedIn Profile</Label>
                    <Input
                      id="linkedin-url"
                      placeholder="https://linkedin.com/school/..."
                      {...register(
                        "profileSections.college_overview.connect.linkedin",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insta-url">Instagram Page</Label>
                    <Input
                      id="insta-url"
                      placeholder="https://instagram.com/..."
                      {...register(
                        "profileSections.college_overview.connect.instagram",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-url">Twitter / X Handle</Label>
                    <Input
                      id="twitter-url"
                      placeholder="https://twitter.com/..."
                      {...register(
                        "profileSections.college_overview.connect.twitter",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website-url">Official Website</Label>
                    <Input
                      id="website-url"
                      placeholder="https://example.edu"
                      {...register(
                        "profileSections.college_overview.connect.website",
                      )}
                    />
                  </div>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEligibilityCriteria([
                        ...eligibilityCriteria,
                        { studentType: "Indian Local", criteria: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Eligibility
                  </Button>
                </div>
                {eligibilityCriteria.map((row, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm w-44"
                      value={row.studentType}
                      onChange={(e) => {
                        const updated = [...eligibilityCriteria];
                        updated[idx].studentType = e.target.value;
                        setEligibilityCriteria(updated);
                      }}
                    >
                      <option value="Indian Local">Indian (Local)</option>
                      <option value="State Resident">State Resident</option>
                      <option value="International">International</option>
                      <option value="Quota Specific">Quota Specific</option>
                    </select>
                    <Input
                      placeholder="Minimum 60% in 12th Board examinations..."
                      className="h-9 flex-1"
                      value={row.criteria}
                      onChange={(e) => {
                        const updated = [...eligibilityCriteria];
                        updated[idx].criteria = e.target.value;
                        setEligibilityCriteria(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setEligibilityCriteria(
                          eligibilityCriteria.filter((_, i) => i !== idx),
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
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Admission Requirements
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAdmissionRequirements([
                        ...admissionRequirements,
                        { title: "", description: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Requirement
                  </Button>
                </div>
                {admissionRequirements.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-4 items-center"
                  >
                    <Input
                      placeholder="Title (e.g. Academic Grades)"
                      className="h-9"
                      value={row.title}
                      onChange={(e) => {
                        const updated = [...admissionRequirements];
                        updated[idx].title = e.target.value;
                        setAdmissionRequirements(updated);
                      }}
                    />
                    <Input
                      placeholder="Description"
                      className="h-9"
                      value={row.description}
                      onChange={(e) => {
                        const updated = [...admissionRequirements];
                        updated[idx].description = e.target.value;
                        setAdmissionRequirements(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setAdmissionRequirements(
                          admissionRequirements.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
                Upload stats to show off average packages and notable corporate
                offers.
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="placement-rep">
                    Placement Report (PDF Link)
                  </Label>
                  <Input
                    id="placement-rep"
                    placeholder="https://example.com/placement-report.pdf"
                    {...register(
                      "profileSections.placements.placementReportUrl",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement-grow">
                    Placement Success/Growth Summary
                  </Label>
                  <Input
                    id="placement-grow"
                    placeholder="35% increase in placement offers over last academic cycle..."
                    {...register("profileSections.placements.growthSummary")}
                  />
                </div>
              </div>

              {/* Placement stats */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" /> Placement
                    Quick Stats
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPlacementStats([
                        ...placementStats,
                        { title: "", value: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
                  </Button>
                </div>
                {placementStats.map((row, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <Input
                      placeholder="Title (e.g. Average Package)"
                      className="h-9"
                      value={row.title}
                      onChange={(e) => {
                        const updated = [...placementStats];
                        updated[idx].title = e.target.value;
                        setPlacementStats(updated);
                      }}
                    />
                    <Input
                      placeholder="Value (e.g. 8.5 LPA)"
                      className="h-9 w-44"
                      value={row.value}
                      onChange={(e) => {
                        const updated = [...placementStats];
                        updated[idx].value = e.target.value;
                        setPlacementStats(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setPlacementStats(
                          placementStats.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Trends chart */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" /> Placement
                    Package Trends
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPlacementTrends([
                        ...placementTrends,
                        { year: "", averagePackage: "", highestPackage: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Trend Year
                  </Button>
                </div>
                {placementTrends.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="Year (e.g. 2024)"
                      className="h-9"
                      value={row.year}
                      onChange={(e) => {
                        const updated = [...placementTrends];
                        updated[idx].year = e.target.value;
                        setPlacementTrends(updated);
                      }}
                    />
                    <Input
                      placeholder="Average (LPA)"
                      className="h-9"
                      value={row.averagePackage}
                      onChange={(e) => {
                        const updated = [...placementTrends];
                        updated[idx].averagePackage = e.target.value;
                        setPlacementTrends(updated);
                      }}
                    />
                    <Input
                      placeholder="Highest (LPA)"
                      className="h-9"
                      value={row.highestPackage}
                      onChange={(e) => {
                        const updated = [...placementTrends];
                        updated[idx].highestPackage = e.target.value;
                        setPlacementTrends(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setPlacementTrends(
                          placementTrends.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Notable Offers */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" /> Outstanding
                    Placement Offers
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNotableOffers([
                        ...notableOffers,
                        { studentName: "", company: "", package: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Offer Record
                  </Button>
                </div>
                {notableOffers.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="Student Name"
                      className="h-9"
                      value={row.studentName}
                      onChange={(e) => {
                        const updated = [...notableOffers];
                        updated[idx].studentName = e.target.value;
                        setNotableOffers(updated);
                      }}
                    />
                    <Input
                      placeholder="Company"
                      className="h-9"
                      value={row.company}
                      onChange={(e) => {
                        const updated = [...notableOffers];
                        updated[idx].company = e.target.value;
                        setNotableOffers(updated);
                      }}
                    />
                    <Input
                      placeholder="Package (LPA)"
                      className="h-9"
                      value={row.package}
                      onChange={(e) => {
                        const updated = [...notableOffers];
                        updated[idx].package = e.target.value;
                        setNotableOffers(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setNotableOffers(
                          notableOffers.filter((_, i) => i !== idx),
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

              <div className="space-y-2">
                <Label htmlFor="tuition-fees-sum">Tuition Fees Overview</Label>
                <Textarea
                  id="tuition-fees-sum"
                  placeholder="General structure of yearly tuition fees per program levels..."
                  {...register("profileSections.fees.tuitionFeesSummary")}
                />
              </div>

              {/* Additional Fees */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" /> Utility /
                    Additional Charges
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAdditionalFees([
                        ...additionalFees,
                        { name: "", amount: "", frequency: "One-Time" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Charge
                  </Button>
                </div>
                {additionalFees.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="Charge Name (e.g. Admission Fee)"
                      className="h-9"
                      value={row.name}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].name = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <Input
                      placeholder="Amount"
                      className="h-9"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].amount = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      value={row.frequency}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].frequency = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    >
                      <option value="One-Time">One-Time</option>
                      <option value="Per Semester">Per Semester</option>
                      <option value="Annual">Annual</option>
                      <option value="Refundable">Refundable Deposit</option>
                    </select>
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
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

              {/* Installment Plan */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />{" "}
                    Installments Schedule & Deadlines
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setInstallmentSchedule([
                        ...installmentSchedule,
                        { installmentNo: "", dueDate: "", percentage: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Installment
                  </Button>
                </div>
                {installmentSchedule.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="No. (e.g. 1st Installment)"
                      className="h-9"
                      value={row.installmentNo}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].installmentNo = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="Due Date (e.g. July 31)"
                      className="h-9"
                      value={row.dueDate}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].dueDate = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="Percentage (e.g. 50%)"
                      className="h-9"
                      value={row.percentage}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].percentage = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
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

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="library-resources">
                  Available Resources (resourceType|count per line)
                </Label>
                <Textarea
                  id="library-resources"
                  placeholder={"Encyclopaedias|50\nJournals (Online)|6150"}
                  value={libraryResourcesText}
                  onChange={(e) => setLibraryResourcesText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="library-hours">
                  Library Hours (day|workingHours|transactionHours per line)
                </Label>
                <Textarea
                  id="library-hours"
                  placeholder={"Monday|09:00 AM - 04:30 PM|09:00 AM - 04:30 PM"}
                  value={libraryHoursText}
                  onChange={(e) => setLibraryHoursText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label htmlFor="library-facilities">
                  Facilities (one item per line)
                </Label>
                <Textarea
                  id="library-facilities"
                  placeholder={"Quiet Study Areas\nComputer Labs"}
                  value={libraryFacilitiesText}
                  onChange={(e) => setLibraryFacilitiesText(e.target.value)}
                />
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
                Configure course header, curriculum, opportunities, facilities,
                alumni, FAQs, and forum.
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

              <div className="space-y-2">
                <Label htmlFor="course-info-tab-sum">Course Info Summary</Label>
                <Textarea
                  id="course-info-tab-sum"
                  placeholder="Highlight key course details, structure and outcomes..."
                  {...register(
                    "profileSections.course_info.eligibilitySummary",
                  )}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Course Header</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Course Name"
                    value={otherCourseName}
                    onChange={(e) => setOtherCourseName(e.target.value)}
                  />
                  <Input
                    placeholder="Admission Status"
                    value={otherAdmissionStatus}
                    onChange={(e) => setOtherAdmissionStatus(e.target.value)}
                  />
                  <Input
                    placeholder="Duration"
                    value={otherDuration}
                    onChange={(e) => setOtherDuration(e.target.value)}
                  />
                  <Input
                    placeholder="Study Mode"
                    value={otherStudyMode}
                    onChange={(e) => setOtherStudyMode(e.target.value)}
                  />
                  <Input
                    placeholder="Academic Cycle"
                    value={otherAcademicCycle}
                    onChange={(e) => setOtherAcademicCycle(e.target.value)}
                  />
                  <Input
                    placeholder="Credits"
                    value={otherCredits}
                    onChange={(e) => setOtherCredits(e.target.value)}
                  />
                  <Input
                    placeholder="Gender Accepted"
                    value={otherGenderAccepted}
                    onChange={(e) => setOtherGenderAccepted(e.target.value)}
                  />
                  <Input
                    placeholder="Course Category"
                    value={otherCourseCategory}
                    onChange={(e) => setOtherCourseCategory(e.target.value)}
                  />
                  <Input
                    placeholder="Seat Availability Percent"
                    value={otherSeatAvailabilityPercent}
                    onChange={(e) =>
                      setOtherSeatAvailabilityPercent(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Seat Availability Message"
                    value={otherSeatAvailabilityMessage}
                    onChange={(e) =>
                      setOtherSeatAvailabilityMessage(e.target.value)
                    }
                  />
                </div>
                <Textarea
                  placeholder={
                    "Admission Cycles (one per line)\nAdmissions 2025\nAdmissions 2026"
                  }
                  value={otherAdmissionCyclesText}
                  onChange={(e) => setOtherAdmissionCyclesText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Program Highlights (one per line)</Label>
                <Textarea
                  value={programHighlightsText}
                  onChange={(e) => setProgramHighlightsText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Course Accolades (title|description per line)</Label>
                <Textarea
                  value={courseAccoladesText}
                  onChange={(e) => setCourseAccoladesText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Important Dates (event|date|tag per line)</Label>
                <Textarea
                  value={importantDatesText}
                  onChange={(e) => setImportantDatesText(e.target.value)}
                />
              </div>

              <div className="space-y-3 border-t pt-6 border-border/40">
                <Label className="text-sm font-semibold">Curriculum</Label>
                <Input
                  placeholder="Brochure URL"
                  value={curriculumBrochureUrl}
                  onChange={(e) => setCurriculumBrochureUrl(e.target.value)}
                />
                <Textarea
                  placeholder={
                    "Semesters (semester|subjects comma-separated|specializations comma-separated)\n1|Accounting, Economics|Finance, Marketing"
                  }
                  value={curriculumSemestersText}
                  onChange={(e) => setCurriculumSemestersText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Course Structure (component|credits per line)</Label>
                <Textarea
                  value={courseStructureText}
                  onChange={(e) => setCourseStructureText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>
                  Value Added Courses (courseName|credits|deliveryMode per line)
                </Label>
                <Textarea
                  value={valueAddedCoursesText}
                  onChange={(e) => setValueAddedCoursesText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Career Opportunities (role|salaryRange per line)</Label>
                <Textarea
                  value={careerOpportunitiesText}
                  onChange={(e) => setCareerOpportunitiesText(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 border-t pt-6 border-border/40">
                <div className="space-y-2">
                  <Label>Global Certifications (one per line)</Label>
                  <Textarea
                    value={higherEducationCertsText}
                    onChange={(e) =>
                      setHigherEducationCertsText(e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Higher Studies (one per line)</Label>
                  <Textarea
                    value={higherEducationStudiesText}
                    onChange={(e) =>
                      setHigherEducationStudiesText(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Exit Options (after|credential per line)</Label>
                <Textarea
                  value={exitOptionsText}
                  onChange={(e) => setExitOptionsText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>Class Timings (day|timing per line)</Label>
                <Textarea
                  value={classTimingsText}
                  onChange={(e) => setClassTimingsText(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3 border-t pt-6 border-border/40">
                <div className="space-y-2">
                  <Label>Industry Tools (one per line)</Label>
                  <Textarea
                    value={industryToolsText}
                    onChange={(e) => setIndustryToolsText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lab Facilities (one per line)</Label>
                  <Textarea
                    value={labFacilitiesText}
                    onChange={(e) => setLabFacilitiesText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Classroom Facilities (one per line)</Label>
                  <Textarea
                    value={classroomFacilitiesText}
                    onChange={(e) => setClassroomFacilitiesText(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 border-t pt-6 border-border/40">
                <Input
                  placeholder="Bonus Certification Title"
                  value={bonusCertificationTitle}
                  onChange={(e) => setBonusCertificationTitle(e.target.value)}
                />
                <Input
                  placeholder="Bonus Certification Description"
                  value={bonusCertificationDescription}
                  onChange={(e) =>
                    setBonusCertificationDescription(e.target.value)
                  }
                />
                <Input
                  placeholder="Certificate URL"
                  value={bonusCertificationUrl}
                  onChange={(e) => setBonusCertificationUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>
                  Featured Alumni (name|designation|journeyTimeline separated by
                  ; per line)
                </Label>
                <Textarea
                  value={featuredAlumniText}
                  onChange={(e) => setFeaturedAlumniText(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t pt-6 border-border/40">
                <Label>FAQs (question|answer per line)</Label>
                <Textarea
                  value={faqsText}
                  onChange={(e) => setFaqsText(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 border-t pt-6 border-border/40">
                <Input
                  placeholder="Student Forum Description"
                  value={studentForumDescription}
                  onChange={(e) => setStudentForumDescription(e.target.value)}
                />
                <Input
                  placeholder="Student Forum CTA Label"
                  value={studentForumCtaLabel}
                  onChange={(e) => setStudentForumCtaLabel(e.target.value)}
                />
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
              void handleSubmit(onSubmitAndContinue)();
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
