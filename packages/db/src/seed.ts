/**
 * BeaconU — Single Consolidated Seed
 *
 * Run:  pnpm db:seed          (root)
 *       pnpm --filter @beaconu/db seed
 *
 * Idempotent — safe to re-run (upserts throughout).
 *
 * What it seeds (mirrors the real API flows):
 *   1. Platform permissions, roles, and platform admins (super admin + team)
 *   2. Blink roles
 *   3. Global lookups (university types, streams/disciplines, study levels, program types)
 *   4. University
 *   5. TWO colleges onboarded via the real provisioning flow:
 *      onboarding request → provision (pending_setup + system roles w/ permissions
 *      + admin staff) → account setup (password) → registration wizard
 *      (profile sections = 5 college tabs, campuses, departments, courses with all
 *      14 course-setup tabs + 19 per-tab JSON columns) → finalize (active)
 *   6. Institution group linking both colleges
 *   7. College quotas (in_state / out_of_state buckets) + course quotas
 *   8. Open admission cycle + cycle courses (application fees) + pooled seat matrix
 *      (including one pool shared across courses)
 *   9. Fee structures, hostels, commute routes, libraries
 *  10. Blink users (associate admin, associate employee, campus ambassadors) + wallets
 *  11. Counsellors (academic + mindcare)
 *  12. Students (OTP/Google login — no passwords)
 *
 * All credentials are printed at the end of the run.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./index";

// ─────────────────────────────────────────────────────────────────────────────
// Credentials (single source of truth — printed at the end)
// ─────────────────────────────────────────────────────────────────────────────

const CREDENTIALS = {
  platformAdmins: [
    {
      role: "super_admin",
      fullName: "Platform Super Admin",
      email: "superadmin@beaconu.com",
      password: "Super@123",
    },
    {
      role: "operations_admin",
      fullName: "Neha Operations",
      email: "ops@beaconu.com",
      password: "Ops@123",
    },
    {
      role: "content_manager",
      fullName: "Kiran Content",
      email: "content@beaconu.com",
      password: "Content@123",
    },
  ],
  collegeAdmins: [
    {
      collegeSlug: "vydehi-institute",
      roleSlug: "college_admin",
      fullName: "Dr. Rajiv Menon",
      email: "admin@vydehi.edu.in",
      password: "Admin@123",
      phone: "9876543210",
    },
    {
      collegeSlug: "vydehi-institute",
      roleSlug: "hostel_admin",
      fullName: "Mrs. Sarah Jenkins",
      email: "hostel@vydehi.edu.in",
      password: "Hostel@123",
      phone: "9876512340",
    },
    {
      collegeSlug: "beacon-institute-of-technology",
      roleSlug: "college_admin",
      fullName: "Prof. Anita Desai",
      email: "admin@beacontech.edu.in",
      password: "Admin@123",
      phone: "9876500011",
    },
  ],
  blink: {
    associateAdmin: {
      fullName: "Ramesh Agency",
      email: "associate@blinkedu.com",
      password: "Blink@123",
      agencyName: "Blink Education Services",
      agencyRegNumber: "BLINK-REG-1001",
    },
    associateEmployee: {
      fullName: "Divya Employee",
      email: "employee@blinkedu.com",
      password: "Blink@123",
    },
    ambassadors: [
      {
        collegeSlug: "vydehi-institute",
        fullName: "Arjun Ambassador",
        email: "arjun.ambassador@vydehi.edu.in",
        password: "Campus@123",
        ambassadorType: "student",
        phone: "9812340001",
      },
      {
        collegeSlug: "beacon-institute-of-technology",
        fullName: "Meera Ambassador",
        email: "meera.ambassador@beacontech.edu.in",
        password: "Campus@123",
        ambassadorType: "student",
        phone: "9812340002",
      },
    ],
  },
  counsellors: [
    {
      fullName: "Dr. Shalini Verma",
      email: "academic.counsellor@beaconu.com",
      password: "Counsel@123",
      counsellorType: "academic",
      counsellorCode: "CSL-1001",
      sessionFee: 499,
      knownLanguages: "English, Hindi, Kannada",
    },
    {
      fullName: "Dr. Farah Khan",
      email: "mindcare.counsellor@beaconu.com",
      password: "Counsel@123",
      counsellorType: "mindcare",
      counsellorCode: "CSL-1002",
      sessionFee: 799,
      knownLanguages: "English, Hindi, Malayalam",
    },
  ],
  blogAuthor: {
    fullName: "Nisha Writer",
    email: "author@beaconu.com",
    password: "Author@123",
    bio: "Education writer covering admissions, exams, and campus life.",
  },
  // Students authenticate via phone OTP or Google — no passwords.
  students: [
    {
      fullName: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "9000000001",
    },
    {
      fullName: "Priya Nair",
      email: "priya.nair@example.com",
      phone: "9000000002",
    },
    {
      fullName: "Rahul Verma",
      email: "rahul.verma@example.com",
      phone: "9000000003",
    },
    {
      fullName: "Sneha Iyer",
      email: "sneha.iyer@example.com",
      phone: "9000000004",
    },
    {
      fullName: "Mohammed Faiz",
      email: "mohammed.faiz@example.com",
      phone: "9000000005",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Tab constants — mirror the API validators
//   Registration tabs → colleges.profile_sections (college-registration.service)
//   Course setup tabs → courses.metadata.tabData (course-tabs.validator/service)
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRATION_TAB_IDS = [
  "college_overview",
  "student_code_of_conduct",
  "happenings",
  "institutions_across_world",
  "commute",
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

// Matches CryptoUtils.SALT_ROUNDS in apps/api/src/shared/utils
const SALT_ROUNDS = 12;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Platform permissions, roles, admins
// ─────────────────────────────────────────────────────────────────────────────

async function seedPlatformRbac() {
  const permissions = [
    { code: "*", description: "Super Admin wildcard — bypasses all checks" },
    {
      code: "platform:profiles:view",
      description: "View student and user profiles",
    },
    {
      code: "platform:operations:manage",
      description: "Manage platform operations",
    },
    { code: "platform:leads:manage", description: "Manage student leads" },
    { code: "platform:finance:view", description: "View financial data" },
    {
      code: "platform:finance:manage",
      description: "Manage financial operations",
    },
    { code: "platform:support:manage", description: "Manage support tickets" },
    { code: "platform:content:manage", description: "Manage platform content" },
  ];

  for (const perm of permissions) {
    await prisma.platformPermission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
  }

  const roles = [
    { name: "Super Admin", slug: "super_admin", permissions: ["*"] },
    {
      name: "Operations Admin",
      slug: "operations_admin",
      permissions: ["platform:profiles:view", "platform:operations:manage"],
    },
    {
      name: "Lead Manager",
      slug: "lead_manager",
      permissions: ["platform:profiles:view", "platform:leads:manage"],
    },
    {
      name: "Finance Team",
      slug: "finance_team",
      permissions: [
        "platform:profiles:view",
        "platform:finance:view",
        "platform:finance:manage",
      ],
    },
    {
      name: "Support Team",
      slug: "support_team",
      permissions: ["platform:profiles:view", "platform:support:manage"],
    },
    {
      name: "Content Manager",
      slug: "content_manager",
      permissions: ["platform:profiles:view", "platform:content:manage"],
    },
  ];

  const roleIds: Record<string, string> = {};
  for (const role of roles) {
    const row = await prisma.platformRole.upsert({
      where: { slug: role.slug },
      update: { name: role.name, isSystemRole: true, isActive: true },
      create: { name: role.name, slug: role.slug, isSystemRole: true },
    });
    roleIds[role.slug] = row.id;

    await prisma.platformRolePermission.deleteMany({
      where: { platformRoleId: row.id },
    });
    await prisma.platformRolePermission.createMany({
      data: role.permissions.map((permissionCode) => ({
        platformRoleId: row.id,
        permissionCode,
      })),
      skipDuplicates: true,
    });
  }
  console.log("✓ Platform permissions & roles");

  let superAdminId = "";
  for (const admin of CREDENTIALS.platformAdmins) {
    const passwordHash = await hashPassword(admin.password);
    const row = await prisma.platformAdmin.upsert({
      where: { email: admin.email },
      update: {
        fullName: admin.fullName,
        passwordHash,
        platformRoleId: roleIds[admin.role],
        status: "active",
      },
      create: {
        fullName: admin.fullName,
        email: admin.email,
        passwordHash,
        platformRoleId: roleIds[admin.role],
        status: "active",
      },
    });
    if (admin.role === "super_admin") superAdminId = row.id;
  }
  console.log("✓ Platform admins");
  return { superAdminId };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Blink roles
// ─────────────────────────────────────────────────────────────────────────────

async function seedBlinkRoles() {
  const roles = [
    { name: "Associate Admin", slug: "associate_admin" },
    { name: "Associate Employee", slug: "associate_employee" },
    { name: "Campus Ambassador", slug: "campus_ambassador" },
  ];

  const ids: Record<string, string> = {};
  for (const role of roles) {
    const row = await prisma.blinkRole.upsert({
      where: { slug: role.slug },
      update: { name: role.name, isSystemRole: true, isActive: true },
      create: { name: role.name, slug: role.slug, isSystemRole: true },
    });
    ids[role.slug] = row.id;
  }
  console.log("✓ Blink roles");
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Global lookups
// ─────────────────────────────────────────────────────────────────────────────

async function upsertBySlugOrName(
  model: {
    findUnique: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
  },
  item: { name: string; slug: string; sortOrder: number },
) {
  const bySlug = await model.findUnique({ where: { slug: item.slug } });
  if (bySlug) {
    return model.update({
      where: { id: bySlug.id },
      data: { name: item.name, sortOrder: item.sortOrder, isActive: true },
    });
  }
  const byName = await model.findUnique({ where: { name: item.name } });
  if (byName) {
    return model.update({
      where: { id: byName.id },
      data: { sortOrder: item.sortOrder, isActive: true },
    });
  }
  return model.create({ data: item });
}

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

  const ids: Record<string, string> = {};
  for (const t of types) {
    const row = await upsertBySlugOrName(prisma.universityType, t);
    ids[t.slug] = row.id;
  }
  console.log("✓ University types");
  return ids;
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

  const disciplineIds: Record<string, string> = {};
  for (const s of streamDefs) {
    const stream = await upsertBySlugOrName(prisma.stream, {
      name: s.name,
      slug: s.slug,
      sortOrder: s.sortOrder,
    });
    for (const d of s.disciplines) {
      const disc = await prisma.discipline.upsert({
        where: { uq_discipline_slug: { streamId: stream.id, slug: d.slug } },
        update: { name: d.name, isActive: true },
        create: { name: d.name, slug: d.slug, streamId: stream.id },
      });
      disciplineIds[d.slug] = disc.id;
    }
  }
  console.log("✓ Streams & disciplines");
  return disciplineIds;
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
    const row = await upsertBySlugOrName(prisma.studyLevel, l);
    ids[l.slug] = row.id;
  }
  console.log("✓ Study levels");
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
    const row = await upsertBySlugOrName(prisma.programType, t);
    ids[t.slug] = row.id;
  }
  console.log("✓ Program types");
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. University
// ─────────────────────────────────────────────────────────────────────────────

async function seedUniversity(universityTypeId: string) {
  const data = {
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
      academicOfferings: ["Engineering", "Management", "Law", "Allied health"],
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
      videos: [{ title: "Convocation 2024", thumbnailUrl: "", videoUrl: "" }],
    },
  };

  const university = await prisma.university.upsert({
    where: { slug: "vydehi-deemed-university" },
    update: data,
    create: { slug: "vydehi-deemed-university", ...data },
  });
  console.log("✓ University:", university.id);
  return university;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. College profile sections (the 5 registration tabs + display JSON)
// ─────────────────────────────────────────────────────────────────────────────

interface CollegeSeedDef {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  district: string;
  address: string;
  pinCode: string;
  establishedYear: number;
  website: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  contactName: string;
}

/**
 * The 5 registration tabs, in the EXACT shape the college-admin profile form
 * (apps/college-admin/app/(dashboard)/setup/profile/page.tsx) reads and writes.
 * The same raw sections are served to student apps via
 * GET /public/colleges/:slug sections (public-college.controller.ts), with
 * `commute` and `institutions_across_world` hydrated live from their tables.
 */
