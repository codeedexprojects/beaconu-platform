import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CleanupResult {
  table: string;
  field: string;
  recordsUpdated: number;
  recordsRemaining: number;
}

function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes("?")) return url;

  const [cleanPart] = url.split("?");
  return cleanPart;
}

function isPresignedUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes("X-Amz") || url.includes("?");
}

async function main() {
  console.log("🔄 Starting database cleanup of presigned URLs...\n");

  const results: CleanupResult[] = [];

  try {
    console.log("📝 Cleaning colleges.logoUrl...");
    const colleges = await prisma.college.findMany({
      where: {
        logoUrl: {
          contains: "X-Amz",
        },
      },
      select: { id: true, logoUrl: true },
    });

    let collegesLogoUpdated = 0;
    for (const college of colleges) {
      if (college.logoUrl && isPresignedUrl(college.logoUrl)) {
        const cleanedUrl = cleanUrl(college.logoUrl);
        await prisma.college.update({
          where: { id: college.id },
          data: { logoUrl: cleanedUrl },
        });
        collegesLogoUpdated++;
      }
    }

    const collegesLogoRemaining = await prisma.college.count({
      where: { logoUrl: { contains: "X-Amz" } },
    });

    results.push({
      table: "colleges",
      field: "logoUrl",
      recordsUpdated: collegesLogoUpdated,
      recordsRemaining: collegesLogoRemaining,
    });

    console.log("📝 Cleaning colleges.coverImageUrl...");
    const collegesCoverImage = await prisma.college.findMany({
      where: {
        coverImageUrl: {
          contains: "X-Amz",
        },
      },
      select: { id: true, coverImageUrl: true },
    });

    let collegesCoverUpdated = 0;
    for (const college of collegesCoverImage) {
      if (college.coverImageUrl && isPresignedUrl(college.coverImageUrl)) {
        const cleanedUrl = cleanUrl(college.coverImageUrl);
        await prisma.college.update({
          where: { id: college.id },
          data: { coverImageUrl: cleanedUrl },
        });
        collegesCoverUpdated++;
      }
    }

    const collegesCoverRemaining = await prisma.college.count({
      where: { coverImageUrl: { contains: "X-Amz" } },
    });

    results.push({
      table: "colleges",
      field: "coverImageUrl",
      recordsUpdated: collegesCoverUpdated,
      recordsRemaining: collegesCoverRemaining,
    });

    console.log("📝 Cleaning student_profiles.avatarUrl...");
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        avatarUrl: {
          contains: "X-Amz",
        },
      },
      select: { id: true, avatarUrl: true },
    });

    let studentUpdated = 0;
    for (const profile of studentProfiles) {
      if (profile.avatarUrl && isPresignedUrl(profile.avatarUrl)) {
        const cleanedUrl = cleanUrl(profile.avatarUrl);
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: { avatarUrl: cleanedUrl },
        });
        studentUpdated++;
      }
    }

    const studentRemaining = await prisma.studentProfile.count({
      where: { avatarUrl: { contains: "X-Amz" } },
    });

    results.push({
      table: "student_profiles",
      field: "avatarUrl",
      recordsUpdated: studentUpdated,
      recordsRemaining: studentRemaining,
    });

    console.log("📝 Cleaning staff_members.avatarUrl...");
    const staffMembers = await prisma.staffMember.findMany({
      where: {
        avatarUrl: {
          contains: "X-Amz",
        },
      },
      select: { id: true, avatarUrl: true },
    });

    let staffUpdated = 0;
    for (const staff of staffMembers) {
      if (staff.avatarUrl && isPresignedUrl(staff.avatarUrl)) {
        const cleanedUrl = cleanUrl(staff.avatarUrl);
        await prisma.staffMember.update({
          where: { id: staff.id },
          data: { avatarUrl: cleanedUrl },
        });
        staffUpdated++;
      }
    }

    const staffRemaining = await prisma.staffMember.count({
      where: { avatarUrl: { contains: "X-Amz" } },
    });

    results.push({
      table: "staff_members",
      field: "avatarUrl",
      recordsUpdated: staffUpdated,
      recordsRemaining: staffRemaining,
    });

    console.log("\n✅ Cleanup Complete!\n");
    console.log("Summary:");
    console.log("─".repeat(70));

    results.forEach((result) => {
      console.log(
        `${result.table}.${result.field}: ${result.recordsUpdated} updated, ${result.recordsRemaining} remaining`,
      );
    });

    const totalUpdated = results.reduce((sum, r) => sum + r.recordsUpdated, 0);
    const totalRemaining = results.reduce(
      (sum, r) => sum + r.recordsRemaining,
      0,
    );

    console.log("─".repeat(70));
    console.log(`Total updated: ${totalUpdated}`);
    console.log(`Total remaining with presigned params: ${totalRemaining}`);

    if (totalRemaining === 0) {
      console.log("\n🎉 All presigned URLs have been cleaned!");
    } else {
      console.warn(
        `\n⚠️  Found ${totalRemaining} URLs that still contain presigned params`,
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
