// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Lookup tables
  const stream = await prisma.stream.create({
    data: {
      name: "Engineering & Technology",
      slug: "engineering",
      sortOrder: 1,
    },
  });

  const studyLevel = await prisma.studyLevel.create({
    data: { name: "Undergraduate", slug: "ug", sortOrder: 1 },
  });

  const programType = await prisma.programType.create({
    data: { name: "Full-time", slug: "full_time", sortOrder: 1 },
  });

  const discipline = await prisma.discipline.create({
    data: {
      name: "Computer Science",
      slug: "computer-science",
      streamId: stream.id,
    },
  });

  // 2. University + College
  const uniType = await prisma.universityType.create({
    data: { name: "Private University", slug: "private", sortOrder: 1 },
  });

  const university = await prisma.university.create({
    data: {
      name: "Test University",
      slug: "test-university",
      universityTypeId: uniType.id,
      state: "Karnataka",
    },
  });

  const college = await prisma.college.create({
    data: {
      universityId: university.id,
      name: "Test College",
      slug: "test-college",
      code: "TC001",
      state: "Karnataka",
      city: "Bangalore",
    },
  });

  // 3. Seed system roles for the college
  const roles = [
    "college_admin",
    "evaluator",
    "financial_team",
    "admission_team",
    "hostel_team",
    "marketing_team",
  ];
  for (const slug of roles) {
    await prisma.collegeRole.create({
      data: {
        collegeId: college.id,
        name: slug.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        slug,
        isSystemRole: true,
      },
    });
  }

  // 4. Test student
  const student = await prisma.student.create({
    data: {
      fullName: "Test Student",
      email: "student@test.com",
      phoneNumber: "9999999999",
      source: "beaconu_app",
    },
  });

  console.log("Seed complete:", { college: college.id, student: student.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
