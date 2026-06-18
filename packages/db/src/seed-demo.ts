/**
 * Demo seed — Vydehi Institute of Medical Science & Research Centre
 *
 * Run:  pnpm --filter @beaconu/db seed:demo
 *
 * College admin credentials
 *   Email    : admin@vydehi.edu.in
 *   Password : Admin@123
 *
 * This script is idempotent — re-running it is safe (upsert throughout).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./index";

const COLLEGE_SLUG = "vydehi-institute";
const COLLEGE_CODE = "VIMSR";
const ADMIN_EMAIL = "admin@vydehi.edu.in";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Dr. Rajiv Menon";

const REGISTRATION_TAB_IDS = [
  "student_code_of_conduct",
  "happenings",
  "institutions_across_world",
  "commute",
  "college_overview",
] as const;

const COURSE_SETUP_TAB_IDS = [
  "course_info",
  "admission_policy",
  "placements",
  "fees",
  "financial_aid",
  "student_housing",
  "exam_policy",
  "faculty",
  "review",
  "library",
  "clubs_associations",
  "alliance",
  "other_courses_offered",
  "demo_graphics",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

function buildCourseSetupTabData(course: {
  name: string;
  code: string;
  duration: string;
  intakeCapacity: number;
  studyMode: "full_time" | "part_time" | "online";
  metadata: Record<string, unknown>;
}) {
  const totalFee =
    typeof course.metadata.totalFee === "string"
      ? course.metadata.totalFee
      : "Contact admissions";

  const highlights = Array.isArray(course.metadata.highlights)
    ? course.metadata.highlights
    : [
        `${course.name} with industry-integrated learning`,
        "Practical labs and mentorship support",
        "Career-oriented curriculum",
      ];

  return {
    course_info: {
      id: "course_info",
      enabled: true,
      course_name: course.name,
      admissions: [
        {
          year: "2024-25",
          status: "Open",
          placement_rate: "92%",
          seats_note: `${course.intakeCapacity} seats`,
          basic_details: {
            duration: course.duration,
            study_mode: course.studyMode,
            academic_cycle: "Semester",
            total_credits: 120,
            gender_accepted: "Co-Ed",
            course_category: "Professional",
          },
        },
      ],
      program_highlights: highlights,
      course_accolades: [
        {
          title: "Outcome-focused curriculum",
          body: "Designed with updated industry and academic benchmarks",
        },
      ],
      key_dates: {
        application_start: "2024-06-15",
        application_close: { date: "2024-08-15", urgency: "Limited seats" },
        class_commencement: { date: "2024-09-02", note: "Orientation week" },
      },
      curriculum: {
        brochure_upload: "",
        brochure_available: false,
        semesters: [],
        course_structure: { total_credits: 120, breakdown: [] },
      },
      value_added_course: {
        name: "Professional Communication",
        delivery_mode: "Hybrid",
        course_type: "Certificate",
        credits: 2,
      },
      career_opportunities: [
        "Research Associate",
        "Operations Executive",
        "Domain Specialist",
      ],
      higher_education_and_certifications: [
        "Postgraduate Studies",
        "Industry Certifications",
      ],
      flexible_exit_options: [],
      class_timings: {
        mode: "Weekday",
        schedule: ["09:30 AM - 01:30 PM", "02:30 PM - 04:30 PM"],
      },
      industry_tools: ["MS Excel", "Power BI", "Python"],
      lab_facilities: ["Computer Lab", "Simulation Lab"],
      classroom_facilities: ["Smart Classrooms", "Projector-enabled rooms"],
      bonus_certification: {
        name: "Industry Readiness Workshop",
        note: "Conducted with sector experts",
        certificate_details_available: true,
      },
      featured_alumni: [],
      faqs: [],
      student_forum: {
        description: "Active student clubs and peer mentorship",
        cta: "Join student communities",
      },
    },
    admission_policy: {
      id: "admission_policy",
      enabled: true,
      policySummary:
        "Admissions are merit-based with category-wise seat distribution as per regulations.",
      eligibility_criteria: {
        applicant_type_tabs: [],
        default_applicant_type: "indian",
      },
    },
    placements: {
      id: "placements",
      enabled: true,
      placementReportUrl: "",
      growthSummary: "Steady year-on-year placement and internship growth",
    },
    fees: {
      id: "fees",
      enabled: true,
      tuitionFeesSummary: `Approx total fee: ${totalFee}`,
    },
    financial_aid: {
      id: "financial_aid",
      enabled: true,
      meritScholarship: {
        title: "Merit Scholarship",
        description: "Scholarships available for top-performing applicants",
      },
      scholarshipCalculator: {
        enabled: true,
        inputs: { portOfEntry: [], rankRanges: [] },
        termsAndConditions: [],
        summary: { maxScholarship: "Up to 25%", netPayableFees: totalFee },
      },
      financialConcessions: [],
      upfrontFeeConcession: { discount: "", details: "" },
    },
    student_housing: {
      id: "student_housing",
      enabled: true,
      summary: "On-campus and nearby verified hostel options available",
    },
    exam_policy: {
      id: "exam_policy",
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
        summary: {
          title: "Balanced assessment",
          description: "Theory, practical, and internal marks considered",
        },
        duration: "3 Hours",
      },
      course_without_practical: {
        marksDistribution: { theory: 75, internal: 25, total: 100 },
        internalAssessment: [],
        attendancePolicy: [],
        externalExamPattern: [],
        summary: {
          title: "Theory-centric",
          description: "Internal + external",
        },
        duration: "3 Hours",
      },
      standalone_practical: {
        marksDistribution: { internal: 30, esa: 70, total: 100 },
        internalEvaluation: [],
        externalEvaluation: [],
        summary: {
          title: "Practical-only modules",
          description: "Hands-on focus",
        },
      },
      ojt: { assessmentCriteria: [], totalMarks: 100 },
      internship: { evaluationComponents: [], totalMarks: 100 },
      grading_scale: [],
      academic_policies: [],
    },
    faculty: {
      id: "faculty",
      enabled: true,
      summary: "Experienced faculty with academic and industry backgrounds",
      members: [],
    },
    review: {
      id: "review",
      enabled: true,
      overallRating: { rating: 4.3, totalReviews: 128 },
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
    library: {
      id: "library",
      enabled: true,
      libraryInfo: {
        libraryName: "Central Learning Resource Centre",
        areaSqFeet: 18000,
        totalSeats: 250,
        totalVolumes: 42000,
        researchCabins: 20,
      },
      availableResources: [],
      libraryHours: [],
      facilities: [],
    },
    clubs_associations: {
      id: "clubs_associations",
      enabled: true,
      summary: "Student clubs for innovation, culture, and community",
      items: [],
    },
    alliance: {
      id: "alliance",
      enabled: true,
      summary: "Active collaborations with healthcare and industry partners",
      items: [],
    },
    other_courses_offered: {
      id: "other_courses_offered",
      enabled: true,
      summary: "Multiple UG, PG, diploma, and certificate options available",
    },
    demo_graphics: {
      id: "demo_graphics",
      enabled: true,
      summary: "Interactive charts and info cards can be configured here",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Lookup tables
// ─────────────────────────────────────────────────────────────────────────────

async function seedUniversityTypes() {
  const types = [
    { name: "Private University", slug: "private_university", sortOrder: 1 },
    { name: "Deemed University", slug: "deemed_university", sortOrder: 2 },
    {
      name: "Government University",
      slug: "government_university",
      sortOrder: 3,
    },
    {
      name: "Autonomous University",
      slug: "autonomous_university",
      sortOrder: 4,
    },
    {
      name: "Affiliated University",
      slug: "affiliated_university",
      sortOrder: 5,
    },
    { name: "State University", slug: "state_university", sortOrder: 6 },
    { name: "Central University", slug: "central_university", sortOrder: 7 },
  ];

  const results: Record<string, string> = {};
  for (const t of types) {
    const bySlug = await prisma.universityType.findUnique({
      where: { slug: t.slug },
    });

    const row = bySlug
      ? await prisma.universityType.update({
          where: { id: bySlug.id },
          data: { name: t.name, sortOrder: t.sortOrder, isActive: true },
        })
      : await prisma.universityType
          .findUnique({ where: { name: t.name } })
          .then((existingByName) => {
            if (existingByName) {
              return prisma.universityType.update({
                where: { id: existingByName.id },
                data: { sortOrder: t.sortOrder, isActive: true },
              });
            }

            return prisma.universityType.create({
              data: {
                name: t.name,
                slug: t.slug,
                sortOrder: t.sortOrder,
              },
            });
          });

    results[t.slug] = row.id;
  }
  console.log("✓ University types seeded");
  return results;
}

async function seedStreamsAndDisciplines() {
  const streamDefs = [
    {
      name: "Engineering & Technology",
      slug: "engineering_technology",
      sortOrder: 1,
      disciplines: [
        { name: "Computer Science & Engineering", slug: "cse" },
        { name: "Electronics & Communication", slug: "ece" },
        { name: "Mechanical Engineering", slug: "mech" },
        { name: "Civil Engineering", slug: "civil" },
        { name: "Electrical Engineering", slug: "eee" },
        { name: "Information Technology", slug: "it" },
        { name: "Artificial Intelligence & ML", slug: "aiml" },
        { name: "Data Science", slug: "ds" },
      ],
    },
    {
      name: "Medical & Health Sciences",
      slug: "medical_health",
      sortOrder: 2,
      disciplines: [
        { name: "Medicine (MBBS)", slug: "mbbs" },
        { name: "Dental Surgery (BDS)", slug: "bds" },
        { name: "Nursing (B.Sc)", slug: "bsc_nursing" },
        { name: "Pharmacy (B.Pharm)", slug: "bpharm" },
        { name: "Physiotherapy", slug: "physiotherapy" },
        { name: "Medical Lab Technology", slug: "mlt" },
        { name: "Radiology & Imaging", slug: "radiology" },
        { name: "Ayurveda (BAMS)", slug: "bams" },
      ],
    },
    {
      name: "Management & Business",
      slug: "management_business",
      sortOrder: 3,
      disciplines: [
        { name: "Business Administration (MBA)", slug: "mba" },
        { name: "Business Administration (BBA)", slug: "bba" },
        { name: "Hospital Management", slug: "hospital_mgmt" },
        { name: "Finance & Accounting", slug: "finance" },
        { name: "Human Resources", slug: "hr" },
        { name: "Marketing", slug: "marketing" },
      ],
    },
    {
      name: "Science",
      slug: "science",
      sortOrder: 4,
      disciplines: [
        { name: "Physics", slug: "physics" },
        { name: "Chemistry", slug: "chemistry" },
        { name: "Biology", slug: "biology" },
        { name: "Biotechnology", slug: "biotech" },
        { name: "Mathematics & Statistics", slug: "maths_stats" },
        { name: "Microbiology", slug: "microbiology" },
      ],
    },
    {
      name: "Arts & Humanities",
      slug: "arts_humanities",
      sortOrder: 5,
      disciplines: [
        { name: "History", slug: "history" },
        { name: "Political Science", slug: "political_science" },
        { name: "English Literature", slug: "english_lit" },
        { name: "Psychology", slug: "psychology" },
        { name: "Sociology", slug: "sociology" },
      ],
    },
    {
      name: "Commerce & Finance",
      slug: "commerce_finance",
      sortOrder: 6,
      disciplines: [
        { name: "Commerce (B.Com)", slug: "bcom" },
        { name: "Chartered Accountancy (CA)", slug: "ca" },
        { name: "Banking & Insurance", slug: "banking_insurance" },
        { name: "Taxation", slug: "taxation" },
      ],
    },
    {
      name: "Law",
      slug: "law",
      sortOrder: 7,
      disciplines: [
        { name: "LLB (3-Year)", slug: "llb_3yr" },
        { name: "BA LLB (5-Year)", slug: "ballb_5yr" },
        { name: "LLM", slug: "llm" },
      ],
    },
    {
      name: "Architecture & Design",
      slug: "architecture_design",
      sortOrder: 8,
      disciplines: [
        { name: "Architecture (B.Arch)", slug: "barch" },
        { name: "Interior Design", slug: "interior_design" },
        { name: "Fashion Technology", slug: "fashion_tech" },
      ],
    },
  ];

  const streamIds: Record<string, string> = {};
  const disciplineIds: Record<string, string> = {};

  for (const s of streamDefs) {
    const bySlug = await prisma.stream.findUnique({ where: { slug: s.slug } });

    const stream = bySlug
      ? await prisma.stream.update({
          where: { id: bySlug.id },
          data: { name: s.name, sortOrder: s.sortOrder, isActive: true },
        })
      : await prisma.stream
          .findUnique({ where: { name: s.name } })
          .then((existingByName) => {
            if (existingByName) {
              return prisma.stream.update({
                where: { id: existingByName.id },
                data: { sortOrder: s.sortOrder, isActive: true },
              });
            }

            return prisma.stream.create({
              data: { name: s.name, slug: s.slug, sortOrder: s.sortOrder },
            });
          });

    streamIds[s.slug] = stream.id;

    for (const d of s.disciplines) {
      const disc = await prisma.discipline.upsert({
        where: { uq_discipline_slug: { streamId: stream.id, slug: d.slug } },
        update: { name: d.name },
        create: { name: d.name, slug: d.slug, streamId: stream.id },
      });
      disciplineIds[d.slug] = disc.id;
    }
  }

  console.log("✓ Streams & disciplines seeded");
  return { streamIds, disciplineIds };
}

async function seedStudyLevels() {
  const levels = [
    { name: "Undergraduate", slug: "ug", sortOrder: 1 },
    { name: "Postgraduate", slug: "pg", sortOrder: 2 },
    { name: "Diploma", slug: "diploma", sortOrder: 3 },
    { name: "PG Diploma", slug: "pg_diploma", sortOrder: 4 },
    { name: "Doctorate", slug: "phd", sortOrder: 5 },
    { name: "Certificate", slug: "certificate", sortOrder: 6 },
  ];

  const ids: Record<string, string> = {};
  for (const l of levels) {
    const bySlug = await prisma.studyLevel.findUnique({
      where: { slug: l.slug },
    });

    const row = bySlug
      ? await prisma.studyLevel.update({
          where: { id: bySlug.id },
          data: { name: l.name, sortOrder: l.sortOrder, isActive: true },
        })
      : await prisma.studyLevel
          .findUnique({ where: { name: l.name } })
          .then((existingByName) => {
            if (existingByName) {
              return prisma.studyLevel.update({
                where: { id: existingByName.id },
                data: { sortOrder: l.sortOrder, isActive: true },
              });
            }

            return prisma.studyLevel.create({ data: l });
          });

    ids[l.slug] = row.id;
  }
  console.log("✓ Study levels seeded");
  return ids;
}

async function seedProgramTypes() {
  const types = [
    { name: "Full-time", slug: "full_time", sortOrder: 1 },
    { name: "Part-time", slug: "part_time", sortOrder: 2 },
    { name: "Online", slug: "online", sortOrder: 3 },
    { name: "Distance Learning", slug: "distance", sortOrder: 4 },
    { name: "Weekend", slug: "weekend", sortOrder: 5 },
  ];

  const ids: Record<string, string> = {};
  for (const t of types) {
    const bySlug = await prisma.programType.findUnique({
      where: { slug: t.slug },
    });

    const row = bySlug
      ? await prisma.programType.update({
          where: { id: bySlug.id },
          data: { name: t.name, sortOrder: t.sortOrder, isActive: true },
        })
      : await prisma.programType
          .findUnique({ where: { name: t.name } })
          .then((existingByName) => {
            if (existingByName) {
              return prisma.programType.update({
                where: { id: existingByName.id },
                data: { sortOrder: t.sortOrder, isActive: true },
              });
            }

            return prisma.programType.create({ data: t });
          });

    ids[t.slug] = row.id;
  }
  console.log("✓ Program types seeded");
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. University
// ─────────────────────────────────────────────────────────────────────────────

async function seedUniversity(universityTypeId: string) {
  const university = await prisma.university.upsert({
    where: { slug: "vydehi-deemed-university" },
    update: {
      name: "Vydehi Deemed University",
      universityTypeId,
      state: "Karnataka",
      city: "Bangalore",
      accreditation: "NAAC A+, NIRF Ranked, MAHE Rank 3",
      governanceDetails:
        "Governed by the Vydehi Educational Society under the Karnataka Education Act. Accredited with A+ grade by NAAC and recognized by UGC.",
      metadata: {
        districtHeadquarters: "Bangalore Urban",
        affiliatedColleges: 12,
        autonomousColleges: 4,
        establishedYear: 2000,
        type: "Deemed to be University",
        academicOfferings: [
          "Engineering",
          "Management",
          "Law",
          "Allied health",
        ],
        accolades: [
          {
            body: "MAHE",
            rank: "Rank 3",
            award: "NIRF",
            year: "2024",
            logoUrl: "",
          },
          {
            body: "MAHE",
            rank: "Rank 3",
            award: "Outlook iCare",
            year: "2024",
            logoUrl: "",
          },
        ],
        governance: {
          academicCouncil: {
            title: "Academic Council",
            type: "CORE",
            description:
              "Responsible for maintaining standards of instruction, education, and examination within the institute.",
            chairman: {
              name: "Dr. Anand Sharma",
              designation: "Dean, Faculty of Medicine",
            },
            principal: {
              name: "Dr. Sarah Williams",
              designation: "Head of Administration",
            },
          },
          managementCouncil: {
            title: "Management Council",
            type: "ADMIN",
            description:
              "Oversees administrative policies, financial planning, and infrastructural development of the college.",
            members: [
              { name: "Mr. Rajiv K.", designation: "Director" },
              { name: "Ms. Priya S.", designation: "Trustee" },
            ],
            totalMembers: 5,
          },
        },
        videos: [
          {
            title: "Convocation 2024",
            thumbnailUrl: "",
            videoUrl: "",
          },
        ],
      },
    },
    create: {
      slug: "vydehi-deemed-university",
      name: "Vydehi Deemed University",
      universityTypeId,
      state: "Karnataka",
      city: "Bangalore",
      accreditation: "NAAC A+, NIRF Ranked, MAHE Rank 3",
      governanceDetails:
        "Governed by the Vydehi Educational Society under the Karnataka Education Act. Accredited with A+ grade by NAAC and recognized by UGC.",
      metadata: {
        districtHeadquarters: "Bangalore Urban",
        affiliatedColleges: 12,
        autonomousColleges: 4,
        establishedYear: 2000,
        type: "Deemed to be University",
        academicOfferings: [
          "Engineering",
          "Management",
          "Law",
          "Allied health",
        ],
        accolades: [
          {
            body: "MAHE",
            rank: "Rank 3",
            award: "NIRF",
            year: "2024",
            logoUrl: "",
          },
          {
            body: "MAHE",
            rank: "Rank 3",
            award: "Outlook iCare",
            year: "2024",
            logoUrl: "",
          },
        ],
      },
    },
  });

  console.log("✓ University seeded:", university.id);
  return university;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. College
// ─────────────────────────────────────────────────────────────────────────────

async function seedCollege(universityId: string) {
  const profileSections = {
    overview: {
      description:
        "Vydehi Institute of Medical Sciences & Research Centre is one of Bangalore's premier medical institutions, known for its holistic approach to education, healthcare, and research. Equipped with state-of-the-art infrastructure.",
      establishedYear: 2000,
      collegeType: "Public",
      isCoEducation: true,
      avgStudentCount: "1,500+",
      campusSizeAcres: 65,
      studentsFromOutsideState: "35%",
      totalCourses: 45,
    },
    accreditation: [
      {
        body: "MAHE",
        rank: "Rank 3",
        award: "NIRF",
        year: "2024",
        description: "India's top #131/200 universities in 2024",
        logoUrl: "",
      },
      {
        body: "MAHE",
        rank: "Rank 3",
        award: "Outlook iCare",
        year: "2024",
        description: "India's top #131/200 universities in 2024",
        logoUrl: "",
      },
      {
        body: "NAAC",
        rank: "A+",
        award: "Accreditation",
        year: "2023",
        description: "National Assessment and Accreditation Council",
        logoUrl: "",
      },
    ],
    amenities: [
      { name: "Wi-Fi Campus", icon: "wifi", available: true },
      { name: "Swimming Pool", icon: "pool", available: true },
      { name: "Central Library", icon: "library", available: true },
      { name: "Student Hostels", icon: "hostel", available: true },
      { name: "Sports Complex", icon: "sports", available: true },
      { name: "Gymnasium", icon: "gym", available: true },
      { name: "Cafeteria", icon: "cafeteria", available: true },
      { name: "Medical Centre", icon: "medical", available: true },
    ],
    insideCampusFacilities: [
      {
        name: "Subway",
        type: "Food Service",
        icon: "food",
        description: "Food Court",
      },
      {
        name: "Indian Post",
        type: "Postal Service",
        icon: "post",
        description: "Postal Service",
      },
      {
        name: "ATM",
        type: "Banking",
        icon: "atm",
        description: "SBI ATM on campus",
      },
      {
        name: "Medical Centre",
        type: "Healthcare",
        icon: "medical",
        description: "24x7 student health centre",
      },
    ],
    nearbyAccess: {
      transit: [
        { type: "Metro", name: "Whitefield Metro Station", distance: "2.5 km" },
        {
          type: "Bus Stop",
          name: "Vydehi Hospital Bus Stop",
          distance: "0.1 km",
        },
        {
          type: "Railway",
          name: "KR Puram Railway Station",
          distance: "4.2 km",
        },
      ],
      essentials: [
        {
          type: "Hospital",
          name: "Apollo Spectra Hospitals",
          distance: "3.0 km",
        },
        {
          type: "Hospital",
          name: "Fortis Hospital Bannerghatta Road",
          distance: "7.6 km",
        },
        {
          type: "School",
          name: "KLAY Prep Schools and DayCare",
          distance: "6.9 km",
        },
        { type: "School", name: "VIBGYOR High School", distance: "0.1 km" },
      ],
      utility: [
        { type: "Bank", name: "State Bank of India", distance: "0.5 km" },
        { type: "Pharmacy", name: "MedPlus Pharmacy", distance: "0.3 km" },
        { type: "Supermarket", name: "More Supermarket", distance: "1.1 km" },
      ],
    },
    placementStats: {
      avgPackageLpa: 4.2,
      highestPackageLpa: 14.2,
      placementRatePercent: 94,
      lowestPackageLpa: 3.5,
      companiesVisited: "120+",
      studentsPlaced: "450+",
      reportPdfUrl: "",
      trends: [
        { year: "2020", avgPackage: 3.2 },
        { year: "2021", avgPackage: 3.6 },
        { year: "2022", avgPackage: 3.9 },
        { year: "2023", avgPackage: 4.2 },
      ],
      avgPackageGrowth: "+12.5% YoY",
      industrySalary: [
        {
          industry: "BFSI – Banking & Finance",
          placed: 155,
          avgPkg: "₹8.2L",
          maxPkg: "₹12L",
        },
        {
          industry: "FMCG – Retail & Goods",
          placed: 98,
          avgPkg: "₹7.5L",
          maxPkg: "₹10L",
        },
        {
          industry: "Consulting – Mgmt Consulting",
          placed: 81,
          avgPkg: "₹9.1L",
          maxPkg: "₹14.5L",
        },
      ],
      notableOffers: [
        {
          company: "Deloitte",
          role: "Senior Analyst Role",
          package: "14.5 LPA",
          isHighest: true,
          logoUrl: "",
        },
        {
          company: "Accenture",
          role: "Analyst",
          package: "11.2 LPA",
          isHighest: false,
          logoUrl: "",
        },
      ],
      companyStats: [
        {
          company: "Deloitte",
          avgPkg: "₹9.2L",
          maxPkg: "₹14.5L",
          studentsPlaced: 141,
          logoUrl: "",
        },
        {
          company: "Accenture",
          avgPkg: "₹7.8L",
          maxPkg: "₹11.2L",
          studentsPlaced: 270,
          logoUrl: "",
        },
        {
          company: "TCS",
          avgPkg: "₹6.5L",
          maxPkg: "₹9.0L",
          studentsPlaced: 340,
          logoUrl: "",
        },
      ],
      testimonials: [
        {
          studentName: "Rohan Mehta",
          company: "Deloitte",
          role: "Placed at Deloitte",
          quote:
            "The placement support helped me secure a role at a top firm. Best decision ever!",
          avatarUrl: "",
        },
        {
          studentName: "Priya Nair",
          company: "Accenture",
          role: "Placed at Accenture",
          quote:
            "Excellent training and mentorship. I feel confident in my career path.",
          avatarUrl: "",
        },
      ],
    },
    library: {
      name: "Central Library",
      areaInSqFt: 21786,
      totalSeats: 300,
      volumes: 79316,
      researchCabins: 44,
      resources: {
        Encyclopaedias: 50,
        "Journals (Print)": 39,
        "Journals (Online)": 6150,
        "Magazines (Print)": 36,
        "Rare Books": 1562,
        "Magazines & Papers": 7500,
        "E-Books": 195809,
      },
      hours: [
        {
          day: "Monday",
          workingHours: "09:00 AM - 04:30 PM",
          transactionHours: "09:00 AM - 04:30 PM",
        },
        {
          day: "Tuesday",
          workingHours: "09:00 AM - 04:30 PM",
          transactionHours: "09:00 AM - 04:30 PM",
        },
        {
          day: "Wednesday",
          workingHours: "09:00 AM - 04:30 PM",
          transactionHours: "09:00 AM - 04:30 PM",
        },
        {
          day: "Thursday",
          workingHours: "09:00 AM - 04:30 PM",
          transactionHours: "09:00 AM - 04:30 PM",
        },
        {
          day: "Friday",
          workingHours: "09:00 AM - 04:30 PM",
          transactionHours: "09:00 AM - 04:30 PM",
        },
        {
          day: "Saturday",
          workingHours: "09:00 AM - 01:00 PM",
          transactionHours: "09:00 AM - 01:00 PM",
        },
        { day: "Sunday", workingHours: "09:00 AM - 01:00 PM" },
      ],
      facilities: [
        { name: "Quiet Study Areas", imageUrl: "" },
        { name: "Computer Labs", imageUrl: "" },
        { name: "Discussion Rooms", imageUrl: "" },
        { name: "Digital Access Zone", imageUrl: "" },
      ],
    },
    studentCodeOfConduct: {
      sections: [
        {
          title: "General Rules of Discipline",
          rules: [
            "Always carry the Identity Card with you while in college or the hospital.",
            "Attend the classes and clinical postings on time.",
            "Wear the college uniform (if prescribed) neatly and properly.",
            "Maintain silence and discipline in the library, classrooms, and corridors.",
            "Use of mobile phones is strictly prohibited in classrooms, laboratories, and library.",
            "Respect the faculty, staff, and fellow students. Ragging is a punishable offense.",
            "Keep the campus clean. Do not litter.",
            "Any damage to college property will be recovered from the student concerned.",
            "Prior permission is required for leave of absence.",
          ],
        },
        {
          title: "Examination Rules",
          rules: [
            "Students must maintain a minimum of 75% attendance to be eligible for examinations.",
            "Use of unfair means during examinations will lead to immediate cancellation of the paper.",
            "Students must carry their hall ticket and ID card to the examination hall.",
          ],
        },
        {
          title: "Hostel Rules",
          rules: [
            "Curfew time: 9:00 PM on weekdays.",
            "No guests allowed in the hostel rooms.",
            "Students must sign the register while going out and coming back.",
          ],
        },
      ],
    },
    alliance: [
      {
        name: "Baby Memorial Hospital",
        shortName: "BMH",
        type: "OWN_HOSPITAL",
        typeLabel: "Own Hospital",
        description:
          "Baby Memorial Hospital (BMH) is a multi-specialty, tertiary care corporate hospital in Kozhikode, Kerala.",
        logoUrl: "",
        websiteUrl: "",
        aboutPartnership:
          "The alliance with Baby Memorial Hospital (BMH) represents a significant milestone in bridging the gap between academic theory and clinical practice. Established to foster excellence in healthcare education, this partnership provides our students with unparalleled access to world-class medical facilities and mentorship.",
        collaborationImpact:
          "Through this strategic collaboration, students gain hands-on experience in advanced diagnostic procedures and patient care. The initiative also supports faculty exchange programs, enhancing the curriculum with real-world medical insights.",
        keyFocusAreas: [
          "Clinical Rotations for Nursing Students",
          "Joint Biomedical Research",
          "Internship Opportunities",
          "Continuing Medical Education (CME) Seminars",
        ],
        documents: [
          {
            name: "Memorandum of Understanding",
            size: "2.4 MB",
            type: "PDF",
            url: "",
          },
          {
            name: "Partnership Agreement",
            size: "1.8 MB",
            type: "PDF",
            url: "",
          },
        ],
      },
      {
        name: "SIAINDIA",
        shortName: "SIA-India",
        type: "INDUSTRIAL_COLLABORATION",
        typeLabel: "Industrial Collaboration",
        description:
          "The Satellite Industry Association of India (SIA-India) is a non-profit association of Indian and global satellite industry players.",
        logoUrl: "",
        websiteUrl: "",
        keyFocusAreas: [
          "Research Collaboration",
          "Student Internships",
          "Industry Exposure Programs",
        ],
      },
      {
        name: "National Institute of Design",
        shortName: "NID",
        type: "ACADEMIC_RESEARCH",
        typeLabel: "Academic & Research",
        description:
          "A premier institute for design education and research. This collaboration enables student exchange programs and joint workshops.",
        logoUrl: "",
        websiteUrl: "",
        keyFocusAreas: [
          "Student Exchange Programs",
          "Joint Workshops",
          "Research Collaboration",
        ],
      },
    ],
    institutionsAcrossTheWorld: [
      {
        location: "Mangaluru",
        institutions: [
          { name: "Nitte Meenakshi Institute of Technology" },
          { name: "Nitte College of Pharmaceutical Sciences" },
          { name: "Nitte School of Architecture, Planning & Design" },
        ],
      },
      {
        location: "Bengaluru – Yelahanka",
        isDefault: true,
        institutions: [
          { name: "Nitte School of Fashion Technology & Interior Design" },
          { name: "Dr. NSAM First Grade College" },
        ],
      },
    ],
    socialLinks: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      twitter: "",
      youtube: "",
      website: "https://vydehi.edu.in",
    },
    coordinateInfo: {
      latitude: 12.9453,
      longitude: 77.7207,
      googleMapsUrl: "",
    },
    clubsAndAssociations: [
      {
        name: "NSS",
        fullName: "National Service Scheme",
        type: "SERVICE",
        description:
          "National Service Scheme. Encouraging social service and community building among students.",
        about:
          "The National Service Scheme (NSS) is an Indian government-sponsored public service program conducted by the Ministry of Youth Affairs and Sports. Our college chapter is dedicated to fostering social responsibility and community engagement among students.",
        mission:
          "The motto of NSS 'Not Me But You', reflects the essence of democratic living and upholds the need for self-less service. We aim to identify the needs and problems of the community and involve students in problem-solving.",
        keyActivities: [
          "Blood Donation Camps",
          "Tree Plantation Drives",
          "Rural Development Projects",
          "Health & Hygiene Awareness",
        ],
        logoUrl: "",
        coverImageUrl: "",
      },
    ],
    faculty: [
      {
        name: "Dr. Rajesh Kumar",
        designation: "Professor & Head",
        department: "Department of Cardiology",
        avatarUrl: "",
        education: [
          {
            degree: "DM in Cardiology",
            institution: "AIIMS, New Delhi",
            years: "2005 - 2008",
          },
          {
            degree: "MD in Medicine",
            institution: "AIIMS, New Delhi",
            years: "2001 - 2004",
          },
        ],
        experience: [
          {
            title: "Senior Consultant",
            institution: "City Heart Institute",
            years: "2015 - 2020",
            isCurrent: true,
          },
        ],
      },
      {
        name: "Dr. Anjali Sharma",
        designation: "Associate Professor",
        department: "Department of Neurology",
        avatarUrl: "",
        education: [],
        experience: [],
      },
      {
        name: "Dr. Vikram Patel",
        designation: "Assistant Professor",
        department: "Department of Pediatrics",
        avatarUrl: "",
        education: [],
        experience: [],
      },
      {
        name: "Dr. Sunita Mehta",
        designation: "Professor",
        department: "Department of Orthopedics",
        avatarUrl: "",
        education: [],
        experience: [],
      },
      {
        name: "Dr. Amit Reddy",
        designation: "Professor",
        department: "Department of General Surgery",
        avatarUrl: "",
        education: [],
        experience: [],
      },
    ],
    entranceExams: {
      national: [
        {
          name: "Common Admission Test",
          code: "CAT-105",
          minPercentile: 85,
        },
        { name: "JEE Main", code: "JEE-202", minPercentile: 90 },
        { name: "NEET", code: "NEET-X5", minRank: "Top 5000" },
      ],
      state: [
        { name: "Karnataka PGCET", code: "KEA-55", minScore: 1200 },
        { name: "MHT CET", code: "MAH-99", minPercentile: 88 },
      ],
      institutional: [
        {
          name: "Vydehi Entrance Test",
          code: "VUET-01",
          minScore: "60%",
        },
      ],
    },
    examPolicy: {
      assessmentPattern: {
        withPractical: {
          theoryPapers: 3,
          assignments: 2,
          practicalRecordBooks: 2,
          viva: 1,
          attendance: 75,
          sectionA: { internalMax: 30, externalMax: 70, total: 100 },
          sectionB: { internalMax: 25, externalMax: 50, total: 75 },
          sectionC: { internalMax: 20, externalMax: 50, total: 70 },
          practicalExam: { internalMax: 15, externalMax: 35, total: 50 },
          totalInternal: "25 Marks",
          totalExternal: "75 Marks",
        },
        withoutPractical: {
          theoryPapers: 4,
          assignments: 2,
          attendance: 75,
        },
      },
      gradingScale: [
        { range: "90 - 100", grade: "O", points: 10 },
        { range: "80 - 89", grade: "A+", points: 9 },
        { range: "70 - 79", grade: "A", points: 8 },
        { range: "60 - 69", grade: "B+", points: 7 },
        { range: "50 - 59", grade: "B", points: 6 },
        { range: "40 - 49", grade: "C", points: 5 },
        { range: "< 40", grade: "F", points: 0 },
      ],
      importantGuidelines: {
        minimumAttendance: 75,
        message:
          "Students with less than 75% attendance will not be allowed to appear in the semester examinations.",
      },
    },
    happeningsCategories: [
      "College News",
      "Department of Chemistry",
      "Student Achievements",
      "Faculty Achievements",
    ],
    college_overview: {
      id: "college_overview",
      enabled: true,
      description:
        "Premier multidisciplinary institution with modern infrastructure and strong student outcomes.",
      instution_details: {
        estd: "2000",
        gender: "Co-Ed",
        average_student_count: "1,500+",
        campus_size: "65 Acres",
        Student_from_outside: "35%",
      },
      location: {
        map_link: "",
      },
      connect: {
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
        twitter: "",
        website: "https://vydehi.edu.in",
      },
    },
    student_code_of_conduct: {
      id: "student_code_of_conduct",
      enabled: true,
      title: "Student Code of Conduct",
      disciplineRules: [
        "Carry your college ID card at all times.",
        "Maintain minimum attendance as per policy.",
        "Ragging and harassment are strictly prohibited.",
      ],
    },
    happenings: {
      id: "happenings",
      enabled: true,
      summary:
        "Campus updates across academics, student life, and achievements",
      items: [
        {
          title: "Research Innovation Week",
          category: "College News",
          date: "2024-08-15",
        },
        {
          title: "Inter-College Cultural Fest",
          category: "Student Achievements",
          date: "2024-09-05",
        },
      ],
    },
    institutions_across_world: {
      id: "institutions_across_world",
      enabled: true,
      summary: "Partner campuses and associated institutions across regions",
      institutions: [
        {
          location: "Mangaluru",
          name: "Nitte Meenakshi Institute of Technology",
        },
        {
          location: "Bengaluru – Yelahanka",
          name: "Nitte School of Fashion Technology & Interior Design",
        },
      ],
    },
    commute: {
      id: "commute",
      enabled: true,
      summary: "Daily transport routes available from major city zones",
    },
  };

  const college = await prisma.college.upsert({
    where: { slug: COLLEGE_SLUG },
    update: {
      name: "Vydehi Institute of Medical Science & Research Centre",
      universityId,
      code: COLLEGE_CODE,
      state: "Karnataka",
      city: "Bangalore",
      district: "Bangalore Urban",
      address: "82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066",
      pinCode: "560066",
      profileSections,
      settings: {
        registrationMeta: {
          registrationTabs: [...REGISTRATION_TAB_IDS],
        },
      },
    },
    create: {
      slug: COLLEGE_SLUG,
      name: "Vydehi Institute of Medical Science & Research Centre",
      universityId,
      code: COLLEGE_CODE,
      state: "Karnataka",
      city: "Bangalore",
      district: "Bangalore Urban",
      address: "82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066",
      pinCode: "560066",
      profileSections,
      settings: {
        registrationMeta: {
          registrationTabs: [...REGISTRATION_TAB_IDS],
        },
      },
    },
  });

  console.log("✓ College seeded:", college.id);
  return college;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. College Roles
// ─────────────────────────────────────────────────────────────────────────────

async function seedCollegeRoles(collegeId: string) {
  const roles = [
    { slug: "college_admin", name: "College Admin" },
    { slug: "evaluator", name: "Evaluator" },
    { slug: "financial_team", name: "Financial Team" },
    { slug: "admission_team", name: "Admission Team" },
    { slug: "hostel_team", name: "Hostel Team" },
    { slug: "marketing_team", name: "Marketing Team" },
  ];

  const ids: Record<string, string> = {};
  for (const r of roles) {
    const row = await prisma.collegeRole.upsert({
      where: { uq_college_role_slug: { collegeId, slug: r.slug } },
      update: { name: r.name, isSystemRole: true },
      create: {
        collegeId,
        slug: r.slug,
        name: r.name,
        isSystemRole: true,
      },
    });
    ids[r.slug] = row.id;
  }

  console.log("✓ College roles seeded");
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. College Admin Staff Member
// ─────────────────────────────────────────────────────────────────────────────

async function seedCollegeAdmin(collegeId: string, adminRoleId: string) {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const staff = await prisma.staffMember.upsert({
    where: { uq_staff_email_college: { email: ADMIN_EMAIL, collegeId } },
    update: { fullName: ADMIN_NAME, passwordHash },
    create: {
      collegeId,
      collegeRoleId: adminRoleId,
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      phoneNumber: "9876543210",
      status: "active",
    },
  });

  console.log("✓ College admin seeded:", staff.email);
  return staff;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Campus
// ─────────────────────────────────────────────────────────────────────────────

async function seedCampus(collegeId: string) {
  const existing = await prisma.campus.findFirst({
    where: { collegeId, isMainCampus: true },
  });

  if (existing) {
    console.log("✓ Main campus already exists:", existing.id);
    return existing;
  }

  const campus = await prisma.campus.create({
    data: {
      collegeId,
      name: "Main Campus – Whitefield",
      address: "82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560066",
      latitude: 12.9453,
      longitude: 77.7207,
      isMainCampus: true,
      status: "active",
    },
  });

  console.log("✓ Campus seeded:", campus.id);
  return campus;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Courses
// ─────────────────────────────────────────────────────────────────────────────

async function seedCourses(
  collegeId: string,
  campusId: string,
  disciplineIds: Record<string, string>,
  studyLevelIds: Record<string, string>,
  programTypeIds: Record<string, string>,
) {
  const courseDefs = [
    {
      name: "Bachelor of Medicine, Bachelor of Surgery",
      code: "MBBS",
      disciplineSlug: "mbbs",
      studyLevelSlug: "ug",
      programTypeSlug: "full_time",
      duration: "5.5 Years",
      intakeCapacity: 150,
      studyMode: "full_time" as const,
      metadata: {
        totalFee: "₹6,50,000",
        highlights: [
          "WHO recognized",
          "Clinical exposure from Year 1",
          "Attached to 800-bed hospital",
        ],
      },
      quotas: [
        { quotaName: "Government Quota", seats: 40 },
        { quotaName: "Management Quota", seats: 30 },
        { quotaName: "NRI Quota", seats: 15 },
        { quotaName: "Scholarship Quota", seats: 20 },
        { quotaName: "Sports Quota", seats: 15 },
      ],
    },
    {
      name: "Bachelor of Dental Surgery",
      code: "BDS",
      disciplineSlug: "bds",
      studyLevelSlug: "ug",
      programTypeSlug: "full_time",
      duration: "5 Years",
      intakeCapacity: 60,
      studyMode: "full_time" as const,
      metadata: { totalFee: "₹3,00,000" },
      quotas: [
        { quotaName: "Government Quota", seats: 25 },
        { quotaName: "Management Quota", seats: 25 },
        { quotaName: "NRI Quota", seats: 10 },
      ],
    },
    {
      name: "Bachelor of Science in Nursing",
      code: "BSC_NURSING",
      disciplineSlug: "bsc_nursing",
      studyLevelSlug: "ug",
      programTypeSlug: "full_time",
      duration: "4 Years",
      intakeCapacity: 100,
      studyMode: "full_time" as const,
      metadata: { totalFee: "₹1,10,000" },
      quotas: [
        { quotaName: "Merit Quota", seats: 60 },
        { quotaName: "Management Quota", seats: 40 },
      ],
    },
    {
      name: "Doctor of Medicine / Master of Surgery",
      code: "MD_MS",
      disciplineSlug: "mbbs",
      studyLevelSlug: "pg",
      programTypeSlug: "full_time",
      duration: "3 Years",
      intakeCapacity: 50,
      studyMode: "full_time" as const,
      metadata: { totalFee: "₹8,50,000" },
      quotas: [
        { quotaName: "Government Quota", seats: 20 },
        { quotaName: "Management Quota", seats: 30 },
      ],
    },
    {
      name: "Master of Business Administration",
      code: "MBA_DT",
      disciplineSlug: "mba",
      studyLevelSlug: "pg",
      programTypeSlug: "full_time",
      duration: "24 Months",
      intakeCapacity: 120,
      studyMode: "full_time" as const,
      metadata: {
        specialization: "Digital Transformation",
        totalFee: "₹3,50,000",
        highlights: [
          "Industry mentors from 15 sectors",
          "Live projects",
          "17 years annual MBA employment growth",
        ],
        keyDates: [
          {
            label: "Application Opens",
            date: "15 June 2024",
            highlight: false,
          },
          { label: "Exam Date", date: "28 July 2024", highlight: false },
          { label: "Result Date", date: "10 August 2024", highlight: true },
        ],
        courseStructure: {
          foundationCourses: 40,
          electives: 30,
          coreCourses: 24,
          specialization: 18,
        },
        classTiming: {
          regularClasses: "09:30 AM - 01:30 PM, 02:30 PM - 06:30 PM",
          tutorials: "07:00 PM - 08:00 PM",
        },
      },
      quotas: [
        { quotaName: "Merit Quota", seats: 80 },
        { quotaName: "Management Quota", seats: 40 },
      ],
    },
    {
      name: "Diploma in Pharmacy",
      code: "DPHARM",
      disciplineSlug: "bpharm",
      studyLevelSlug: "diploma",
      programTypeSlug: "full_time",
      duration: "2 Years",
      intakeCapacity: 40,
      studyMode: "full_time" as const,
      metadata: { totalFee: "₹85,000" },
      quotas: [{ quotaName: "Open Quota", seats: 40 }],
    },
    {
      name: "PG Diploma in Laboratory Technology",
      code: "PGDLT",
      disciplineSlug: "mlt",
      studyLevelSlug: "pg_diploma",
      programTypeSlug: "full_time",
      duration: "1 Year",
      intakeCapacity: 30,
      studyMode: "full_time" as const,
      metadata: { totalFee: "₹60,000" },
      quotas: [{ quotaName: "Open Quota", seats: 30 }],
    },
    {
      name: "Master of Computer Applications",
      code: "MCA",
      disciplineSlug: "cse",
      studyLevelSlug: "pg",
      programTypeSlug: "full_time",
      duration: "24 Months",
      intakeCapacity: 60,
      studyMode: "full_time" as const,
      metadata: {
        totalFee: "₹2,20,000",
        weeklyHours: "15-20 Hours/Week",
      },
      quotas: [
        { quotaName: "Merit Quota", seats: 40 },
        { quotaName: "Management Quota", seats: 20 },
      ],
    },
    {
      name: "Bachelor of Business Administration",
      code: "BBA",
      disciplineSlug: "bba",
      studyLevelSlug: "ug",
      programTypeSlug: "full_time",
      duration: "36 Months",
      intakeCapacity: 80,
      studyMode: "full_time" as const,
      metadata: { totalFee: "₹1,80,000" },
      quotas: [
        { quotaName: "Merit Quota", seats: 50 },
        { quotaName: "Management Quota", seats: 30 },
      ],
    },
    {
      name: "Bachelor of Computer Applications",
      code: "BCA",
      disciplineSlug: "cse",
      studyLevelSlug: "ug",
      programTypeSlug: "weekend",
      duration: "36 Months",
      intakeCapacity: 60,
      studyMode: "part_time" as const,
      metadata: {
        totalFee: "₹1,60,000",
        classSchedule: "Weekend Classes",
      },
      quotas: [{ quotaName: "Open Quota", seats: 60 }],
    },
  ];

  const courseIds: Record<string, string> = {};

  for (const c of courseDefs) {
    const disciplineId = disciplineIds[c.disciplineSlug];
    const studyLevelId = studyLevelIds[c.studyLevelSlug];
    const programTypeId = programTypeIds[c.programTypeSlug];

    if (!disciplineId || !studyLevelId || !programTypeId) {
      console.warn(`  ⚠ Skipping ${c.code}: missing discipline/level/type`);
      continue;
    }

    const setupTabData = buildCourseSetupTabData({
      name: c.name,
      code: c.code,
      duration: c.duration,
      intakeCapacity: c.intakeCapacity,
      studyMode: c.studyMode,
      metadata: c.metadata,
    });

    const metadataWithTabs = {
      ...c.metadata,
      tabs: [...COURSE_SETUP_TAB_IDS],
      tabData: setupTabData,
    };

    const highlights = Array.isArray(c.metadata.highlights)
      ? c.metadata.highlights
      : [
          `${c.name} with practical-first pedagogy`,
          "Mentored projects and internships",
        ];

    const course = await prisma.course.upsert({
      where: { uq_course_code_college: { collegeId, code: c.code } },
      update: {
        name: c.name,
        disciplineId,
        studyLevelId,
        programTypeId,
        campusId,
        duration: c.duration,
        intakeCapacity: c.intakeCapacity,
        studyMode: c.studyMode,
        metadata: metadataWithTabs,
        highlights,
        curriculum: [],
        courseStructure: {
          totalCredits: 120,
          mode: "CBCS",
        },
        valueAddedCourses: [
          {
            name: "Communication Skills",
            credits: 2,
            deliveryMode: "Workshop",
          },
        ],
        careerOpportunities: [
          { role: "Analyst", salaryRange: "4-8 LPA" },
          { role: "Specialist", salaryRange: "6-12 LPA" },
        ],
        higherEducationCertifications: {
          global: ["Certification Tracks"],
          postGraduation: ["Advanced Degree Options"],
        },
        flexibleExitOptions: [],
        classTimings: {
          weekdays: {
            start: "09:30",
            end: "16:30",
            status: "regular",
          },
        },
        industryTools: ["Excel", "Python", "Power BI"],
        labFacilities: ["Simulation Lab", "Computer Lab"],
        roomFacilities: ["Smart Classrooms", "Seminar Halls"],
        featuredAlumni: [],
        faqs: [],
        examPolicy: {
          model: "Continuous + End Semester",
          attendanceRequired: 75,
        },
        entranceExamEligibility: [],
        eligibilityCriteria: {
          minimum: "As per governing body guidelines",
        },
        accreditations: ["NAAC"],
        keyDates: [],
        demographics: {},
      },
      create: {
        collegeId,
        campusId,
        name: c.name,
        code: c.code,
        disciplineId,
        studyLevelId,
        programTypeId,
        duration: c.duration,
        intakeCapacity: c.intakeCapacity,
        studyMode: c.studyMode,
        status: "active",
        metadata: metadataWithTabs,
        highlights,
        curriculum: [],
        courseStructure: {
          totalCredits: 120,
          mode: "CBCS",
        },
        valueAddedCourses: [
          {
            name: "Communication Skills",
            credits: 2,
            deliveryMode: "Workshop",
          },
        ],
        careerOpportunities: [
          { role: "Analyst", salaryRange: "4-8 LPA" },
          { role: "Specialist", salaryRange: "6-12 LPA" },
        ],
        higherEducationCertifications: {
          global: ["Certification Tracks"],
          postGraduation: ["Advanced Degree Options"],
        },
        flexibleExitOptions: [],
        classTimings: {
          weekdays: {
            start: "09:30",
            end: "16:30",
            status: "regular",
          },
        },
        industryTools: ["Excel", "Python", "Power BI"],
        labFacilities: ["Simulation Lab", "Computer Lab"],
        roomFacilities: ["Smart Classrooms", "Seminar Halls"],
        featuredAlumni: [],
        faqs: [],
        examPolicy: {
          model: "Continuous + End Semester",
          attendanceRequired: 75,
        },
        entranceExamEligibility: [],
        eligibilityCriteria: {
          minimum: "As per governing body guidelines",
        },
        accreditations: ["NAAC"],
        keyDates: [],
        demographics: {},
      },
    });

    courseIds[c.code] = course.id;

    for (const q of c.quotas) {
      await prisma.courseQuota.upsert({
        where: {
          uq_course_quota: { courseId: course.id, quotaName: q.quotaName },
        },
        update: { seats: q.seats },
        create: {
          courseId: course.id,
          quotaName: q.quotaName,
          seats: q.seats,
          isActive: true,
        },
      });
    }
  }

  console.log("✓ Courses & quotas seeded");
  return courseIds;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Fee Structures
// ─────────────────────────────────────────────────────────────────────────────

async function seedFeeStructures(
  collegeId: string,
  courseIds: Record<string, string>,
) {
  const mbsId = courseIds["MBBS"];
  const mbaDtId = courseIds["MBA_DT"];

  if (mbsId) {
    const mbbsFees = [
      { feeCategory: "tuition_fee", amount: 125276, yearOrSemester: "Year 1" },
      { feeCategory: "tuition_fee", amount: 125276, yearOrSemester: "Year 2" },
      { feeCategory: "tuition_fee", amount: 125276, yearOrSemester: "Year 3" },
      { feeCategory: "tuition_fee", amount: 125276, yearOrSemester: "Year 4" },
      {
        feeCategory: "application_fee",
        amount: 1500,
        yearOrSemester: "One-time",
      },
      {
        feeCategory: "admission_fee",
        amount: 15000,
        yearOrSemester: "One-time",
      },
      {
        feeCategory: "examination_fee",
        amount: 3500,
        yearOrSemester: "Annual",
      },
      { feeCategory: "library_fee", amount: 1200, yearOrSemester: "Annual" },
      { feeCategory: "lab_fee", amount: 2800, yearOrSemester: "Annual" },
      { feeCategory: "sports_fee", amount: 1500, yearOrSemester: "Annual" },
    ];

    for (const fee of mbbsFees) {
      const existing = await prisma.feeStructure.findFirst({
        where: {
          collegeId,
          courseId: mbsId,
          academicYear: "2024-25",
          feeCategory: fee.feeCategory,
          yearOrSemester: fee.yearOrSemester,
        },
      });

      if (!existing) {
        await prisma.feeStructure.create({
          data: {
            collegeId,
            courseId: mbsId,
            academicYear: "2024-25",
            feeCategory: fee.feeCategory,
            amount: fee.amount,
            yearOrSemester: fee.yearOrSemester,
            instalmentAllowed: fee.feeCategory === "tuition_fee",
            instalmentConfig:
              fee.feeCategory === "tuition_fee"
                ? {
                    instalments: [
                      {
                        label: "1st Installment (Booking)",
                        dueWithin: "10 days",
                        amount: 25000,
                      },
                      {
                        label: "2nd Installment",
                        dueBy: "Before classes start",
                        amount: 54638,
                      },
                      {
                        label: "Final Installment",
                        dueAfter: "60 days",
                        amount: 54638,
                      },
                    ],
                  }
                : {},
          },
        });
      }
    }
    console.log("✓ MBBS fee structures seeded");
  }

  if (mbaDtId) {
    const mbaFees = [
      { feeCategory: "tuition_fee", amount: 125276, yearOrSemester: "Year 1" },
      { feeCategory: "tuition_fee", amount: 125276, yearOrSemester: "Year 2" },
      {
        feeCategory: "application_fee",
        amount: 1500,
        yearOrSemester: "One-time",
      },
      {
        feeCategory: "admission_fee",
        amount: 15000,
        yearOrSemester: "One-time",
      },
      {
        feeCategory: "examination_fee",
        amount: 3500,
        yearOrSemester: "Annual",
      },
    ];

    for (const fee of mbaFees) {
      const existing = await prisma.feeStructure.findFirst({
        where: {
          collegeId,
          courseId: mbaDtId,
          academicYear: "2024-25",
          feeCategory: fee.feeCategory,
          yearOrSemester: fee.yearOrSemester,
        },
      });

      if (!existing) {
        await prisma.feeStructure.create({
          data: {
            collegeId,
            courseId: mbaDtId,
            academicYear: "2024-25",
            feeCategory: fee.feeCategory,
            amount: fee.amount,
            yearOrSemester: fee.yearOrSemester,
            instalmentAllowed: fee.feeCategory === "tuition_fee",
            instalmentConfig: {},
          },
        });
      }
    }
    console.log("✓ MBA fee structures seeded");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Hostels
// ─────────────────────────────────────────────────────────────────────────────

async function seedHostels(collegeId: string) {
  const hostelDefs = [
    {
      slug: "vydehi-campus-hostel-a",
      name: "Vydehi Campus Hostel A",
      hostelType: "boys",
      isOnCampus: true,
      description:
        "Premium on-campus boys hostel with modern amenities. Rated 4.8 by 120 students.",
      totalBeds: 350,
      avgRating: 4.8,
      reviewCount: 120,
      amenities: [
        { name: "High Speed Wi-Fi", icon: "wifi" },
        { name: "Veg Menu", icon: "food" },
        { name: "CCTV", icon: "security" },
        { name: "Gym", icon: "gym" },
        { name: "24x7 Security", icon: "shield" },
      ],
      rules: [
        {
          title: "Curfew Time",
          description:
            "Entry curfew is strictly 9:30 PM. Late entry allowed only till 11:30 PM with prior permission.",
        },
        {
          title: "Visitor Policy",
          description:
            "Visitors are allowed on Saturday and Sunday, 09:00 AM - 05:00 PM.",
        },
        {
          title: "Leave Permission",
          description:
            "Students require guardian approval via the app 2 days in advance.",
        },
        {
          title: "Punctuality",
          description:
            "Students must be punctual. Repeated late entry will lead to disciplinary action.",
        },
      ],
      wardenInfo: {
        name: "Mrs. Sarah Jenkins",
        phone: "9876512340",
        whatsapp: "9876512340",
        email: "hostel.warden@vydehi.edu.in",
        coverage: "5G Coverage",
        totalBeds: 347,
        availableBeds: 12,
        rating: "Medium Alert",
      },
      locationInfo: {
        address: "Block C, South Campus Area, Inside Vydehi Campus",
        collegeTransport: "Campus Bus available 6:30 AM - 10:00 PM",
        nearbyEssentials: [
          { type: "Hospital", name: "Apollo Spectra", distance: "3.0 km" },
          { type: "School", name: "VIBGYOR", distance: "0.1 km" },
        ],
      },
      roomTypes: [
        {
          name: "2-Sharing (AC)",
          totalBeds: 180,
          availableBeds: 6,
          annualPlanPrice: 144000,
          monthlyPlanPrice: 12000,
          securityDeposit: 10000,
          admissionFee: 2000,
          photos: [],
          description: "Spacious AC double room with attached bathroom.",
        },
        {
          name: "3-Sharing (Non-AC)",
          totalBeds: 120,
          availableBeds: 4,
          annualPlanPrice: 96000,
          monthlyPlanPrice: 8000,
          securityDeposit: 8000,
          admissionFee: 1500,
          photos: [],
          description: "Well-ventilated triple sharing room.",
        },
        {
          name: "Single (Premium)",
          totalBeds: 50,
          availableBeds: 2,
          annualPlanPrice: 216000,
          monthlyPlanPrice: 18000,
          securityDeposit: 15000,
          admissionFee: 3000,
          photos: [],
          description: "Private AC room with study desk and wardrobe.",
        },
      ],
      messPlans: [
        {
          name: "Standard Plan",
          description: "Full Board (Breakfast + Lunch + Dinner)",
          mealsIncluded: ["Breakfast", "Lunch", "Dinner"],
          priceMonthly: 4500,
          duration: "1 Month",
          isCompulsory: false,
          dietaryOptions: ["Veg", "Non-Veg"],
        },
        {
          name: "Basic Plan",
          description: "Lunch + Dinner only",
          mealsIncluded: ["Lunch", "Dinner"],
          priceMonthly: 3200,
          duration: "1 Month",
          isCompulsory: false,
          dietaryOptions: ["Veg"],
        },
      ],
    },
    {
      slug: "serenity-girls-pg",
      name: "Serenity Girls PG",
      hostelType: "girls",
      isOnCampus: false,
      distanceFromCampus: "5 min walk",
      description:
        "Off-campus premium girls PG with 24x7 security, biometric access, and all modern facilities. Rated 4.2 by 85 students.",
      totalBeds: 200,
      avgRating: 4.2,
      reviewCount: 85,
      amenities: [
        { name: "High Speed Wi-Fi", icon: "wifi" },
        { name: "Veg Only", icon: "food" },
        { name: "CCTV", icon: "security" },
        { name: "Biometric Access", icon: "biometric" },
        { name: "Laundry Service", icon: "laundry" },
      ],
      rules: [
        {
          title: "Curfew Time",
          description: "Strict curfew at 9:00 PM. No late entry permitted.",
        },
        {
          title: "Visitor Policy",
          description: "Female visitors only on weekends, 10:00 AM - 05:00 PM.",
        },
        {
          title: "Leave Permission",
          description:
            "Leave requires guardian approval via the app, 3 days in advance.",
        },
      ],
      wardenInfo: {
        name: "Mrs. Lakshmi Rao",
        phone: "9812345678",
        whatsapp: "9812345678",
        email: "serenity.warden@vydehi.edu.in",
      },
      locationInfo: {
        address: "Serenity PG, 24, EPIP Layout, Whitefield",
        walkingDistance: "5 min walk from main gate",
      },
      roomTypes: [
        {
          name: "2-Sharing (AC)",
          totalBeds: 100,
          availableBeds: 5,
          annualPlanPrice: 120000,
          monthlyPlanPrice: 10000,
          securityDeposit: 8000,
          admissionFee: 2000,
          photos: [],
          description: "AC double room.",
        },
        {
          name: "3-Sharing (Non-AC)",
          totalBeds: 100,
          availableBeds: 3,
          annualPlanPrice: 84000,
          monthlyPlanPrice: 7000,
          securityDeposit: 6000,
          admissionFee: 1500,
          photos: [],
          description: "Triple sharing room.",
        },
      ],
      messPlans: [
        {
          name: "Veg Meal Plan",
          description: "Full Board Vegetarian (Breakfast + Lunch + Dinner)",
          mealsIncluded: ["Breakfast", "Lunch", "Dinner"],
          priceMonthly: 4000,
          duration: "1 Month",
          isCompulsory: true,
          dietaryOptions: ["Veg"],
        },
      ],
    },
  ];

  for (const h of hostelDefs) {
    const existing = await prisma.hostel.findFirst({
      where: { collegeId, slug: h.slug },
    });

    let hostelId: string;

    if (existing) {
      await prisma.hostel.update({
        where: { id: existing.id },
        data: {
          name: h.name,
          hostelType: h.hostelType,
          isOnCampus: h.isOnCampus,
          distanceFromCampus: h.distanceFromCampus ?? null,
          description: h.description,
          totalBeds: h.totalBeds,
          avgRating: h.avgRating,
          reviewCount: h.reviewCount,
          amenities: h.amenities,
          rules: h.rules,
          wardenInfo: h.wardenInfo,
          locationInfo: h.locationInfo,
        },
      });
      hostelId = existing.id;
    } else {
      const hostel = await prisma.hostel.create({
        data: {
          collegeId,
          slug: h.slug,
          name: h.name,
          hostelType: h.hostelType,
          isOnCampus: h.isOnCampus,
          distanceFromCampus: h.distanceFromCampus ?? null,
          description: h.description,
          totalBeds: h.totalBeds,
          avgRating: h.avgRating,
          reviewCount: h.reviewCount,
          amenities: h.amenities,
          rules: h.rules,
          wardenInfo: h.wardenInfo,
          locationInfo: h.locationInfo,
          status: "active",
        },
      });
      hostelId = hostel.id;
    }

    // Room types
    await prisma.hostelRoomType.deleteMany({ where: { hostelId } });
    await prisma.hostelRoomType.createMany({
      data: h.roomTypes.map((rt, idx) => ({
        hostelId,
        name: rt.name,
        description: rt.description,
        totalBeds: rt.totalBeds,
        availableBeds: rt.availableBeds,
        annualPlanPrice: rt.annualPlanPrice,
        monthlyPlanPrice: rt.monthlyPlanPrice,
        securityDeposit: rt.securityDeposit,
        admissionFee: rt.admissionFee,
        photos: rt.photos,
        sortOrder: idx,
        isActive: true,
      })),
    });

    // Mess plans
    await prisma.hostelMessPlan.deleteMany({ where: { hostelId } });
    await prisma.hostelMessPlan.createMany({
      data: h.messPlans.map((mp, idx) => ({
        hostelId,
        name: mp.name,
        description: mp.description,
        mealsIncluded: mp.mealsIncluded,
        priceMonthly: mp.priceMonthly,
        duration: mp.duration,
        isCompulsory: mp.isCompulsory,
        dietaryOptions: mp.dietaryOptions,
        sortOrder: idx,
        isActive: true,
      })),
    });
  }

  console.log("✓ Hostels seeded");
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Commute Routes
// ─────────────────────────────────────────────────────────────────────────────

async function seedCommuteRoutes(collegeId: string) {
  const routeDefs = [
    {
      name: "Route 12 – HSR Layout",
      description: "Via BTM Layout, Madivala",
      stops: [
        {
          stopName: "HSR Layout BDA",
          landmark: "Complex Main Gate",
          stopOrder: 0,
        },
        { stopName: "Agara Junction", landmark: null, stopOrder: 1 },
        { stopName: "Silk Board", landmark: null, stopOrder: 2 },
        { stopName: "BTM Water Tank", landmark: null, stopOrder: 3 },
        {
          stopName: "College Campus",
          landmark: "Main Block Entrance",
          stopOrder: 4,
        },
      ],
      buses: [
        {
          busNumber: "KA-01-F-4829",
          busName: "Tata Marcopolo (AC)",
          busType: "AC",
          totalSeats: 42,
          driverName: "Ravi Kumar",
          driverPhone: "9988776655",
          monthlyFee: 2083,
        },
      ],
    },
    {
      name: "Route 12B – HSR Express",
      description: "Via 27th Main, Agara",
      stops: [
        {
          stopName: "HSR Layout 27th Main",
          landmark: "Agara Lake",
          stopOrder: 0,
        },
        { stopName: "Forum Mall", landmark: "Koramangala", stopOrder: 1 },
        {
          stopName: "College Campus",
          landmark: "Main Block Entrance",
          stopOrder: 2,
        },
      ],
      buses: [
        {
          busNumber: "KA-01-G-2200",
          busName: "Force Traveller (Non-AC)",
          busType: "Non-AC",
          totalSeats: 26,
          driverName: "Suresh B",
          driverPhone: "9977665544",
          monthlyFee: 1800,
        },
      ],
    },
    {
      name: "Route 5 – Electronic City",
      description: "Via Silk Board, Bommanahalli",
      stops: [
        {
          stopName: "Electronic City Phase 1",
          landmark: "Tech Park Gate",
          stopOrder: 0,
        },
        { stopName: "Bommanahalli", landmark: null, stopOrder: 1 },
        { stopName: "Silk Board", landmark: null, stopOrder: 2 },
        {
          stopName: "College Campus",
          landmark: "Main Block Entrance",
          stopOrder: 3,
        },
      ],
      buses: [
        {
          busNumber: "KA-01-H-3355",
          busName: "Tata Starbus (AC)",
          busType: "AC",
          totalSeats: 35,
          driverName: "Mohan Rao",
          driverPhone: "9966554433",
          monthlyFee: 2200,
        },
      ],
    },
  ];

  for (const r of routeDefs) {
    const existing = await prisma.commuteRoute.findFirst({
      where: { collegeId, name: r.name },
    });

    let routeId: string;

    if (existing) {
      routeId = existing.id;
      await prisma.commuteRouteStop.deleteMany({ where: { routeId } });
      await prisma.commuteBus.deleteMany({ where: { routeId } });
    } else {
      const route = await prisma.commuteRoute.create({
        data: {
          collegeId,
          name: r.name,
          description: r.description,
          isActive: true,
        },
      });
      routeId = route.id;
    }

    await prisma.commuteRouteStop.createMany({
      data: r.stops.map((s) => ({
        routeId,
        stopName: s.stopName,
        landmark: s.landmark,
        stopOrder: s.stopOrder,
      })),
    });

    await prisma.commuteBus.createMany({
      data: r.buses.map((b) => ({
        routeId,
        busNumber: b.busNumber,
        busName: b.busName,
        busType: b.busType,
        totalSeats: b.totalSeats,
        availableSeats: b.totalSeats,
        driverName: b.driverName,
        driverPhone: b.driverPhone,
        monthlyFee: b.monthlyFee,
        isActive: true,
      })),
    });
  }

  console.log("✓ Commute routes seeded");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  BeaconU Demo Seed\n");

  const uniTypeIds = await seedUniversityTypes();
  const { disciplineIds } = await seedStreamsAndDisciplines();
  const studyLevelIds = await seedStudyLevels();
  const programTypeIds = await seedProgramTypes();

  const university = await seedUniversity(uniTypeIds["deemed_university"]);
  const college = await seedCollege(university.id);

  const roleIds = await seedCollegeRoles(college.id);
  await seedCollegeAdmin(college.id, roleIds["college_admin"]);

  const campus = await seedCampus(college.id);

  const courseIds = await seedCourses(
    college.id,
    campus.id,
    disciplineIds,
    studyLevelIds,
    programTypeIds,
  );

  await seedFeeStructures(college.id, courseIds);
  await seedHostels(college.id);
  await seedCommuteRoutes(college.id);

  console.log("\n✅  Demo seed complete!\n");
  console.log("  College slug :", COLLEGE_SLUG);
  console.log("  College ID   :", college.id);
  console.log("  Admin email  :", ADMIN_EMAIL);
  console.log("  Admin password:", ADMIN_PASSWORD);
  console.log("");
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