function buildProfileSections(def: CollegeSeedDef) {
  return {
    college_overview: {
      id: "college_overview",
      enabled: true,
      name: def.name,
      alt_name: def.shortName,
      location_name: `${def.city}, ${def.state}`,
      type: "Private",
      established: def.establishedYear,
      navigation_tabs: ["Overview", "Governance"],
      about: `${def.name} is a premier multidisciplinary institution in ${def.city}, known for its holistic approach to education, modern infrastructure, and strong student outcomes.`,
      accolades: [
        {
          tag: "NAAC A+",
          title: "Accredited with A+ grade by NAAC (2023)",
          image: "",
        },
        {
          tag: "NIRF Rank 3",
          title: "India's top ranked institutions 2024",
          image: "",
        },
      ],
      university_details: [
        { label: "Established year", value: String(def.establishedYear) },
        { label: "Nature of University", value: "Private" },
        { label: "Type of University", value: "Deemed University" },
        { label: "District", value: def.district },
        { label: "State", value: def.state },
        { label: "Pincode", value: def.pinCode },
        { label: "Total Courses", value: "45" },
        { label: "Gender", value: "Co-Ed" },
        { label: "Campus Size", value: "65 Acres" },
        { label: "Avg Student Count", value: "1,500+" },
        { label: "Students Outside State", value: "35%" },
      ],
      // Default fixed amenities use "amenity:<key>" icon keys resolved by
      // packages/utils/src/college-overview.ts
      amenities: [
        { label: "Wi-Fi", icon: "amenity:wifi" },
        { label: "Toiletries", icon: "amenity:toiletries" },
        { label: "Bathrobes", icon: "amenity:bathrobes" },
        { label: "Smart Classrooms", icon: "amenity:smart_classrooms" },
        { label: "Central Library", icon: "" },
        { label: "Sports Complex", icon: "" },
        { label: "Cafeteria", icon: "" },
        { label: "Medical Centre", icon: "" },
      ],
      inside_campus_facilities: [
        { label: "Subway", subtitle: "Food Court", icon: "" },
        { label: "Indian Post", subtitle: "Postal Service", icon: "" },
        { label: "SBI ATM", subtitle: "Banking", icon: "" },
        {
          label: "Medical Centre",
          subtitle: "24x7 student health centre",
          icon: "",
        },
      ],
      location: {
        address: def.address,
        latitude: def.latitude,
        longitude: def.longitude,
        map_link: `https://maps.google.com/?q=${def.latitude},${def.longitude}`,
      },
      nearby_access: [
        {
          category: "Transit",
          items: [
            { name: "Metro Station", distance: "2.5 km" },
            { name: `${def.shortName} Bus Stop`, distance: "0.1 km" },
            { name: "Railway Station", distance: "4.2 km" },
          ],
        },
        {
          category: "Essentials",
          items: [
            { name: "Apollo Spectra Hospitals", distance: "3.0 km" },
            { name: "VIBGYOR High School", distance: "0.1 km" },
          ],
        },
        {
          category: "Utility",
          items: [
            { name: "State Bank of India", distance: "0.5 km" },
            { name: "MedPlus Pharmacy", distance: "0.3 km" },
          ],
        },
      ],
      campus_ambassadors: [],
      social: [
        { platform: "LinkedIn", icon: "", url: "https://linkedin.com" },
        { platform: "Instagram", icon: "", url: "https://instagram.com" },
        { platform: "Website", icon: "", url: def.website },
      ],
      campus_reels: [
        {
          title: "Campus Tour",
          video: "",
          duration: "01:20",
          date: "2026-06-01",
          thumbnail: "",
          type: "reel",
        },
      ],
    },
    student_code_of_conduct: {
      id: "student_code_of_conduct",
      enabled: true,
      tab: "student_code_of_conduct",
      section_title: "General Rules of Discipline",
      rules: [
        {
          rule: "Always carry the Identity Card with you while in college or the hospital.",
        },
        { rule: "Attend the classes and clinical postings on time." },
        {
          rule: "Maintain a minimum of 75% attendance to be eligible for examinations.",
        },
        {
          rule: "Use of mobile phones is strictly prohibited in classrooms, laboratories, and library.",
        },
        {
          rule: "Respect the faculty, staff, and fellow students. Ragging is a punishable offense.",
        },
        {
          rule: "Any damage to college property will be recovered from the student concerned.",
        },
      ],
    },
    happenings: {
      id: "happenings",
      enabled: true,
      title: "Happenings",
      filters: {
        categories: [
          "College News",
          "Student Achievements",
          "Faculty Achievements",
        ],
      },
      happenings: [
        {
          category: "College News",
          date: "2026-08-15",
          title: "Research Innovation Week",
          description:
            "A week-long showcase of student and faculty research projects.",
          image: "",
          link: "",
        },
        {
          category: "Student Achievements",
          date: "2026-09-05",
          title: "Inter-College Cultural Fest",
          description:
            "Annual cultural festival with 40+ participating colleges.",
          image: "",
          link: "",
        },
        {
          category: "Faculty Achievements",
          date: "2026-10-12",
          title: "National Conference on Emerging Technologies",
          description:
            "Two-day conference with keynote speakers from industry.",
          image: "",
          link: "",
        },
      ],
    },
    // Hydrated live from institution_group tables by the API; stored shell only.
    institutions_across_world: {
      id: "institutions_across_world",
      enabled: true,
      title: "Institution Across the World",
      institutions: [],
      group: null,
    },
    // Hydrated live from commute tables by the API; stored shell only.
    commute: {
      id: "commute",
      enabled: true,
      tab: "commute",
      title: "Commute",
      pickup_points: [],
      selected_pickup_point: "",
      routes: [],
      rules_and_code_of_conduct: {
        title: "Rules & Code of Conduct",
        subtitle: "Detailed guidelines for student commuters",
        intro:
          "To ensure a safe and punctual commute for everyone, all students utilizing the transport facility must strictly adhere to the following code of conduct.",
        rules: [],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Course setup tab data (the 14 course-setup tabs → courses.metadata.tabData)
//    Shapes mirror the formatters in course-tabs.service.ts
// ─────────────────────────────────────────────────────────────────────────────

interface CourseSeedDef {
  name: string;
  code: string;
  disciplineSlug: string;
  studyLevelSlug: string;
  programTypeSlug: string;
  departmentSlug: string;
  duration: string;
  intakeCapacity: number;
  studyMode: "full_time" | "part_time" | "online";
  totalFee: string;
  applicationFee: number;
  highlights: string[];
  quotaSlugs: string[];
}

/**
 * All 14 course-setup tabs in the EXACT shape the college-admin course editor
 * (apps/college-admin/app/(dashboard)/setup/academics/page.tsx) reads and
 * writes via PATCH /college-admin/courses/:id/tabs/:tabName. The public
 * student endpoints derive their display DTOs from these same shapes
 * (course-tabs.service.ts transformers).
 */
function buildCourseSetupTabData(
  course: CourseSeedDef,
  facilities: { hostelIds: string[]; libraryIds: string[] },
) {
  return {
    course_info: {
      id: "course_info",
      enabled: true,
      name: course.name,
      quick_info: [
        { label: "DURATION", value: course.duration },
        {
          label: "STUDY MODE",
          value: course.studyMode === "full_time" ? "Full Time" : "Part Time",
        },
        { label: "ACADEMIC CYCLE", value: "Semester" },
        { label: "STUDY CREDITS", value: "120 Credits" },
        { label: "GENDER ADMITTED", value: "Co-Ed" },
        { label: "CAMPUS CATEGORY", value: "On Campus" },
      ],
      highlights: {
        title: "Program Highlights",
        items: course.highlights.map((text) => ({ text })),
      },
      accreditations: {
        title: "Course Accolades",
        items: [
          {
            tag: "NAAC A+",
            image: "",
            document: "",
            title: "Accredited programme under NAAC A+ institution",
          },
          {
            tag: "Outcome-focused",
            image: "",
            document: "",
            title: "Curriculum designed with updated industry benchmarks",
          },
        ],
      },
      admission_batches: [
        {
          label: "2026-27",
          status: "open",
          banner: {
            enabled: true,
            tag: "ADMISSIONS OPEN",
            message: `Limited seats — ${course.intakeCapacity} total`,
            progress_percentage: 65,
          },
        },
        {
          label: "2027-28",
          status: "upcoming",
          banner: {
            enabled: false,
            tag: "",
            message: "",
            progress_percentage: 0,
          },
        },
      ],
      keyDates: {
        title: "Key Dates to Remember",
        items: [
          { date: "2026-06-15", label: "Application Opens", status: "" },
          {
            date: "2026-08-15",
            label: "Application Closes",
            status: "closing_soon",
          },
          { date: "2026-09-02", label: "Class Commencement", status: "" },
        ],
      },
      curriculum: {
        brochure_link: "",
        semesters: [
          {
            id: "sem_1",
            name: "Semester 1",
            expanded: true,
            footnote: "Foundation semester",
            core_subjects: [
              "Foundation Course I",
              "Foundation Course II",
              "Communication Skills",
            ],
            specializations: [],
          },
          {
            id: "sem_2",
            name: "Semester 2",
            expanded: false,
            footnote: "",
            core_subjects: [
              "Core Course I",
              "Core Course II",
              "Practical Lab I",
            ],
            specializations: [
              {
                title: "Electives",
                selected: "",
                subjects: "Elective I, Elective II",
              },
            ],
          },
        ],
      },
      course_structure: [
        { title: "Core Courses", credits: 60 },
        { title: "Electives", credits: 30 },
        { title: "Practicals & Labs", credits: 20 },
        { title: "Projects & Internship", credits: 10 },
      ],
      value_added_courses: [
        "Professional Communication",
        "Industry Readiness Workshop",
      ],
      flexible_exit_options: [
        {
          title: "Certificate",
          description: "Exit after Year 1 with a certificate",
        },
        { title: "Diploma", description: "Exit after Year 2 with a diploma" },
      ],
      higher_education: {
        global_certifications: [
          "Industry Certifications",
          "Professional Licensure Tracks",
        ],
        postgraduation: ["Postgraduate Studies", "Doctoral Research Pathways"],
      },
      class_timings: [
        { day: "Monday", closed: false, start: "09:30", end: "16:30" },
        { day: "Tuesday", closed: false, start: "09:30", end: "16:30" },
        { day: "Wednesday", closed: false, start: "09:30", end: "16:30" },
        { day: "Thursday", closed: false, start: "09:30", end: "16:30" },
        { day: "Friday", closed: false, start: "09:30", end: "16:30" },
        { day: "Saturday", closed: false, start: "09:30", end: "13:00" },
        { day: "Sunday", closed: true, start: "", end: "" },
      ],
      industry_tools: ["MS Excel", "Power BI", "Python"],
      lab_facilities: ["Computer Lab", "Simulation Lab"],
      classroom_facilities: ["Smart Classrooms", "Projector-enabled rooms"],
      bonus_certification: {
        title: "Industry Readiness Workshop",
        tag: "BONUS",
        description: "Conducted with sector experts as part of the programme",
        link: "",
      },
      career_opportunities: [
        { role: "Research Associate", salary_range: "4-8 LPA" },
        { role: "Operations Executive", salary_range: "4-6 LPA" },
        { role: "Domain Specialist", salary_range: "6-12 LPA" },
      ],
      featuredAlumni: {
        title: "Featured Alumni",
        items: [
          {
            name: "Rohan Mehta",
            image: "",
            designation: "Senior Analyst, Deloitte",
            career_progression: [
              { year: "2022", description: "Graduated with distinction" },
              {
                year: "2024",
                description: "Promoted to Senior Analyst at Deloitte",
              },
            ],
          },
        ],
      },
      faqs: [
        {
          question: "What is the admission process?",
          answer:
            "Apply online, pay the application fee, complete the assessment and interview rounds, then accept your offer.",
        },
        {
          question: "Are scholarships available?",
          answer:
            "Yes — merit scholarships of up to 25% based on entrance scores.",
        },
      ],
    },
    admission_policy: {
      id: "admission_policy",
      enabled: true,
      title: "Admission Policy",
      seat_matrix: {
        title: "Seat Matrix",
        columns: ["Quota Category", "Total", "Open"],
        rows: course.quotaSlugs.map((slug) => ({
          quota_category: QUOTA_DEFS.find((q) => q.slug === slug)?.name ?? slug,
          total: String(
            Math.round(course.intakeCapacity / course.quotaSlugs.length),
          ),
          open: String(
            Math.round(course.intakeCapacity / course.quotaSlugs.length),
          ),
        })),
      },
      entrance_exams_accepted: [
        {
          level_label: "National Level",
          exams: [
            {
              name: "JEE Main",
              exam_code: "JEE-202",
              code_badge: "JEE",
              min_criteria_label: "Min Percentile",
              min_criteria_value: "90",
            },
            {
              name: "NEET",
              exam_code: "NEET-X5",
              code_badge: "NEET",
              min_criteria_label: "Min Rank",
              min_criteria_value: "Top 5000",
            },
          ],
        },
        {
          level_label: "State Level",
          exams: [
            {
              name: "Karnataka PGCET",
              exam_code: "KEA-55",
              code_badge: "KEA",
              min_criteria_label: "Min Score",
              min_criteria_value: "1200",
            },
          ],
        },
      ],
    },
    placements: {
      id: "placements",
      enabled: true,
      title: "Placements",
      download_report: { url: "" },
      summary_stats: [
        { label: "Placement Rate", value: "94", unit: "%" },
        { label: "Highest Package", value: "14.2", unit: "LPA" },
        { label: "Average Package", value: "4.2", unit: "LPA" },
        { label: "Companies Visited", value: "120", unit: "+" },
      ],
      placement_trends: {
        title: "Placement Trends",
        data_points: [
          { year: "2023", avg_package: "3.9", highlighted: false },
          { year: "2024", avg_package: "4.2", highlighted: false },
          { year: "2025", avg_package: "4.6", highlighted: true },
        ],
      },
      industry_salary_report: {
        title: "Industry & Salary Report",
        rows: [
          {
            industry: "BFSI",
            subtitle: "Banking & Finance",
            avg_package: "8.2",
            max_package: "12",
            students_placed: "155",
            progress_percentage: "80",
          },
          {
            industry: "Consulting",
            subtitle: "Management Consulting",
            avg_package: "9.1",
            max_package: "14.5",
            students_placed: "81",
            progress_percentage: "65",
          },
          {
            industry: "Technology",
            subtitle: "IT Services & Products",
            avg_package: "7.4",
            max_package: "11",
            students_placed: "140",
            progress_percentage: "75",
          },
        ],
      },
      notable_offers: {
        title: "Notable Offers",
        items: [
          {
            id: "offer_1",
            company_name: "Deloitte",
            company_logo: "",
            company_initial: "D",
            role: "Senior Analyst",
            package: "14.5",
            unit: "LPA",
            package_label: "Package Offered",
            badge: "HIGHEST",
            category: "Consulting",
          },
          {
            id: "offer_2",
            company_name: "Accenture",
            company_logo: "",
            company_initial: "A",
            role: "Analyst",
            package: "11.2",
            unit: "LPA",
            package_label: "Package Offered",
            badge: "",
            category: "Technology",
          },
        ],
      },
      all_company_statistics: {
        title: "All Company Statistics",
        rows: [
          {
            company_name: "Deloitte",
            company_initial: "D",
            company_logo: "",
            avg_package: "9.2",
            max_package: "14.5",
            students_placed: "141",
            progress_percentage: "90",
          },
          {
            company_name: "Accenture",
            company_initial: "A",
            company_logo: "",
            avg_package: "7.8",
            max_package: "11.2",
            students_placed: "270",
            progress_percentage: "78",
          },
          {
            company_name: "TCS",
            company_initial: "T",
            company_logo: "",
            avg_package: "6.5",
            max_package: "9.0",
            students_placed: "340",
            progress_percentage: "70",
          },
        ],
      },
      student_success: {
        title: "Student Success Stories",
        items: [
          {
            student_name: "Rohan Mehta",
            student_avatar: "",
            placed_at: "Deloitte",
            quote:
              "The placement support helped me secure a role at a top firm. Best decision ever!",
            type: "youtube",
            thumbnail: "",
            video_url: "",
          },
          {
            student_name: "Priya Nair",
            student_avatar: "",
            placed_at: "Accenture",
            quote:
              "Excellent training and mentorship. I feel confident in my career path.",
            type: "youtube",
            thumbnail: "",
            video_url: "",
          },
        ],
      },
    },
    fees: {
      id: "fees",
      enabled: true,
      fee_structure_pdf: { url: "" },
      fee_details: [
        {
          quota: "General",
          gender: "Co-Ed",
          tuition_fees: [
            { year: "Year 1", amount: "Rs 1,25,276" },
            { year: "Year 2", amount: "Rs 1,25,276" },
          ],
          one_time_payable_fees: [
            {
              label: "Application Fee",
              amount: `Rs ${course.applicationFee.toLocaleString("en-IN")}`,
            },
            { label: "Admission Fee", amount: "Rs 15,000" },
          ],
          additional_fees: [
            { label: "Examination Fee (Annual)", amount: "Rs 3,500" },
            { label: "Library Fee (Annual)", amount: "Rs 1,200" },
          ],
          deadlines_and_installments: [
            {
              label: "1st Installment (Booking)",
              amount: "Rs 25,000",
              due: "within 10 days",
            },
            {
              label: "2nd Installment",
              amount: "Rs 50,138",
              due: "before classes start",
            },
            {
              label: "Final Installment",
              amount: "Rs 50,138",
              due: "after 60 days",
            },
          ],
          fees_summary: {
            full_course_fee: course.totalFee,
            booking_amount: "Rs 25,000",
          },
        },
      ],
      whats_included: [
        "Tuition",
        "Library access",
        "Lab charges",
        "Student clubs",
      ],
      whats_excluded: [
        "Hostel & mess",
        "Transport",
        "Examination re-registration",
      ],
      refund_policy: [
        "100% refund of tuition fee if withdrawn before classes start.",
        "Booking amount is non-refundable after seat confirmation.",
      ],
    },
    financial_aid: {
      id: "financial_aid",
      enabled: true,
      merit_scholarship: {
        title: "Merit Scholarship",
        port_entries: [
          {
            id: "port_neet",
            name: "NEET Score",
            terms_and_conditions: [
              "Scholarship applies to first-year tuition only.",
              "Continued scholarship requires CGPA above 8.0.",
            ],
            score_ranges: [
              {
                id: "range_1",
                range_label: "Top 1000 Rank",
                discount_type: "percentage",
                discount_value: 25,
                max_scholarship_amount: "Rs 87,500",
                net_payable_amount: "Rs 2,62,500",
              },
              {
                id: "range_2",
                range_label: "Rank 1001 - 5000",
                discount_type: "percentage",
                discount_value: 15,
                max_scholarship_amount: "Rs 52,500",
                net_payable_amount: "Rs 2,97,500",
              },
            ],
          },
          {
            id: "port_board",
            name: "Board Exam Percentage",
            terms_and_conditions: [
              "Applicable for 90%+ aggregate in qualifying exam.",
            ],
            score_ranges: [
              {
                id: "range_1",
                range_label: "95% and above",
                discount_type: "percentage",
                discount_value: 20,
                max_scholarship_amount: "Rs 70,000",
                net_payable_amount: "Rs 2,80,000",
              },
            ],
          },
        ],
      },
      financial_concessions: {
        title: "Financial Concessions",
        items: [
          {
            name: "Upfront Fee Concession",
            discount_percent: 10,
            details: {
              eligibility_criteria: [
                "Full course fee paid upfront at admission",
                "Not combinable with merit scholarship",
              ],
              scholarship_amount: "Rs 35,000",
              net_payable: "Rs 3,15,000",
            },
          },
          {
            name: "Sibling Concession",
            discount_percent: 5,
            details: {
              eligibility_criteria: [
                "Sibling currently enrolled at the institution",
              ],
              scholarship_amount: "Rs 17,500",
              net_payable: "Rs 3,32,500",
            },
          },
        ],
      },
    },
    student_housing: {
      id: "student_housing",
      enabled: true,
      summary: "On-campus and nearby verified hostel options available",
      hostelIds: facilities.hostelIds,
    },
    exam_policy: buildExamPolicyTabData(),
    faculty: {
      id: "faculty",
      enabled: true,
      list: [
        {
          id: "faculty_001",
          name: "Dr. Rajesh Kumar",
          photo: "",
          designation: "Professor & Head",
          department: "Department of Cardiology",
          education: [
            {
              degree: "DM in Cardiology",
              institution: "AIIMS, New Delhi",
              duration: "2005 - 2008",
            },
            {
              degree: "MD in Medicine",
              institution: "AIIMS, New Delhi",
              duration: "2001 - 2004",
            },
          ],
          professional_experience: [
            {
              role: "Professor & Head",
              organization: "Current Institution",
              duration: "2020 - Present",
              is_current: true,
            },
            {
              role: "Senior Consultant",
              organization: "City Heart Institute",
              duration: "2015 - 2020",
              is_current: false,
            },
          ],
        },
        {
          id: "faculty_002",
          name: "Dr. Anjali Sharma",
          photo: "",
          designation: "Associate Professor",
          department: "Department of Neurology",
          education: [
            {
              degree: "DM in Neurology",
              institution: "NIMHANS, Bangalore",
              duration: "2008 - 2011",
            },
          ],
          professional_experience: [
            {
              role: "Associate Professor",
              organization: "Current Institution",
              duration: "2018 - Present",
              is_current: true,
            },
          ],
        },
      ],
    },
    review: {
      id: "review",
      enabled: true,
      // Editor binds overallRating as a scalar; public transform falls back
      // to average_rating / total_reviews.
      overallRating: "4.3",
      average_rating: 4.3,
      total_reviews: 128,
      reviews: [
        {
          id: "review_001",
          reviewer_name: "Ananya S",
          date: "2026-05-12",
          rating: 5,
          comment:
            "Great faculty and placement support. The labs are genuinely well equipped.",
        },
        {
          id: "review_002",
          reviewer_name: "Karthik R",
          date: "2026-04-28",
          rating: 4,
          comment: "Good curriculum, hostel food could improve.",
        },
      ],
    },
    library: {
      id: "library",
      enabled: true,
      libraryIds: facilities.libraryIds,
    },
    clubs_associations: {
      id: "clubs_associations",
      enabled: true,
      clubs: [
        {
          id: "club_nss",
          name: "NSS",
          category: "Service",
          cover_image: "",
          logo: "",
          details: {
            full_name: "National Service Scheme",
            category: "Service",
            about:
              "The National Service Scheme (NSS) is an Indian government-sponsored public service program. Our chapter fosters social responsibility and community engagement among students.",
            mission:
              "Not Me But You — the motto of NSS reflects democratic living and the need for selfless service.",
            key_activities: [
              "Blood Donation Camps",
              "Tree Plantation Drives",
              "Rural Development Projects",
            ],
            cover_image: "",
            logo: "",
          },
          recent_events: {
            happenings_link: "",
            events: [
              {
                id: "event_1",
                title: "Annual Blood Donation Camp",
                thumbnail: "",
                link: "",
              },
            ],
          },
        },
        {
          id: "club_ieee",
          name: "IEEE",
          category: "Technical",
          cover_image: "",
          logo: "",
          details: {
            full_name: "IEEE Student Branch",
            category: "Technical",
            about:
              "The IEEE Student Branch promotes technology, innovation, and professional development through workshops and competitions.",
            mission:
              "To advance technology for the benefit of humanity by nurturing student talent.",
            key_activities: [
              "Technical Workshops",
              "Hackathons",
              "Industry Guest Lectures",
            ],
            cover_image: "",
            logo: "",
          },
          recent_events: {
            happenings_link: "",
            events: [
              {
                id: "event_1",
                title: "Tech Fest 2026",
                thumbnail: "",
                link: "",
              },
            ],
          },
        },
        {
          id: "club_cultural",
          name: "Kalakaar",
          category: "Cultural",
          cover_image: "",
          logo: "",
          details: {
            full_name: "Kalakaar Cultural Club",
            category: "Cultural",
            about:
              "Kalakaar is the premier cultural club celebrating art, music, dance, and drama, and organises the annual cultural fest.",
            mission:
              "To preserve and promote diverse art forms while giving every student a stage.",
            key_activities: [
              "Annual Cultural Fest",
              "Inter-College Dance Competition",
            ],
            cover_image: "",
            logo: "",
          },
          recent_events: {
            happenings_link: "",
            events: [
              {
                id: "event_1",
                title: "Tarang Annual Cultural Fest",
                thumbnail: "",
                link: "",
              },
            ],
          },
        },
      ],
    },
    alliance: {
      id: "alliance",
      enabled: true,
      alliances: [
        {
          id: "alliance_bmh",
          name: "Baby Memorial Hospital",
          tag: "Own Hospital",
          cover_image: "",
          logo: "",
          details: {
            full_name: "Baby Memorial Hospital",
            category: "Own Hospital",
            about:
              "A multi-specialty, tertiary care corporate hospital. This alliance provides students with direct clinical exposure in a world-class medical setting.",
            collaboration_impact:
              "Students gain hands-on experience in advanced diagnostic procedures and patient care, with faculty exchange programs enhancing the curriculum.",
            key_focus_areas: [
              "Clinical Rotations",
              "Joint Biomedical Research",
              "Internship Opportunities",
            ],
            cover_image: "",
            logo: "",
            legal_documents: [
              {
                title: "Memorandum of Understanding",
                size: "2.4 MB",
                type: "PDF",
                url: "",
              },
            ],
          },
          alliance_activities: {
            happenings_link: "",
            activities: [
              {
                id: "activity_1",
                title: "CME Workshop on Advanced Diagnostics",
                thumbnail: "",
                link: "",
              },
            ],
          },
        },
        {
          id: "alliance_nid",
          name: "National Institute of Design",
          tag: "Academic & Research",
          cover_image: "",
          logo: "",
          details: {
            full_name: "National Institute of Design",
            category: "Academic & Research",
            about:
              "A premier institute for design education and research. Enables student and faculty exchange programs, joint workshops, and collaborative research.",
            collaboration_impact:
              "Exposes students to design thinking methodologies, improving problem-solving and innovation skills.",
            key_focus_areas: [
              "Student Exchange Programs",
              "Joint Design Workshops",
            ],
            cover_image: "",
            logo: "",
            legal_documents: [
              {
                title: "Academic Collaboration Agreement",
                size: "980 KB",
                type: "PDF",
                url: "",
              },
            ],
          },
          alliance_activities: {
            happenings_link: "",
            activities: [
              {
                id: "activity_1",
                title: "Design Thinking Workshop",
                thumbnail: "",
                link: "",
              },
            ],
          },
        },
      ],
    },
    other_courses_offered: {
      id: "other_courses_offered",
      enabled: true,
      list: [
        {
          courseName: "Bachelor of Business Administration",
          duration: "3 Years",
        },
        { courseName: "Master of Computer Applications", duration: "2 Years" },
        { courseName: "Diploma in Pharmacy", duration: "2 Years" },
      ],
    },
    // Each distribution's percents must total 100 (validateDemoGraphicsTabData)
    demo_graphics: {
      id: "demo_graphics",
      enabled: true,
      age_distribution: {
        title: "Age Distribution",
        items: [
          { label: "18 - 22 years", percent: 64 },
          { label: "23 - 26 years", percent: 22 },
          { label: "27 - 30 years", percent: 10 },
          { label: "30+ years", percent: 4 },
        ],
      },
      gender_diversity: {
        title: "Gender Diversity",
        segments: [
          { label: "Male", percent: 60 },
          { label: "Female", percent: 38 },
          { label: "Others", percent: 2 },
        ],
      },
      work_experience: {
        title: "Work Experience",
        items: [
          {
            icon: "",
            label: "Freshers",
            subtitle: "Directly after undergrad",
            percent: 45,
          },
          {
            icon: "",
            label: "1 - 3 Years",
            subtitle: "Junior professionals",
            percent: 35,
          },
          {
            icon: "",
            label: "4+ Years",
            subtitle: "Senior/Leadership roles",
            percent: 20,
          },
        ],
      },
      international_presence: {
        title: "International Presence",
        items: [
          { flag: "", country: "India", percent: 82 },
          { flag: "", country: "UAE", percent: 18 },
        ],
      },
      national_presence: {
        title: "National Presence",
        items: [
          { flag: "", country: "Karnataka", percent: 50 },
          { flag: "", country: "Kerala", percent: 30 },
          { flag: "", country: "Tamil Nadu", percent: 20 },
        ],
      },
    },
  };
}

/**
 * exam_policy tab — canonical shape used by the college-admin editor and
 * transformPublicExamPolicyTab (recovered from the purpose-built
 * seed-exam-policy.ts script).
 */
function buildExamPolicyTabData() {
  return {
    id: "exam_policy",
    enabled: true,
    evaluation_patterns: [
      {
        pattern_type: "Course with Practical",
        duration: "2 + 3 Hrs",
        chart: {
          total: 100,
          segments: [
            { label: "Theory", percent: 50 },
            { label: "Practical", percent: 20 },
            { label: "Internal", percent: 30 },
          ],
        },
        subtotals: [
          { label: "ISA Theory", marks: 20 },
          { label: "ISA Practical", marks: 15 },
          { label: "ESA Theory", marks: 50 },
          { label: "ESA Practical", marks: 15 },
        ],
        internal_assessment: [
          {
            section: "ISA - Theory",
            components: [
              {
                name: "Test Papers",
                marks: 10,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Mid-term Exam", marks: 6 },
                  { name: "Class Test", marks: 4 },
                ],
              },
              {
                name: "Assignment",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Content Relevance", marks: 2 },
                  { name: "Research Quality", marks: 2 },
                  { name: "Timely Submission", marks: 1 },
                ],
              },
              {
                name: "Seminar",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [],
              },
            ],
          },
          {
            section: "ISA - Practical",
            components: [
              {
                name: "Practical Record",
                marks: 5,
                description: "Assessment of maintained practical records.",
                icon: "",
                sub_components: [],
              },
              {
                name: "Lab Performance",
                marks: 5,
                description: "Evaluation of day-to-day lab performance.",
                icon: "",
                sub_components: [],
              },
              {
                name: "Viva-Voce",
                marks: 5,
                description: "Oral examination based on practical concepts.",
                icon: "",
                sub_components: [],
              },
            ],
          },
        ],
        external_examination: [
          {
            section: "ESA - Theory",
            columns: ["Section", "Total Q", "Attempt", "Marks"],
            rows: [
              {
                section: "Section A",
                subtitle: "1 Mark each",
                total_questions: 10,
                attempt: 10,
                marks: 10,
              },
              {
                section: "Section B",
                subtitle: "3 Marks each",
                total_questions: 5,
                attempt: 5,
                marks: 15,
              },
              {
                section: "Section C",
                subtitle: "12.5 Marks each",
                total_questions: 2,
                attempt: 2,
                marks: 25,
              },
            ],
          },
          {
            section: "ESA - Practical",
            columns: ["Component", "Total Q", "Attempt", "Marks"],
            rows: [
              {
                section: "Execution",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 10,
              },
              {
                section: "External Viva-Voce",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 5,
              },
            ],
          },
        ],
        summary_cards: [
          { label: "ISA THEORY", value: "20 Marks" },
          { label: "ISA PRACTICAL", value: "15 Marks" },
          { label: "ESA THEORY", value: "50 Marks" },
          { label: "ESA PRACTICAL", value: "15 Marks" },
        ],
        exam_duration: { label: "EXAM DURATION", value: "2 + 3 Hrs" },
      },
      {
        pattern_type: "Course without Practical",
        duration: "3 Hours",
        chart: {
          total: 100,
          segments: [
            { label: "Theory", percent: 75 },
            { label: "Internal", percent: 25 },
          ],
        },
        subtotals: [
          { label: "Subtotal ISA", marks: 25 },
          { label: "Subtotal ESA", marks: 75 },
        ],
        internal_assessment: [
          {
            section: "Internal Assessment (ISA)",
            components: [
              {
                name: "Test Papers",
                marks: 10,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Mid-term Exam", marks: 6 },
                  { name: "Class Test", marks: 4 },
                ],
              },
              {
                name: "Assignment",
                marks: 10,
                description: "",
                icon: "",
                sub_components: [],
              },
              {
                name: "Attendance",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "90% - 100%", marks: 5 },
                  { name: "80% - 89%", marks: 3 },
                  { name: "75% - 79%", marks: 1 },
                ],
              },
            ],
          },
        ],
        external_examination: [
          {
            section: "External Examination Pattern",
            columns: ["Section", "Total Questions", "Answered", "Marks"],
            rows: [
              {
                section: "Part A",
                subtitle: "2 Marks each",
                total_questions: 10,
                attempt: 10,
                marks: 20,
              },
              {
                section: "Part B",
                subtitle: "5 Marks each",
                total_questions: 5,
                attempt: 5,
                marks: 25,
              },
              {
                section: "Part C",
                subtitle: "15 Marks each",
                total_questions: 2,
                attempt: 2,
                marks: 30,
              },
            ],
          },
        ],
        summary_cards: [
          { label: "SUBTOTAL ISA", value: "25 Marks" },
          { label: "SUBTOTAL ESA", value: "75 Marks" },
        ],
        exam_duration: { label: "EXAM DURATION", value: "3 Hours" },
      },
    ],
    projects_dissertation: {
      marks_distribution_bar: {
        title: "Marks Distribution",
        total_label: "Total: 100",
        segments: [
          { label: "ESA", percent: 70, color: "#3B82F6" },
          { label: "Internal", percent: 30, color: "#A78BFA" },
        ],
      },
      internal_assessment: [
        {
          section: "Components of Internal Evaluation",
          components: [
            { name: "Relevance of the Topic", marks: 5 },
            { name: "Project Content & Methodology", marks: 10 },
            { name: "Presentation", marks: 10 },
            { name: "Viva-Voce", marks: 5 },
          ],
        },
      ],
      external_examination: [
        {
          section: "Components of External Assessment",
          components: [
            { name: "Project Dissertation", marks: 50 },
            { name: "Presentation & Viva-Voce", marks: 20 },
          ],
        },
      ],
      summary_cards: [
        { label: "SUBTOTAL ISA", value: "30 Marks" },
        { label: "SUBTOTAL ESA", value: "70 Marks" },
      ],
    },
    ojt_evaluation: {
      section_title: "OJT ASSESSMENT CRITERIA",
      columns: ["Criterion", "Marks"],
      components: [
        { name: "Attendance & Punctuality", marks: 20 },
        { name: "Work Performance", marks: 30 },
        { name: "OJT Report", marks: 30 },
        { name: "Viva-Voce", marks: 20 },
      ],
      total_summary: { label: "TOTAL ASSESSMENT", value: "100 Marks" },
    },
    internship_evaluation: {
      section_title: "COMPONENTS OF INTERNSHIP EVALUATION",
      columns: ["Component", "Marks"],
      components: [
        { name: "Industry Supervisor Evaluation", marks: 40 },
        { name: "Internship Report", marks: 30 },
        { name: "Presentation & Viva", marks: 30 },
      ],
      total_summary: { label: "TOTAL EVALUATION", value: "100 Marks" },
    },
    grading_scale: {
      title: "Grading Scale",
      columns: ["Percentage of Marks", "Grade", "Grade Point"],
      rows: [
        {
          percentage_range: "90% - 100%",
          grade: "O",
          grade_color: "green",
          grade_point: 10,
        },
        {
          percentage_range: "80% - 89%",
          grade: "A+",
          grade_color: "green",
          grade_point: 9,
        },
        {
          percentage_range: "70% - 79%",
          grade: "A",
          grade_color: "green",
          grade_point: 8,
        },
        {
          percentage_range: "60% - 69%",
          grade: "B+",
          grade_color: "blue",
          grade_point: 7,
        },
        {
          percentage_range: "50% - 59%",
          grade: "B",
          grade_color: "blue",
          grade_point: 6,
        },
        {
          percentage_range: "40% - 49%",
          grade: "P",
          grade_color: "orange",
          grade_point: 4,
        },
        {
          percentage_range: "Below 40%",
          grade: "F",
          grade_color: "red",
          grade_point: 0,
        },
      ],
    },
    important_guidelines_banner: {
      tag: "IMPORTANT",
      title: "Academic Guidelines",
      description:
        "Students with less than 75% attendance will not be allowed to appear in the semester examinations.",
      background_style: "gradient",
      academic_policies: [
        {
          badge: "ATTENDANCE",
          title: "Minimum 75% Attendance",
          description:
            "A minimum of 75% attendance is mandatory to be eligible for end-semester examinations.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "MALPRACTICE",
          title: "Zero Tolerance for Malpractice",
          description:
            "Use of unfair means during examinations leads to immediate cancellation of the paper.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. College onboarding — mirrors the real flow:
//    CollegeOnboardingRequest → provision → setup account → registration → finalize
// ─────────────────────────────────────────────────────────────────────────────

// Same roles + permission codes as CollegeProvisioningRepository.SYSTEM_COLLEGE_ROLES
const SYSTEM_COLLEGE_ROLES = [
  {
    name: "College Admin",
    slug: "college_admin",
    permissions: [
      "profile.view",
      "profile.edit",
      "campuses.view",
      "campuses.manage",
      "academics.view",
      "academics.manage",
      "hostel.view",
      "hostel.manage",
      "library.view",
      "library.manage",
      "commute.view",
      "commute.manage",
      "staff.view",
      "staff.manage",
    ],
  },
  {
    name: "Hostel Admin",
    slug: "hostel_admin",
    permissions: ["hostel.view", "hostel.manage"],
  },
  {
    name: "Commute Admin",
    slug: "commute_admin",
    permissions: ["commute.view", "commute.manage"],
  },
];

async function seedCollegeViaOnboardingFlow(
  def: CollegeSeedDef,
  universityId: string,
  superAdminId: string,
) {
  // Step 1 — onboarding request (public form), approved by the super admin
  let request = await prisma.collegeOnboardingRequest.findFirst({
    where: { contactEmail: def.contactEmail },
  });
  if (!request) {
    request = await prisma.collegeOnboardingRequest.create({
      data: {
        collegeName: def.name,
        universityName: "Vydehi Deemed University",
        contactPersonName: def.contactName,
        contactEmail: def.contactEmail,
        city: def.city,
        state: def.state,
        status: "approved",
        reviewedBy: superAdminId,
        reviewRemarks: "Approved via seed",
      },
    });
  }

  // Step 2 — provision: college shell + system roles (with permissions) + admin staff
  const profileSections = buildProfileSections(def);
  const college = await prisma.college.upsert({
    where: { slug: def.slug },
    update: {
      name: def.name,
      universityId,
      code: def.code,
      state: def.state,
      city: def.city,
      district: def.district,
      address: def.address,
      pinCode: def.pinCode,
      establishedYear: def.establishedYear,
      collegeType: "private",
      genderType: "co_ed",
      avgStudentCount: 1500,
      campusSizeAcres: 65,
      outsideStatePct: 35,
      avgRating: 4.3,
      reviewCount: 128,
      amenities: [
        { name: "Wi-Fi Campus", iconKey: "wifi" },
        { name: "Central Library", iconKey: "library" },
        { name: "Student Hostels", iconKey: "hostel" },
        { name: "Sports Complex", iconKey: "sports" },
        { name: "Cafeteria", iconKey: "cafeteria" },
        { name: "Medical Centre", iconKey: "medical" },
      ],
      nearbyAccess: {
        transit: [
          { type: "Metro", name: "Metro Station", distance: "2.5 km" },
          {
            type: "Bus Stop",
            name: `${def.shortName} Bus Stop`,
            distance: "0.1 km",
          },
        ],
        essentials: [
          {
            type: "Hospital",
            name: "Apollo Spectra Hospitals",
            distance: "3.0 km",
          },
          { type: "School", name: "VIBGYOR High School", distance: "0.1 km" },
        ],
        utility: [
          { type: "Bank", name: "State Bank of India", distance: "0.5 km" },
          { type: "Pharmacy", name: "MedPlus Pharmacy", distance: "0.3 km" },
        ],
      },
      socialLinks: {
        facebook: "https://facebook.com",
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
        website: def.website,
      },
      codeOfConduct: [
        { order: 1, rule: "Always carry the Identity Card while on campus." },
        { order: 2, rule: "Maintain a minimum of 75% attendance." },
        { order: 3, rule: "Ragging and harassment are strictly prohibited." },
      ],
      profileSections,
      registrationTabs: [...REGISTRATION_TAB_IDS],
      settings: {
        registrationMeta: { registrationTabs: [...REGISTRATION_TAB_IDS] },
      },
      status: "active", // finalize()
    },
    create: {
      slug: def.slug,
      name: def.name,
      universityId,
      code: def.code,
      state: def.state,
      city: def.city,
      district: def.district,
      address: def.address,
      pinCode: def.pinCode,
      establishedYear: def.establishedYear,
      collegeType: "private",
      genderType: "co_ed",
      profileSections,
      registrationTabs: [...REGISTRATION_TAB_IDS],
      settings: {
        registrationMeta: { registrationTabs: [...REGISTRATION_TAB_IDS] },
      },
      status: "active", // finalize() — setup token already consumed in the real flow
    },
  });

  await prisma.collegeOnboardingRequest.update({
    where: { id: request.id },
    data: { createdCollegeId: college.id, status: "approved" },
  });

  const roleIds: Record<string, string> = {};
  for (const role of SYSTEM_COLLEGE_ROLES) {
    const row = await prisma.collegeRole.upsert({
      where: {
        uq_college_role_slug: { collegeId: college.id, slug: role.slug },
      },
      update: { name: role.name, isSystemRole: true, isActive: true },
      create: {
        collegeId: college.id,
        name: role.name,
        slug: role.slug,
        isSystemRole: true,
      },
    });
    roleIds[role.slug] = row.id;
    await prisma.collegeRolePermission.createMany({
      data: role.permissions.map((code) => ({
        collegeRoleId: row.id,
        permissionCode: code,
      })),
      skipDuplicates: true,
    });
  }

  // Step 3 — account setup: staff members with hashed passwords
  for (const admin of CREDENTIALS.collegeAdmins.filter(
    (a) => a.collegeSlug === def.slug,
  )) {
    const passwordHash = await hashPassword(admin.password);
    await prisma.staffMember.upsert({
      where: {
        uq_staff_email_college: { email: admin.email, collegeId: college.id },
      },
      update: {
        fullName: admin.fullName,
        passwordHash,
        collegeRoleId: roleIds[admin.roleSlug],
        status: "active",
      },
      create: {
        collegeId: college.id,
        collegeRoleId: roleIds[admin.roleSlug],
        fullName: admin.fullName,
        email: admin.email,
        passwordHash,
        phoneNumber: admin.phone,
        status: "active",
      },
    });
  }

  console.log(`✓ College onboarded: ${def.name} (${college.id})`);
  return { college, roleIds };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Institution group (owner + member colleges)
// ─────────────────────────────────────────────────────────────────────────────

async function seedInstitutionGroup(
  ownerCollegeId: string,
  memberCollegeId: string,
) {
  const group = await prisma.institutionGroup.upsert({
    where: { slug: "vydehi-education-group" },
    update: { name: "Vydehi Education Group", status: "active" },
    create: {
      name: "Vydehi Education Group",
      slug: "vydehi-education-group",
      description: "Group of institutions under the Vydehi Educational Society",
      groupCode: "VEG-2026",
      createdByCollegeId: ownerCollegeId,
      status: "active",
    },
  });

  await prisma.institutionGroupMember.upsert({
    where: { collegeId: ownerCollegeId },
    update: { groupId: group.id, role: "owner" },
    create: {
      groupId: group.id,
      collegeId: ownerCollegeId,
      role: "owner",
      joinedVia: "created",
    },
  });
  await prisma.institutionGroupMember.upsert({
    where: { collegeId: memberCollegeId },
    update: { groupId: group.id, role: "member" },
    create: {
      groupId: group.id,
      collegeId: memberCollegeId,
      role: "member",
      joinedVia: "code",
    },
  });

  console.log("✓ Institution group:", group.groupCode);
  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Campus + departments + courses (with all tabs) + quotas
// ─────────────────────────────────────────────────────────────────────────────

async function seedCampus(collegeId: string, def: CollegeSeedDef) {
  const existing = await prisma.campus.findFirst({
    where: { collegeId, isMainCampus: true },
  });
  if (existing) return existing;

  const campus = await prisma.campus.create({
    data: {
      collegeId,
      name: `Main Campus – ${def.city}`,
      address: def.address,
      city: def.city,
      state: def.state,
      pinCode: def.pinCode,
      latitude: def.latitude,
      longitude: def.longitude,
      isMainCampus: true,
      status: "active",
    },
  });
  return campus;
}

async function seedDepartments(
  collegeId: string,
  campusId: string,
  departments: { name: string; slug: string }[],
) {
  const ids: Record<string, string> = {};
  for (const [idx, d] of departments.entries()) {
    const row = await prisma.department.upsert({
      where: { uq_department_slug: { collegeId, slug: d.slug } },
      update: { name: d.name, campusId, status: "active", sortOrder: idx },
      create: {
        collegeId,
        campusId,
        name: d.name,
        slug: d.slug,
        sortOrder: idx,
        status: "active",
        faculty: [
          {
            id: `${d.slug}-fac-1`,
            name: "Dr. Rajesh Kumar",
            designation: "Professor & Head",
            avatarUrl: "",
            education: [],
            experience: [],
          },
        ],
      },
    });
    ids[d.slug] = row.id;
  }
  return ids;
}

interface QuotaDef {
  name: string;
  slug: string;
  bucketType: "in_state" | "out_of_state";
  description: string;
}

const QUOTA_DEFS: QuotaDef[] = [
  {
    name: "Government Quota",
    slug: "government_quota",
    bucketType: "in_state",
    description: "Seats filled through government counselling",
  },
  {
    name: "Management Quota",
    slug: "management_quota",
    bucketType: "in_state",
    description: "Seats filled directly by the institution",
  },
  {
    name: "Merit Quota",
    slug: "merit_quota",
    bucketType: "in_state",
    description: "Merit-based seats via entrance exam ranks",
  },
  {
    name: "NRI Quota",
    slug: "nri_quota",
    bucketType: "out_of_state",
    description: "Seats reserved for NRI / foreign applicants",
  },
  {
    name: "Other State Quota",
    slug: "other_state_quota",
    bucketType: "out_of_state",
    description: "Seats for applicants domiciled outside the state",
  },
];

async function seedCollegeQuotas(collegeId: string) {
  const ids: Record<string, string> = {};
  for (const [idx, q] of QUOTA_DEFS.entries()) {
    const row = await prisma.collegeQuota.upsert({
      where: { uq_college_quota_slug: { collegeId, slug: q.slug } },
      update: {
        name: q.name,
        bucketType: q.bucketType,
        description: q.description,
        isActive: true,
        sortOrder: idx,
      },
      create: {
        collegeId,
        name: q.name,
        slug: q.slug,
        bucketType: q.bucketType,
        description: q.description,
        sortOrder: idx,
      },
    });
    ids[q.slug] = row.id;
  }
  return ids;
}

async function seedCourses(
  collegeId: string,
  campusId: string,
  courseDefs: CourseSeedDef[],
  ctx: {
    disciplineIds: Record<string, string>;
    studyLevelIds: Record<string, string>;
    programTypeIds: Record<string, string>;
    departmentIds: Record<string, string>;
    collegeQuotaIds: Record<string, string>;
    hostelIds: string[];
    libraryIds: string[];
  },
) {
  const courseIds: Record<string, string> = {};

  for (const c of courseDefs) {
    const disciplineId = ctx.disciplineIds[c.disciplineSlug];
    const studyLevelId = ctx.studyLevelIds[c.studyLevelSlug];
    const programTypeId = ctx.programTypeIds[c.programTypeSlug];
    if (!disciplineId || !studyLevelId || !programTypeId) {
      console.warn(`  ⚠ Skipping ${c.code}: missing discipline/level/type`);
      continue;
    }

    const tabData = buildCourseSetupTabData(c, {
      hostelIds: ctx.hostelIds,
      libraryIds: ctx.libraryIds,
    });
    const courseData = {
      name: c.name,
      disciplineId,
      studyLevelId,
      programTypeId,
      campusId,
      departmentId: ctx.departmentIds[c.departmentSlug] ?? null,
      duration: c.duration,
      intakeCapacity: c.intakeCapacity,
      studyMode: c.studyMode,
      status: "active",
      metadata: {
        totalFee: c.totalFee,
        highlights: c.highlights,
        tabs: [...COURSE_SETUP_TAB_IDS],
        tabData,
      },
      // Column tabs edited directly in the course editor (not part of tabData):
      // eligibility_criteria, accreditations, entrance_exam_eligibility
      // (see TAB_FIELD_MAP + the editor's COURSE_TABS list)
      eligibilityCriteria: {
        indian_student: {
          quotas: c.quotaSlugs.map((slug, idx) => ({
            id: `quota_${idx + 1}`,
            label: QUOTA_DEFS.find((q) => q.slug === slug)?.name ?? slug,
            criteria: [
              "Minimum 50% aggregate in the qualifying examination",
              "Valid entrance exam score where applicable",
            ],
          })),
        },
        foreign_student: {
          criteria: [
            {
              heading: "Equivalent Qualification",
              description:
                "Qualification equivalent to 10+2 recognised by AIU.",
            },
            {
              heading: "Travel Documents",
              description:
                "Valid passport and student visa at the time of admission.",
            },
          ],
        },
      },
      accreditations: {
        id: "accreditations",
        items: [
          {
            name: "NAAC A+",
            year: "2023",
            description:
              "National Assessment and Accreditation Council A+ grade",
          },
          {
            name: "NIRF Ranked",
            year: "2024",
            description: "Ranked among India's top institutions in NIRF 2024",
          },
        ],
      },
      entranceExamEligibility: {
        id: "entrance_exam_eligibility",
        exams: [
          {
            name: "JEE Main",
            level: "National",
            min_qualifying_marks: "90 percentile",
            description: "Joint Entrance Examination conducted by NTA",
          },
          {
            name: "Karnataka PGCET",
            level: "State",
            min_qualifying_marks: "1200 score",
            description: "State-level post-graduate common entrance test",
          },
        ],
      },
      // Remaining per-tab JSON columns kept consistent with tabData
      highlights: c.highlights,
      curriculum: [],
      courseStructure: {},
      valueAddedCourses: [
        "Professional Communication",
        "Industry Readiness Workshop",
      ],
      careerOpportunities: [
        { role: "Research Associate", salary_range: "4-8 LPA" },
        { role: "Domain Specialist", salary_range: "6-12 LPA" },
      ],
      higherEducationCertifications: {
        global_certifications: ["Industry Certifications"],
        postgraduation: ["Postgraduate Studies"],
      },
      flexibleExitOptions: [
        {
          title: "Certificate",
          description: "Exit after Year 1 with a certificate",
        },
      ],
      classTimings: {},
      industryTools: ["MS Excel", "Power BI", "Python"],
      labFacilities: ["Computer Lab", "Simulation Lab"],
      roomFacilities: ["Smart Classrooms", "Projector-enabled rooms"],
      featuredAlumni: [],
      faqs: [],
      examPolicy: {},
      keyDates: [],
      demographics: {},
    };

    const course = await prisma.course.upsert({
      where: { uq_course_code_college: { collegeId, code: c.code } },
      update: courseData,
      create: { collegeId, code: c.code, ...courseData },
    });
    courseIds[c.code] = course.id;

    for (const quotaSlug of c.quotaSlugs) {
      const collegeQuotaId = ctx.collegeQuotaIds[quotaSlug];
      if (!collegeQuotaId) continue;
      await prisma.courseQuota.upsert({
        where: {
          uq_course_college_quota: { courseId: course.id, collegeQuotaId },
        },
        update: { isActive: true },
        create: {
          courseId: course.id,
          collegeQuotaId,
          isActive: true,
          // Government quota → flat app-fee discount; NRI → tuition override.
          // Negative appFeeAdjustmentValue discounts, positive surcharges.
          ...(quotaSlug === "government_quota"
            ? { appFeeAdjustmentType: "flat", appFeeAdjustmentValue: -500 }
            : {}),
          ...(quotaSlug === "nri_quota" ? { tuitionFeeOverride: 1500000 } : {}),
        },
      });
    }
  }

  return courseIds;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Admission cycle + cycle courses + pooled seat matrix
// ─────────────────────────────────────────────────────────────────────────────

async function seedAdmissionCycle(
  collegeId: string,
  courseIds: Record<string, string>,
  courseDefs: CourseSeedDef[],
  collegeQuotaIds: Record<string, string>,
  seatPools: { quotaSlug: string; totalSeats: number; courseCodes: string[] }[],
) {
  const cycle = await prisma.admissionCycle.upsert({
    where: {
      uq_cycle_slug_college: { collegeId, slug: "admissions-2026-27" },
    },
    update: { status: "open" },
    create: {
      collegeId,
      applicationType: "regular",
      name: "Admissions 2026-27",
      slug: "admissions-2026-27",
      programLevel: "all",
      admissionYear: "2026-27",
      startsOn: new Date("2026-06-15"),
      endsOn: new Date("2026-09-30"),
      status: "open",
    },
  });

  // Track each course's AdmissionCycleCourse id — CourseQuotaSeats rows key
  // off this (course-in-this-cycle), not off the course directly.
  const cycleCourseIds: Record<string, string> = {};
  for (const c of courseDefs) {
    const courseId = courseIds[c.code];
    if (!courseId) continue;
    const cycleCourse = await prisma.admissionCycleCourse.upsert({
      where: { uq_cycle_course: { admissionCycleId: cycle.id, courseId } },
      update: { applicationFee: c.applicationFee, isActive: true },
      create: {
        admissionCycleId: cycle.id,
        courseId,
        applicationFee: c.applicationFee,
        interviewRequired: true,
        assessmentRequired: true,
        workExperienceRequired: false,
        isActive: true,
      },
    });
    cycleCourseIds[c.code] = cycleCourse.id;
  }

  // Seat pools: courses sharing a quota's seats get one SeatPool, each
  // fronted by a CourseQuotaSeats row pointing at it. SeatPool has no unique
  // constraint on (quota, cycle) — reuse an existing active pool for this
  // quota+cycle if the seed has already run, instead of creating a duplicate.
  for (const pool of seatPools) {
    const collegeQuotaId = collegeQuotaIds[pool.quotaSlug];
    if (!collegeQuotaId) continue;

    let seatPool = await prisma.seatPool.findFirst({
      where: { collegeQuotaId, admissionCycleId: cycle.id, isActive: true },
    });
    if (seatPool) {
      await prisma.seatPool.update({
        where: { id: seatPool.id },
        data: { totalSeats: pool.totalSeats, openSeats: pool.totalSeats },
      });
    } else {
      seatPool = await prisma.seatPool.create({
        data: {
          collegeQuotaId,
          admissionCycleId: cycle.id,
          totalSeats: pool.totalSeats,
          openSeats: pool.totalSeats,
        },
      });
    }

    for (const code of pool.courseCodes) {
      const admissionCycleCourseId = cycleCourseIds[code];
      if (!admissionCycleCourseId) continue;
      await prisma.courseQuotaSeats.upsert({
        where: {
          uq_cycle_course_quota: { admissionCycleCourseId, collegeQuotaId },
        },
        update: { seatPoolId: seatPool.id, isActive: true },
        create: {
          admissionCycleCourseId,
          collegeQuotaId,
          seatPoolId: seatPool.id,
        },
      });
    }
  }

  console.log(`✓ Admission cycle + seat pools (${cycle.slug})`);
  return cycle;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Fee structures
// ─────────────────────────────────────────────────────────────────────────────

async function seedFeeStructures(
  collegeId: string,
  courseIds: Record<string, string>,
  feeDefs: {
    courseCode: string;
    fees: { feeCategory: string; amount: number; yearOrSemester: string }[];
  }[],
) {
  for (const def of feeDefs) {
    const courseId = courseIds[def.courseCode];
    if (!courseId) continue;

    for (const fee of def.fees) {
      const existing = await prisma.feeStructure.findFirst({
        where: {
          collegeId,
          courseId,
          academicYear: "2026-27",
          feeCategory: fee.feeCategory,
          yearOrSemester: fee.yearOrSemester,
        },
      });
      if (existing) continue;

      await prisma.feeStructure.create({
        data: {
          collegeId,
          courseId,
          academicYear: "2026-27",
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
                      amount: Math.round((fee.amount - 25000) / 2),
                    },
                    {
                      label: "Final Installment",
                      dueAfter: "60 days",
                      amount: Math.round((fee.amount - 25000) / 2),
                    },
                  ],
                }
              : {},
        },
      });
    }
  }
  console.log("✓ Fee structures");
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Hostels, commute routes, libraries
// ─────────────────────────────────────────────────────────────────────────────

async function seedHostels(collegeId: string, prefix: string) {
  const hostelDefs = [
    {
      slug: `${prefix}-campus-hostel-a`,
      name: "Campus Hostel A (Boys)",
      hostelType: "boys",
      isOnCampus: true,
      distanceFromCampus: null as string | null,
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
      ],
      wardenInfo: {
        name: "Mrs. Sarah Jenkins",
        phone: "9876512340",
        whatsapp: "9876512340",
        email: "hostel.warden@vydehi.edu.in",
      },
      locationInfo: {
        address: "Block C, South Campus Area, Inside Campus",
        collegeTransport: "Campus Bus available 6:30 AM - 10:00 PM",
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
      slug: `${prefix}-serenity-girls-pg`,
      name: "Serenity Girls PG",
      hostelType: "girls",
      isOnCampus: false,
      distanceFromCampus: "5 min walk",
      description:
        "Off-campus premium girls PG with 24x7 security and biometric access. Rated 4.2 by 85 students.",
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
      ],
      wardenInfo: {
        name: "Mrs. Lakshmi Rao",
        phone: "9812345678",
        whatsapp: "9812345678",
        email: "serenity.warden@example.com",
      },
      locationInfo: {
        address: "Serenity PG, 24, EPIP Layout",
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

  const hostelIds: string[] = [];
  for (const h of hostelDefs) {
    const existing = await prisma.hostel.findFirst({
      where: { collegeId, slug: h.slug },
    });

    const baseData = {
      name: h.name,
      hostelType: h.hostelType,
      isOnCampus: h.isOnCampus,
      distanceFromCampus: h.distanceFromCampus,
      description: h.description,
      totalBeds: h.totalBeds,
      avgRating: h.avgRating,
      reviewCount: h.reviewCount,
      amenities: h.amenities,
      rules: h.rules,
      wardenInfo: h.wardenInfo,
      locationInfo: h.locationInfo,
    };

    let hostelId: string;
    if (existing) {
      await prisma.hostel.update({
        where: { id: existing.id },
        data: baseData,
      });
      hostelId = existing.id;
    } else {
      const hostel = await prisma.hostel.create({
        data: { collegeId, slug: h.slug, status: "active", ...baseData },
      });
      hostelId = hostel.id;
    }
    hostelIds.push(hostelId);

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
  console.log("✓ Hostels");
  return hostelIds;
}

async function seedCommuteRoutes(collegeId: string) {
  const routeDefs = [
    {
      name: "Route 12 – HSR Layout",
      description: "Via BTM Layout, Madivala",
      isVerified: true,
      conductPolicy: [
        {
          title: "Mandatory Identification",
          description:
            "Students must carry their valid college ID and transport pass at all times.",
        },
        {
          title: "Seat Policy",
          description:
            "Seats are not pre-assigned. Occupancy is on a strictly first-come, first-served basis.",
        },
        {
          title: "Punctuality",
          description:
            "Students are advised to be at their designated pickup point 5 minutes prior to the scheduled time.",
        },
      ],
      stops: [
        {
          stopName: "HSR Layout BDA Complex",
          landmark: "Main Gate",
          morningTime: new Date("1970-01-01T06:45:00+05:30"),
          eveningTime: new Date("1970-01-01T18:15:00+05:30"),
          isPickupPoint: true,
          stopOrder: 0,
        },
        {
          stopName: "Silk Board",
          landmark: null as string | null,
          morningTime: new Date("1970-01-01T07:05:00+05:30"),
          eveningTime: new Date("1970-01-01T17:55:00+05:30"),
          isPickupPoint: true,
          stopOrder: 1,
        },
        {
          stopName: "College Campus",
          landmark: "Main Block Entrance",
          morningTime: new Date("1970-01-01T08:10:00+05:30"),
          eveningTime: new Date("1970-01-01T16:30:00+05:30"),
          isPickupPoint: true,
          stopOrder: 2,
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
          paymentStructureNotes:
            "Payable as a one-time annual payment or in two semester-wise installments.",
          busModel: "Tata Marcopolo (AC)",
        },
      ],
    },
    {
      name: "Route 5 – Electronic City",
      description: "Via Silk Board, Bommanahalli",
      isVerified: false,
      conductPolicy: [] as unknown[],
      stops: [
        {
          stopName: "Electronic City Phase 1",
          landmark: "Tech Park Gate",
          morningTime: new Date("1970-01-01T07:00:00+05:30"),
          eveningTime: new Date("1970-01-01T18:30:00+05:30"),
          isPickupPoint: true,
          stopOrder: 0,
        },
        {
          stopName: "College Campus",
          landmark: "Main Block Entrance",
          morningTime: new Date("1970-01-01T08:15:00+05:30"),
          eveningTime: new Date("1970-01-01T16:45:00+05:30"),
          isPickupPoint: true,
          stopOrder: 1,
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
          paymentStructureNotes: "",
          busModel: "",
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
          isVerified: r.isVerified,
          conductPolicy: r.conductPolicy as any,
        },
      });
      routeId = route.id;
    }

    await prisma.commuteRouteStop.createMany({
      data: r.stops.map((s) => ({
        routeId,
        stopName: s.stopName,
        landmark: s.landmark,
        morningTime: s.morningTime,
        eveningTime: s.eveningTime,
        isPickupPoint: s.isPickupPoint,
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
        paymentStructureNotes: b.paymentStructureNotes || null,
        busModel: b.busModel || null,
        isActive: true,
      })),
    });
  }
  console.log("✓ Commute routes");
}

async function seedLibraries(
  collegeId: string,
  disciplineIds: Record<string, string>,
) {
  const libraryDefs = [
    {
      name: "Central Library",
      type: "central",
      departmentId: null as string | null,
      stats: [
        { value: "21,786", label: "Area (sq ft)" },
        { value: "300", label: "Seats" },
        { value: "79,316", label: "Volumes" },
        { value: "44", label: "Research Cabins" },
      ],
      availableResources: {
        items: [
          { name: "Journals (Online)", count: 6150 },
          { name: "E-Books", count: 195809 },
          { name: "Rare Books", count: 1562 },
          { name: "Magazines (Print)", count: 36 },
        ],
      },
      libraryHours: {
        days: [
          { day: "Monday - Friday", workingHours: "09:00 AM - 04:30 PM" },
          { day: "Saturday", workingHours: "09:00 AM - 01:00 PM" },
        ],
      },
      facilities: {
        items: [
          { name: "Quiet Study Areas", imageUrl: "" },
          { name: "Computer Labs", imageUrl: "" },
          { name: "Discussion Rooms", imageUrl: "" },
        ],
      },
    },
    {
      name: "Medical Sciences Library",
      type: "department",
      departmentId: disciplineIds["mbbs"] ?? null,
      stats: [
        { value: "6,500", label: "Area (sq ft)" },
        { value: "120", label: "Seats" },
        { value: "18,400", label: "Volumes" },
      ],
      availableResources: {
        items: [
          { name: "Medical Journals", count: 240 },
          { name: "E-Books", count: 12000 },
        ],
      },
      libraryHours: {
        days: [
          { day: "Monday - Saturday", workingHours: "08:30 AM - 08:00 PM" },
        ],
      },
      facilities: {
        items: [{ name: "Dissection Atlas Corner", imageUrl: "" }],
      },
    },
  ];

  const libraryIds: string[] = [];
  for (const lib of libraryDefs) {
    if (lib.type === "department" && !lib.departmentId) continue;
    const existing = await prisma.library.findFirst({
      where: { collegeId, name: lib.name },
    });
    const data = {
      type: lib.type,
      departmentId: lib.departmentId,
      stats: lib.stats,
      availableResources: lib.availableResources,
      libraryHours: lib.libraryHours,
      facilities: lib.facilities,
      status: "active",
    };
    if (existing) {
      await prisma.library.update({ where: { id: existing.id }, data });
      libraryIds.push(existing.id);
    } else {
      const created = await prisma.library.create({
        data: { collegeId, name: lib.name, ...data },
      });
      libraryIds.push(created.id);
    }
  }
  console.log("✓ Libraries");
  return libraryIds;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Blink users (associate admin → employee, campus ambassadors) + wallets
// ─────────────────────────────────────────────────────────────────────────────

async function nextAmbassadorCode(): Promise<string> {
  // Same generator as BlinkRepository.getNextAmbassadorCode
  const result = await prisma.$queryRaw<[{ code: string }]>`
    SELECT 'CA-' || nextval('ambassador_code_seq'::regclass)::text AS code
  `;
  return result[0].code;
}

async function seedBlinkUsers(
  blinkRoleIds: Record<string, string>,
  collegeIdsBySlug: Record<string, string>,
) {
  // The blink repository generates ambassador codes from this sequence, but it
  // is not part of the schema migrations — ensure it exists.
  await prisma.$executeRawUnsafe(
    "CREATE SEQUENCE IF NOT EXISTS ambassador_code_seq START 1001",
  );

  const aa = CREDENTIALS.blink.associateAdmin;
  const associateAdmin = await prisma.blinkUser.upsert({
    where: { email: aa.email },
    update: {
      fullName: aa.fullName,
      passwordHash: await hashPassword(aa.password),
    },
    create: {
      blinkRoleId: blinkRoleIds["associate_admin"],
      fullName: aa.fullName,
      email: aa.email,
      passwordHash: await hashPassword(aa.password),
      phoneNumber: "9800000001",
      country: "India",
      agencyName: aa.agencyName,
      agencyRegNumber: aa.agencyRegNumber,
      status: "active",
    },
  });

  const ae = CREDENTIALS.blink.associateEmployee;
  const associateEmployee = await prisma.blinkUser.upsert({
    where: { email: ae.email },
    update: {
      fullName: ae.fullName,
      passwordHash: await hashPassword(ae.password),
    },
    create: {
      blinkRoleId: blinkRoleIds["associate_employee"],
      associateParentId: associateAdmin.id,
      fullName: ae.fullName,
      email: ae.email,
      passwordHash: await hashPassword(ae.password),
      phoneNumber: "9800000002",
      country: "India",
      status: "active",
    },
  });

  const ambassadors = [];
  for (const amb of CREDENTIALS.blink.ambassadors) {
    const collegeId = collegeIdsBySlug[amb.collegeSlug];
    const existing = await prisma.blinkUser.findUnique({
      where: { email: amb.email },
    });
    const row = existing
      ? await prisma.blinkUser.update({
          where: { id: existing.id },
          data: {
            fullName: amb.fullName,
            passwordHash: await hashPassword(amb.password),
            collegeId,
            status: "active",
          },
        })
      : await prisma.blinkUser.create({
          data: {
            blinkRoleId: blinkRoleIds["campus_ambassador"],
            collegeId,
            fullName: amb.fullName,
            email: amb.email,
            passwordHash: await hashPassword(amb.password),
            phoneNumber: amb.phone,
            ambassadorType: amb.ambassadorType,
            campusCode: await nextAmbassadorCode(),
            status: "active",
            profileMetadata: {
              state: "Karnataka",
              district: "Bangalore Urban",
            },
          },
        });
    ambassadors.push(row);
  }

  for (const user of [associateAdmin, associateEmployee, ...ambassadors]) {
    await prisma.blinkWallet.upsert({
      where: { blinkUserId: user.id },
      update: {},
      create: { blinkUserId: user.id },
    });
  }

  console.log("✓ Blink users + wallets");
  return { associateAdmin, associateEmployee, ambassadors };
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Counsellors
// ─────────────────────────────────────────────────────────────────────────────

async function seedCounsellors() {
  for (const c of CREDENTIALS.counsellors) {
    const passwordHash = await hashPassword(c.password);
    await prisma.counsellor.upsert({
      where: { email: c.email },
      update: {
        fullName: c.fullName,
        passwordHash,
        counsellorType: c.counsellorType,
        counsellorCode: c.counsellorCode,
        sessionFee: c.sessionFee,
        knownLanguages: c.knownLanguages,
        status: "active",
      },
      create: {
        fullName: c.fullName,
        email: c.email,
        passwordHash,
        counsellorType: c.counsellorType,
        counsellorCode: c.counsellorCode,
        sessionFee: c.sessionFee,
        knownLanguages: c.knownLanguages,
        rating: 4.5,
        status: "active",
      },
    });
  }
  console.log("✓ Counsellors");
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Students (OTP / Google login — no passwords)
// ─────────────────────────────────────────────────────────────────────────────

async function seedStudents() {
  for (const s of CREDENTIALS.students) {
    await prisma.student.upsert({
      where: { email: s.email },
      update: { fullName: s.fullName, status: "active" },
      create: {
        fullName: s.fullName,
        email: s.email,
        phoneCountryCode: "+91",
        phoneNumber: s.phone,
        isEmailVerified: true,
        isPhoneVerified: true,
        source: "beaconu_app",
        status: "active",
      },
    });
  }
  console.log("✓ Students");
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Content — blogs, news alerts, entrance exams, education loans, videos
// ─────────────────────────────────────────────────────────────────────────────

async function seedContent(superAdminId: string, collegeIds: string[]) {
  // Blog author (writes via /blog author portal; platform admin blogs are
  // auto-approved, author blogs go through review — seed both states)
  const ba = CREDENTIALS.blogAuthor;
  const author = await prisma.blogAuthor.upsert({
    where: { email: ba.email },
    update: {
      fullName: ba.fullName,
      passwordHash: await hashPassword(ba.password),
    },
    create: {
      fullName: ba.fullName,
      email: ba.email,
      passwordHash: await hashPassword(ba.password),
      bio: ba.bio,
      status: "active",
    },
  });

  const blogs = [
    {
      slug: "how-to-choose-the-right-college",
      title: "How to Choose the Right College in 2026",
      summary:
        "A practical framework for shortlisting colleges that fit your goals.",
      content:
        "Choosing a college is one of the biggest decisions a student makes. Start with accreditation and outcomes: look at NAAC grades, NIRF ranks, and verified placement data rather than brochures. Next, weigh the total cost of attendance — tuition, hostel, mess, and transport — against available scholarships. Finally, visit the campus (or book a campus visit through BeaconU) and talk to current students before you decide.",
      tags: ["admissions", "guidance"],
      authorId: superAdminId,
      authorType: "platform_admin",
      authorName: "BeaconU Editorial",
      status: "approved",
      publishedAt: new Date("2026-06-01T09:00:00Z"),
    },
    {
      slug: "neet-2026-preparation-guide",
      title: "NEET 2026: A 90-Day Preparation Guide",
      summary: "Structured revision plan for the medical entrance exam.",
      content:
        "With 90 days to NEET, split your preparation into three phases: 45 days of syllabus completion prioritising Biology and Organic Chemistry, 30 days of full-length mock tests every alternate day with error-log reviews, and a final 15 days of high-yield revision. Practice previous-year papers under timed conditions and target 160+ correct attempts.",
      tags: ["neet", "exams", "preparation"],
      authorId: author.id,
      authorType: "blog_author",
      authorName: ba.fullName,
      status: "approved",
      reviewedBy: superAdminId,
      reviewedAt: new Date("2026-06-10T10:00:00Z"),
      publishedAt: new Date("2026-06-10T10:00:00Z"),
    },
    {
      slug: "hostel-life-first-30-days",
      title: "Hostel Life: Surviving Your First 30 Days",
      summary: "What every fresher should know before moving into a hostel.",
      content:
        "Your first month in a hostel sets the tone for the year. Pack light but bring your own bedding and a power strip. Learn the mess timings and curfew rules on day one, introduce yourself to your warden, and set up a study routine before the first internal tests arrive.",
      tags: ["campus-life", "hostel"],
      authorId: author.id,
      authorType: "blog_author",
      authorName: ba.fullName,
      status: "pending",
    },
  ];
  for (const b of blogs) {
    await prisma.blog.upsert({
      where: { slug: b.slug },
      update: { title: b.title, status: b.status },
      create: b,
    });
  }

  // News alerts — platform news + college-scoped happenings (the college
  // happenings tab and student app news feeds read these)
  const newsAlerts = [
    {
      slug: "neet-2026-results-announced",
      title: "NEET 2026 Results Announced",
      summary: "NTA has declared NEET UG 2026 results on the official portal.",
      content:
        "The National Testing Agency announced the NEET UG 2026 results today. Candidates can download scorecards from the official portal using their application number and date of birth. Counselling registration opens next week.",
      tags: ["neet", "results"],
      collegeId: null as string | null,
      happeningCategory: null as string | null,
    },
    {
      slug: "research-innovation-week-2026",
      title: "Research Innovation Week 2026",
      summary: "A week-long showcase of student and faculty research projects.",
      content:
        "The annual Research Innovation Week brings together student and faculty research across departments, with demos, poster sessions, and industry judges. Open to all enrolled students.",
      tags: ["campus", "research"],
      collegeId: collegeIds[0] ?? null,
      happeningCategory: "college_news",
    },
    {
      slug: "students-win-national-hackathon",
      title: "Students Win National Hackathon",
      summary: "A team of final-year students won the Smart India Hackathon.",
      content:
        "A four-member team from the Computer Science department secured first place at the Smart India Hackathon 2026 with a healthcare logistics solution, winning a cash prize of ₹1,00,000.",
      tags: ["achievement"],
      collegeId: collegeIds[1] ?? collegeIds[0] ?? null,
      happeningCategory: "student_achievements",
    },
  ];
  for (const n of newsAlerts) {
    await prisma.newsAlert.upsert({
      where: { slug: n.slug },
      update: { title: n.title, status: "published" },
      create: {
        ...n,
        status: "published",
        publishedAt: new Date("2026-06-15T08:00:00Z"),
        publishedBy: superAdminId,
      },
    });
  }

  // Entrance exams (super-admin content section; also referenced by course tabs)
  const exams = [
    {
      code: "NEET-UG",
      name: "NEET UG",
      conductingBody: "National Testing Agency",
      examLevel: "national",
      applicableCourses: ["MBBS", "BDS", "B.Sc Nursing", "BAMS"],
      eligibility:
        "10+2 with Physics, Chemistry, Biology — minimum 50% aggregate.",
      description:
        "The National Eligibility cum Entrance Test for undergraduate medical and allied programmes across India.",
      registrationStart: new Date("2026-02-01"),
      registrationEnd: new Date("2026-03-15"),
      examDate: new Date("2026-05-03"),
      resultDate: new Date("2026-06-14"),
      officialWebsite: "https://neet.nta.nic.in",
    },
    {
      code: "JEE-MAIN",
      name: "JEE Main",
      conductingBody: "National Testing Agency",
      examLevel: "national",
      applicableCourses: ["B.Tech", "B.E", "B.Arch"],
      eligibility: "10+2 with Physics, Chemistry, Mathematics.",
      description:
        "Joint Entrance Examination for admission to undergraduate engineering programmes.",
      registrationStart: new Date("2026-01-10"),
      registrationEnd: new Date("2026-02-28"),
      examDate: new Date("2026-04-08"),
      resultDate: new Date("2026-04-25"),
      officialWebsite: "https://jeemain.nta.nic.in",
    },
    {
      code: "CAT",
      name: "Common Admission Test",
      conductingBody: "IIM Consortium",
      examLevel: "national",
      applicableCourses: ["MBA", "PGDM"],
      eligibility: "Bachelor's degree with minimum 50% aggregate.",
      description:
        "National-level management entrance test conducted by the IIMs.",
      registrationStart: new Date("2026-08-01"),
      registrationEnd: new Date("2026-09-15"),
      examDate: new Date("2026-11-29"),
      resultDate: new Date("2027-01-05"),
      officialWebsite: "https://iimcat.ac.in",
    },
    {
      code: "KCET",
      name: "Karnataka CET",
      conductingBody: "Karnataka Examinations Authority",
      examLevel: "state",
      applicableCourses: ["B.Tech", "B.Pharm", "BSc Agriculture"],
      eligibility:
        "10+2 from a recognised board; Karnataka domicile rules apply.",
      description:
        "State-level common entrance test for professional courses in Karnataka.",
      registrationStart: new Date("2026-01-20"),
      registrationEnd: new Date("2026-02-20"),
      examDate: new Date("2026-04-18"),
      resultDate: new Date("2026-05-20"),
      officialWebsite: "https://cetonline.karnataka.gov.in",
    },
  ];
  for (const e of exams) {
    await prisma.entranceExam.upsert({
      where: { code: e.code },
      update: { name: e.name, examDate: e.examDate, status: "active" },
      create: { ...e, status: "active", createdBy: superAdminId },
    });
  }

  // Education loans (student app "Financial Aid" section)
  const loans = [
    {
      bankName: "State Bank of India",
      productName: "SBI Student Loan Scheme",
      tag: "Most Popular",
      interestRate: "8.65% - 10.15%",
      interestRateMin: 8.65,
      maxAmount: "₹20 Lakhs",
      moratorium: "Course period + 1 year",
      processingFee: "Nil up to ₹20 Lakhs",
      loanType: "domestic",
      processingTime: "7-10 working days",
      margin: "Nil up to ₹4 Lakhs",
      collateralAmount: "Above ₹7.5 Lakhs",
      nonCollateralAmount: "Up to ₹7.5 Lakhs",
      repaymentTenure: "Up to 15 years",
      requiresCosigner: true,
      description:
        "Term loan for pursuing higher education in India with no processing fee and a moratorium covering the course period.",
      expensesCovered: [
        "Tuition fees",
        "Hostel & mess",
        "Books & equipment",
        "Exam fees",
      ],
      eligibility: [
        "Indian national",
        "Confirmed admission to a recognised institution",
      ],
      eligibleCourses: "All UG and PG programmes at recognised institutions",
      documentsApplicant: [
        "Admission letter",
        "10th/12th mark sheets",
        "ID & address proof",
      ],
      documentsCoApplicant: [
        "Income proof",
        "6-month bank statement",
        "ID proof",
      ],
      sortOrder: 1,
    },
    {
      bankName: "HDFC Credila",
      productName: "Credila Education Loan",
      tag: "Fast Approval",
      interestRate: "9.5% - 12%",
      interestRateMin: 9.5,
      maxAmount: "₹50 Lakhs",
      moratorium: "Course period + 6 months",
      processingFee: "1% of loan amount",
      loanType: "domestic",
      processingTime: "3-5 working days",
      repaymentTenure: "Up to 12 years",
      requiresCosigner: true,
      description:
        "Flexible education financing with doorstep documentation and quick sanction for domestic programmes.",
      expensesCovered: ["Tuition fees", "Living expenses", "Laptop", "Travel"],
      eligibility: ["Indian resident", "Co-borrower with stable income"],
      eligibleCourses: "UG, PG, and professional certification programmes",
      documentsApplicant: [
        "Admission proof",
        "Academic records",
        "KYC documents",
      ],
      documentsCoApplicant: ["Income documents", "KYC documents"],
      sortOrder: 2,
    },
    {
      bankName: "Bank of Baroda",
      productName: "Baroda Scholar",
      tag: "",
      interestRate: "9.15% - 10.60%",
      interestRateMin: 9.15,
      maxAmount: "₹80 Lakhs",
      moratorium: "Course period + 1 year",
      processingFee: "Nil for premier institutions",
      loanType: "international",
      processingTime: "10-14 working days",
      collateralAmount: "Above ₹7.5 Lakhs",
      repaymentTenure: "Up to 15 years",
      requiresCosigner: true,
      description:
        "Education loan for studies abroad covering tuition, travel, and living expenses at premier institutions.",
      expensesCovered: [
        "Tuition fees",
        "Travel & visa",
        "Living expenses",
        "Health insurance",
      ],
      eligibility: [
        "Indian national",
        "Admission to a recognised foreign institution",
      ],
      eligibleCourses: "Job-oriented UG/PG programmes abroad",
      documentsApplicant: ["Offer letter", "Academic records", "Passport"],
      documentsCoApplicant: [
        "Income proof",
        "Collateral documents where applicable",
      ],
      sortOrder: 3,
    },
  ];
  for (const loan of loans) {
    const existing = await prisma.educationLoan.findFirst({
      where: { bankName: loan.bankName, productName: loan.productName },
    });
    if (existing) {
      await prisma.educationLoan.update({
        where: { id: existing.id },
        data: { interestRate: loan.interestRate, status: "active" },
      });
    } else {
      await prisma.educationLoan.create({
        data: { ...loan, status: "active" },
      });
    }
  }

  // Starter guides (student app onboarding)
  const starterGuides = [
    {
      title: "Getting Started with BeaconU",
      thumbnailUrl: "https://placehold.co/400x225?text=Getting+Started",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      steps: [
        {
          title: "Create your profile",
          description: "Sign up and fill in your basic details.",
        },
        {
          title: "Explore colleges",
          description: "Browse colleges and shortlist the ones you like.",
        },
      ],
      displayOrder: 1,
    },
    {
      title: "How to Apply to a College",
      thumbnailUrl: "https://placehold.co/400x225?text=How+to+Apply",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      steps: [
        {
          title: "Pick a course",
          description: "Choose the course you want to apply for.",
        },
        {
          title: "Fill the application",
          description: "Complete the application form with your details.",
        },
        {
          title: "Submit and pay",
          description: "Pay the application fee and submit.",
        },
      ],
      displayOrder: 2,
    },
    {
      title: "Booking a Campus Visit",
      thumbnailUrl: "https://placehold.co/400x225?text=Campus+Visit",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      steps: [
        {
          title: "Open a college profile",
          description: "Go to the college you're interested in.",
        },
        {
          title: "Choose a slot",
          description: "Pick an available campus visit slot.",
        },
      ],
      displayOrder: 3,
    },
  ];
  for (const g of starterGuides) {
    const existing = await prisma.starterGuide.findFirst({
      where: { title: g.title },
    });
    if (!existing) {
      await prisma.starterGuide.create({ data: { ...g, isActive: true } });
    }
  }

  console.log("✓ Content (blogs, news, entrance exams, loans, starter guides)");
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Events (platform + college-scoped, one past event with recording)
// ─────────────────────────────────────────────────────────────────────────────

async function seedEvents(superAdminId: string, collegeIds: string[]) {
  const events = [
    {
      slug: "national-admissions-webinar-2026",
      title: "National Admissions Webinar 2026",
      description:
        "Live webinar covering the 2026-27 admissions landscape — entrance exams, application timelines, and scholarship opportunities.",
      category: "webinar",
      speakerName: "Dr. Shalini Verma",
      speakerTitle: "Senior Academic Counsellor, BeaconU",
      organizer: "BeaconU",
      eventDate: new Date("2026-07-25"),
      startTime: new Date("1970-01-01T17:00:00+05:30"),
      endTime: new Date("1970-01-01T18:30:00+05:30"),
      duration: "90 minutes",
      eventMode: "online",
      onlineLink: "https://meet.beaconu.com/admissions-webinar-2026",
      isFree: true,
      ticketPrice: 0,
      totalSeats: 500,
      collegeId: null as string | null,
      status: "published",
      createdByType: "platform_admin",
      createdById: superAdminId,
    },
    {
      slug: "career-fair-2026",
      title: "BeaconU Career Fair 2026",
      description:
        "Meet recruiters from 40+ companies, attend resume clinics, and explore internship openings across sectors.",
      category: "career_fair",
      organizer: "BeaconU",
      eventDate: new Date("2026-08-20"),
      startTime: new Date("1970-01-01T10:00:00+05:30"),
      endTime: new Date("1970-01-01T17:00:00+05:30"),
      duration: "Full day",
      eventMode: "offline",
      venue: "Palace Grounds, Bangalore",
      isFree: false,
      ticketPrice: 199,
      totalSeats: 2000,
      collegeId: null as string | null,
      status: "published",
      createdByType: "platform_admin",
      createdById: superAdminId,
    },
    {
      slug: "vydehi-open-day-2026",
      title: "Vydehi Campus Open Day",
      description:
        "Guided campus tours, faculty interactions, and live lab demos for prospective students and parents.",
      category: "open_day",
      organizer: "Vydehi Institute",
      eventDate: new Date("2026-07-12"),
      startTime: new Date("1970-01-01T09:30:00+05:30"),
      endTime: new Date("1970-01-01T13:00:00+05:30"),
      duration: "Half day",
      eventMode: "offline",
      venue: "Main Campus, Whitefield",
      isFree: true,
      ticketPrice: 0,
      totalSeats: 300,
      collegeId: collegeIds[0] ?? null,
      status: "published",
      createdByType: "platform_admin",
      createdById: superAdminId,
    },
    {
      slug: "scholarship-masterclass-recorded",
      title: "Scholarship Masterclass (Recorded)",
      description:
        "Recorded session on maximising merit scholarships and financial aid during admissions.",
      category: "masterclass",
      speakerName: "Kiran Content",
      speakerTitle: "Content Manager, BeaconU",
      organizer: "BeaconU",
      eventDate: new Date("2026-05-10"),
      duration: "60 minutes",
      eventMode: "online",
      isFree: true,
      ticketPrice: 0,
      hasRecording: true,
      recordingUrl:
        "https://cdn.beaconu.com/recordings/scholarship-masterclass.mp4",
      recordingDuration: "58:24",
      recordedAt: new Date("2026-05-10"),
      collegeId: null as string | null,
      status: "completed",
      createdByType: "platform_admin",
      createdById: superAdminId,
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { title: e.title, status: e.status },
      create: e,
    });
  }

  // One registration so the flow has data end-to-end
  const student = await prisma.student.findUnique({
    where: { email: CREDENTIALS.students[0].email },
  });
  const webinar = await prisma.event.findUnique({
    where: { slug: "national-admissions-webinar-2026" },
  });
  if (student && webinar) {
    await prisma.eventRegistration.upsert({
      where: {
        uq_event_registration: { eventId: webinar.id, studentId: student.id },
      },
      update: {},
      create: {
        eventId: webinar.id,
        studentId: student.id,
        paymentStatus: "not_applicable",
        status: "registered",
      },
    });
  }

  console.log("✓ Events");
}

// ─────────────────────────────────────────────────────────────────────────────
// Course + department + fee + seat-pool definitions per college
// ─────────────────────────────────────────────────────────────────────────────

const VYDEHI: CollegeSeedDef = {
  slug: "vydehi-institute",
  code: "VIMSR",
  name: "Vydehi Institute of Medical Science & Research Centre",
  shortName: "Vydehi",
  city: "Bangalore",
  state: "Karnataka",
  district: "Bangalore Urban",
  address: "82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066",
  pinCode: "560066",
  establishedYear: 2000,
  website: "https://vydehi.edu.in",
  latitude: 12.9453,
  longitude: 77.7207,
  contactEmail: "admin@vydehi.edu.in",
  contactName: "Dr. Rajiv Menon",
};

const BEACON_TECH: CollegeSeedDef = {
  slug: "beacon-institute-of-technology",
  code: "BIT",
  name: "Beacon Institute of Technology",
  shortName: "BeaconTech",
  city: "Mysore",
  state: "Karnataka",
  district: "Mysore",
  address: "12, Ring Road, Hebbal Industrial Area, Mysore, Karnataka 570016",
  pinCode: "570016",
  establishedYear: 2008,
  website: "https://beacontech.edu.in",
  latitude: 12.3376,
  longitude: 76.6193,
  contactEmail: "admin@beacontech.edu.in",
  contactName: "Prof. Anita Desai",
};

const VYDEHI_DEPARTMENTS = [
  { name: "Department of Medicine", slug: "medicine" },
  { name: "Department of Dentistry", slug: "dentistry" },
  { name: "Department of Nursing", slug: "nursing" },
  { name: "Department of Management Studies", slug: "management" },
];

const VYDEHI_COURSES: CourseSeedDef[] = [
  {
    name: "Bachelor of Medicine, Bachelor of Surgery",
    code: "MBBS",
    disciplineSlug: "mbbs",
    studyLevelSlug: "ug",
    programTypeSlug: "full_time",
    departmentSlug: "medicine",
    duration: "5.5 Years",
    intakeCapacity: 150,
    studyMode: "full_time",
    totalFee: "₹6,50,000",
    applicationFee: 1500,
    highlights: [
      "WHO recognized",
      "Clinical exposure from Year 1",
      "Attached to 800-bed hospital",
    ],
    quotaSlugs: ["government_quota", "management_quota", "nri_quota"],
  },
  {
    name: "Bachelor of Dental Surgery",
    code: "BDS",
    disciplineSlug: "bds",
    studyLevelSlug: "ug",
    programTypeSlug: "full_time",
    departmentSlug: "dentistry",
    duration: "5 Years",
    intakeCapacity: 60,
    studyMode: "full_time",
    totalFee: "₹3,00,000",
    applicationFee: 1200,
    highlights: ["DCI approved", "In-house dental hospital"],
    quotaSlugs: ["government_quota", "management_quota", "nri_quota"],
  },
  {
    name: "Bachelor of Science in Nursing",
    code: "BSC_NURSING",
    disciplineSlug: "bsc_nursing",
    studyLevelSlug: "ug",
    programTypeSlug: "full_time",
    departmentSlug: "nursing",
    duration: "4 Years",
    intakeCapacity: 100,
    studyMode: "full_time",
    totalFee: "₹1,10,000",
    applicationFee: 800,
    highlights: ["INC recognised", "Hospital rotations from Year 2"],
    quotaSlugs: ["merit_quota", "management_quota"],
  },
  {
    name: "Master of Business Administration",
    code: "MBA_DT",
    disciplineSlug: "mba",
    studyLevelSlug: "pg",
    programTypeSlug: "full_time",
    departmentSlug: "management",
    duration: "24 Months",
    intakeCapacity: 120,
    studyMode: "full_time",
    totalFee: "₹3,50,000",
    applicationFee: 1000,
    highlights: ["Industry mentors from 15 sectors", "Live projects"],
    quotaSlugs: ["merit_quota", "management_quota", "other_state_quota"],
  },
];

// Management quota pool is SHARED across MBBS + BDS (pooled seat matrix).
const VYDEHI_SEAT_POOLS = [
  {
    quotaSlug: "government_quota",
    totalSeats: 90,
    courseCodes: ["MBBS", "BDS"],
  },
  {
    quotaSlug: "management_quota",
    totalSeats: 120,
    courseCodes: ["MBBS", "BDS", "MBA_DT", "BSC_NURSING"],
  },
  {
    quotaSlug: "merit_quota",
    totalSeats: 140,
    courseCodes: ["BSC_NURSING", "MBA_DT"],
  },
  { quotaSlug: "nri_quota", totalSeats: 25, courseCodes: ["MBBS", "BDS"] },
  { quotaSlug: "other_state_quota", totalSeats: 20, courseCodes: ["MBA_DT"] },
];

const VYDEHI_FEES = [
  {
    courseCode: "MBBS",
    fees: [
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
    ],
  },
  {
    courseCode: "MBA_DT",
    fees: [
      { feeCategory: "tuition_fee", amount: 175000, yearOrSemester: "Year 1" },
      { feeCategory: "tuition_fee", amount: 175000, yearOrSemester: "Year 2" },
      {
        feeCategory: "application_fee",
        amount: 1000,
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
    ],
  },
];

const BEACON_DEPARTMENTS = [
  { name: "Department of Computer Science", slug: "computer-science" },
  { name: "Department of Management Studies", slug: "management" },
];

const BEACON_COURSES: CourseSeedDef[] = [
  {
    name: "B.Tech in Computer Science & Engineering",
    code: "BTECH_CSE",
    disciplineSlug: "cse",
    studyLevelSlug: "ug",
    programTypeSlug: "full_time",
    departmentSlug: "computer-science",
    duration: "4 Years",
    intakeCapacity: 180,
    studyMode: "full_time",
    totalFee: "₹4,80,000",
    applicationFee: 1200,
    highlights: [
      "NBA accredited",
      "AI/ML specialisation tracks",
      "Industry capstone projects",
    ],
    quotaSlugs: ["merit_quota", "management_quota", "other_state_quota"],
  },
  {
    name: "Master of Computer Applications",
    code: "MCA",
    disciplineSlug: "cse",
    studyLevelSlug: "pg",
    programTypeSlug: "full_time",
    departmentSlug: "computer-science",
    duration: "24 Months",
    intakeCapacity: 60,
    studyMode: "full_time",
    totalFee: "₹2,20,000",
    applicationFee: 1000,
    highlights: ["Placement-focused curriculum", "Cloud & DevOps electives"],
    quotaSlugs: ["merit_quota", "management_quota"],
  },
  {
    name: "Bachelor of Business Administration",
    code: "BBA",
    disciplineSlug: "bba",
    studyLevelSlug: "ug",
    programTypeSlug: "full_time",
    departmentSlug: "management",
    duration: "36 Months",
    intakeCapacity: 80,
    studyMode: "full_time",
    totalFee: "₹1,80,000",
    applicationFee: 800,
    highlights: ["Entrepreneurship incubator", "Summer internships"],
    quotaSlugs: ["merit_quota", "management_quota"],
  },
];

const BEACON_SEAT_POOLS = [
  {
    quotaSlug: "merit_quota",
    totalSeats: 200,
    courseCodes: ["BTECH_CSE", "MCA", "BBA"],
  },
  {
    quotaSlug: "management_quota",
    totalSeats: 90,
    courseCodes: ["BTECH_CSE", "MCA", "BBA"],
  },
  {
    quotaSlug: "other_state_quota",
    totalSeats: 30,
    courseCodes: ["BTECH_CSE"],
  },
];

const BEACON_FEES = [
  {
    courseCode: "BTECH_CSE",
    fees: [
      { feeCategory: "tuition_fee", amount: 120000, yearOrSemester: "Year 1" },
      { feeCategory: "tuition_fee", amount: 120000, yearOrSemester: "Year 2" },
      {
        feeCategory: "application_fee",
        amount: 1200,
        yearOrSemester: "One-time",
      },
      {
        feeCategory: "admission_fee",
        amount: 10000,
        yearOrSemester: "One-time",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function seedFullCollege(
  def: CollegeSeedDef,
  opts: {
    universityId: string;
    superAdminId: string;
    disciplineIds: Record<string, string>;
    studyLevelIds: Record<string, string>;
    programTypeIds: Record<string, string>;
    departments: { name: string; slug: string }[];
    courses: CourseSeedDef[];
    seatPools: {
      quotaSlug: string;
      totalSeats: number;
      courseCodes: string[];
    }[];
    fees: {
      courseCode: string;
      fees: { feeCategory: string; amount: number; yearOrSemester: string }[];
    }[];
    hostelPrefix: string;
  },
) {
  const { college } = await seedCollegeViaOnboardingFlow(
    def,
    opts.universityId,
    opts.superAdminId,
  );
  const campus = await seedCampus(college.id, def);
  const departmentIds = await seedDepartments(
    college.id,
    campus.id,
    opts.departments,
  );
  const collegeQuotaIds = await seedCollegeQuotas(college.id);
  // Hostels and libraries come first — the student_housing and library course
  // tabs reference their IDs (hostelIds / libraryIds).
  const hostelIds = await seedHostels(college.id, opts.hostelPrefix);
  const libraryIds = await seedLibraries(college.id, opts.disciplineIds);
  await seedCommuteRoutes(college.id);
  const courseIds = await seedCourses(college.id, campus.id, opts.courses, {
    disciplineIds: opts.disciplineIds,
    studyLevelIds: opts.studyLevelIds,
    programTypeIds: opts.programTypeIds,
    departmentIds,
    collegeQuotaIds,
    hostelIds,
    libraryIds,
  });
  await seedAdmissionCycle(
    college.id,
    courseIds,
    opts.courses,
    collegeQuotaIds,
    opts.seatPools,
  );
  await seedFeeStructures(college.id, courseIds, opts.fees);
  return college;
}

function printCredentials() {
  const line = "─".repeat(78);
  console.log(`\n${line}`);
  console.log("  CREDENTIALS");
  console.log(line);

  console.log("\n  Platform Admins (super-admin app, /api/v1/admin):");
  for (const a of CREDENTIALS.platformAdmins) {
    console.log(`    ${a.role.padEnd(18)} ${a.email.padEnd(36)} ${a.password}`);
  }

  console.log("\n  College Staff (college-admin app, /api/v1/college-admin):");
  for (const a of CREDENTIALS.collegeAdmins) {
    console.log(
      `    ${a.roleSlug.padEnd(14)} ${a.email.padEnd(30)} ${a.password.padEnd(12)} [${a.collegeSlug}]`,
    );
  }

  console.log("\n  Blink Users (/api/v1/blink):");
  const b = CREDENTIALS.blink;
  console.log(
    `    associate_admin    ${b.associateAdmin.email.padEnd(36)} ${b.associateAdmin.password}`,
  );
  console.log(
    `    associate_employee ${b.associateEmployee.email.padEnd(36)} ${b.associateEmployee.password}`,
  );
  for (const amb of b.ambassadors) {
    console.log(
      `    campus_ambassador  ${amb.email.padEnd(36)} ${amb.password} [${amb.collegeSlug}]`,
    );
  }

  console.log("\n  Counsellors (/api/v1/counsellor):");
  for (const c of CREDENTIALS.counsellors) {
    console.log(
      `    ${c.counsellorType.padEnd(10)} ${c.email.padEnd(36)} ${c.password}`,
    );
  }

  console.log("\n  Blog Author (blink-web author portal):");
  console.log(
    `    blog_author        ${CREDENTIALS.blogAuthor.email.padEnd(36)} ${CREDENTIALS.blogAuthor.password}`,
  );

  console.log("\n  Students (OTP / Google login — no password):");
  for (const s of CREDENTIALS.students) {
    console.log(
      `    ${s.fullName.padEnd(18)} ${s.email.padEnd(32)} +91 ${s.phone}`,
    );
  }
  console.log(`\n${line}\n`);
}

async function main() {
  console.log("\n🌱  BeaconU Seed\n");

  const { superAdminId } = await seedPlatformRbac();
  const blinkRoleIds = await seedBlinkRoles();
  const uniTypeIds = await seedUniversityTypes();
  const disciplineIds = await seedStreamsAndDisciplines();
  const studyLevelIds = await seedStudyLevels();
  const programTypeIds = await seedProgramTypes();

  const university = await seedUniversity(uniTypeIds["deemed_university"]);

  const vydehi = await seedFullCollege(VYDEHI, {
    universityId: university.id,
    superAdminId,
    disciplineIds,
    studyLevelIds,
    programTypeIds,
    departments: VYDEHI_DEPARTMENTS,
    courses: VYDEHI_COURSES,
    seatPools: VYDEHI_SEAT_POOLS,
    fees: VYDEHI_FEES,
    hostelPrefix: "vydehi",
  });

  const beaconTech = await seedFullCollege(BEACON_TECH, {
    universityId: university.id,
    superAdminId,
    disciplineIds,
    studyLevelIds,
    programTypeIds,
    departments: BEACON_DEPARTMENTS,
    courses: BEACON_COURSES,
    seatPools: BEACON_SEAT_POOLS,
    fees: BEACON_FEES,
    hostelPrefix: "beacontech",
  });

  await seedInstitutionGroup(vydehi.id, beaconTech.id);

  await seedBlinkUsers(blinkRoleIds, {
    [VYDEHI.slug]: vydehi.id,
    [BEACON_TECH.slug]: beaconTech.id,
  });
  await seedCounsellors();
  await seedStudents();
  await seedContent(superAdminId, [vydehi.id, beaconTech.id]);
  await seedEvents(superAdminId, [vydehi.id, beaconTech.id]);

  console.log("\n✅  Seed complete!");
  console.log(
    `  Colleges : ${vydehi.slug} (${vydehi.id}), ${beaconTech.slug} (${beaconTech.id})`,
  );
  printCredentials();
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
