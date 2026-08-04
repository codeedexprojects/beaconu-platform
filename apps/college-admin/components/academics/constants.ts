import {
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  FileText,
  Building,
  Award,
  Globe,
  Star,
  Layers,
  DollarSign,
  Check,
  ShieldCheck,
  Sparkles,
  Percent,
} from "lucide-react";

export const COURSE_TABS = [
  {
    id: "basic",
    label: "Basic Details",
    icon: BookOpen,
    desc: "Primary course settings, stream, mode, and eligibility",
  },
  {
    id: "course_quotas",
    label: "Quotas & Fees",
    icon: Percent,
    desc: "Attach quota categories and configure fee reductions",
  },
  {
    id: "course_info",
    label: "Course Info",
    icon: Compass,
    desc: "Key highlights, timings, exit options, and labs",
  },
  {
    id: "admission_policy",
    label: "Admission Policy",
    icon: GraduationCap,
    desc: "Intake capacities, seat matrix, and entrance exams",
  },
  {
    id: "eligibility_criteria",
    label: "Eligibility Criteria",
    icon: Check,
    desc: "Candidate qualification rules and custom filtering options",
  },
  {
    id: "placements",
    label: "Placements",
    icon: Briefcase,
    desc: "Salary package stats and top hiring recruiters",
  },
  {
    id: "fees",
    label: "Fees & Dues",
    icon: DollarSign,
    desc: "Tuition, one-time fees, and semester structures",
  },
  {
    id: "financial_aid",
    label: "Financial Aid",
    icon: Award,
    desc: "Merit scholarships and upfront concessions",
  },
  {
    id: "student_housing",
    label: "Student Housing",
    icon: Building,
    desc: "Hostel rooms, mess details, and housing rules",
  },
  {
    id: "exam_policy",
    label: "Exam Policy",
    icon: FileText,
    desc: "Internal/External marks weights and grading rules",
  },
  {
    id: "faculty",
    label: "Faculty Directory",
    icon: Users,
    desc: "Professors, designations, and academic experience",
  },
  {
    id: "review",
    label: "Student Reviews",
    icon: Star,
    desc: "Average rating score and student feedback comments",
  },
  {
    id: "library",
    label: "Library Assets",
    icon: BookOpen,
    desc: "Book volumes, digital journals, and library details",
  },
  {
    id: "clubs_associations",
    label: "Clubs & Groups",
    icon: Sparkles,
    desc: "Student societies, associations, and clubs",
  },
  {
    id: "alliance",
    label: "Alliances & Ties",
    icon: Globe,
    desc: "Industrial and global academic partnerships",
  },
  {
    id: "other_courses_offered",
    label: "Other Options",
    icon: Layers,
    desc: "Alternate pathways and related course linkages",
  },
  {
    id: "demo_graphics",
    label: "Demographics",
    icon: Users,
    desc: "Gender ratio, state diversity, and stats",
  },
  {
    id: "accreditations",
    label: "Accreditations",
    icon: Award,
    desc: "Accreditations, ranking approvals, and year details",
  },
  {
    id: "entrance_exam_eligibility",
    label: "Exam Eligibility",
    icon: ShieldCheck,
    desc: "National/State entrance exams and qualification marks",
  },
] as const;

export type CourseTabId = (typeof COURSE_TABS)[number]["id"];

export const CLASS_TIMING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
