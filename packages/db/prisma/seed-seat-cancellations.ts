import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../.env") });
import { prisma } from "../src/index";

// Seeds one SeatCancellation case per phase of the 5-phase case flow, using
// real existing active enrollments at CLG-10, so every phase's UI can be
// exercised without manually clicking through each step from scratch.
//
// NOTE: the "fully cleared" case (case 6) only sets the SeatCancellation
// row's own fields to a finished state — it deliberately does NOT touch
// Enrollment/ApplicationCourse/seat-pool data (that cascade only happens
// through the real API's finalClearance() transaction). Good enough to
// preview the completed Phase 5 screen; not a substitute for exercising
// the real finalize endpoint if you want to confirm the seat-release side
// effects too.

const COUNSELOR_ID = "STF-12"; // Prof. Anita Desai, active staff at CLG-10

interface SeedCase {
  applicationCourseId: string;
  studentId: string;
  reason: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6; // 6 = phase 5 fully cleared
  outcome?: "transfer" | "termination";
  caseType?: "A" | "B" | "C";
}

const CASES: SeedCase[] = [
  {
    applicationCourseId: "APC-33",
    studentId: "STU-9",
    reason: "Relocating to a different city for family reasons.",
    phase: 1,
  },
  {
    applicationCourseId: "APC-29",
    studentId: "STU-39",
    reason: "Found a program better aligned with my career goals.",
    phase: 2,
  },
  {
    applicationCourseId: "APC-38",
    studentId: "STU-43",
    reason: "Financial constraints — unable to continue this semester.",
    phase: 3,
  },
  {
    applicationCourseId: "APC-40",
    studentId: "STU-45",
    reason: "Transferring to a university closer to home.",
    phase: 4,
    outcome: "transfer",
  },
  {
    applicationCourseId: "APC-39",
    studentId: "STU-44",
    reason: "Accepted into a different university's program.",
    phase: 5,
    outcome: "transfer",
    caseType: "B",
  },
  {
    applicationCourseId: "APC-45",
    studentId: "STU-48",
    reason: "Deciding to discontinue studies altogether.",
    phase: 6,
    outcome: "termination",
    caseType: "A",
  },
];

async function ensureNoExistingPending(applicationCourseId: string) {
  const existing = await prisma.seatCancellation.findFirst({
    where: { applicationCourseId, status: "pending" },
  });
  if (existing) {
    console.log(
      `  - skipping ${applicationCourseId}, already has a pending case (${existing.id})`,
    );
    return existing.id;
  }
  return null;
}

async function main() {
  console.log("Seeding seat cancellation cases...\n");

  for (const c of CASES) {
    console.log(`Case for ${c.applicationCourseId} (target phase ${c.phase})`);

    const existingId = await ensureNoExistingPending(c.applicationCourseId);
    let id = existingId;

    if (!id) {
      const created = await prisma.seatCancellation.create({
        data: {
          applicationCourseId: c.applicationCourseId,
          studentId: c.studentId,
          reason: c.reason,
        },
      });
      id = created.id;
      console.log(`  + created ${id}`);
    }

    if (c.phase >= 2) {
      await prisma.seatCancellation.update({
        where: { id },
        data: {
          effectiveDate: new Date("2026-10-12"),
          lastSemester: "Sem 3",
          currentPhase: 2,
        },
      });
    }

    if (c.phase >= 3) {
      await prisma.seatCancellation.update({
        where: { id },
        data: {
          counselorId: COUNSELOR_ID,
          scheduledAt: new Date("2026-10-14T10:30:00Z"),
          counselingCompletedAt: new Date("2026-10-14T10:30:00Z"),
          currentPhase: 3,
        },
      });
    }

    if (c.phase >= 4) {
      const outcome = c.outcome ?? "transfer";
      await prisma.seatCancellation.update({
        where: { id },
        data: {
          counselingNotes:
            outcome === "transfer"
              ? "Student expressed desire to pursue a different academic focus not offered here. Counseling was supportive, and student is firm on transferring."
              : "Student cited personal/financial reasons and does not intend to continue at any institution.",
          counselingOutcome: outcome,
          suggestedCaseType: outcome === "transfer" ? "B" : null,
          currentPhase: 4,
        },
      });
    }

    if (c.phase >= 5) {
      const caseType = c.caseType ?? "B";
      if (caseType === "A") {
        await prisma.seatCancellation.update({
          where: { id },
          data: {
            caseType: "A",
            penaltyAmount: 1500,
            penaltyPaidAt: new Date("2026-10-15T09:00:00Z"),
            settledAt: new Date("2026-10-15T09:00:00Z"),
            currentPhase: 5,
          },
        });
      } else {
        await prisma.seatCancellation.update({
          where: { id },
          data: {
            caseType: "B",
            refundCalculationMethod: "percentage",
            refundCalculationValue: 10,
            refundAmount: 105,
            settledAt: new Date("2026-10-15T09:00:00Z"),
            currentPhase: 5,
          },
        });
      }
    }

    if (c.phase >= 6) {
      const caseType = c.caseType ?? "B";
      await prisma.seatCancellation.update({
        where: { id },
        data: {
          documentsHandedOverAt: new Date("2026-10-16T11:00:00Z"),
          status: "approved",
          processedBy: COUNSELOR_ID,
          processedAt: new Date("2026-10-16T11:00:00Z"),
          ...(caseType === "B"
            ? {
                refundTransactionRef: "REF-2026-0016-01",
                refundPaymentMethod: "Bank Transfer (Bank of India)",
                refundProcessedAt: new Date("2026-10-16T11:00:00Z"),
                refundStatus: "processed",
              }
            : { refundStatus: "not_applicable" }),
        },
      });
    }

    console.log(
      `  = ${id} now at phase ${Math.min(c.phase, 5)}${c.phase === 6 ? " (cleared)" : ""}\n`,
    );
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
