import { CampusVisitsService } from "./modules/campus-visits/services/campus-visits.service";
import { CampusVisitsRepository } from "./modules/campus-visits/repositories/campus-visits.repository";
import { prisma } from "@beaconu/db";

async function nextDateForWeekday(targetWeekday: number): Promise<string> {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 12);
  while (d.getUTCDay() !== targetWeekday) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d.toISOString().split("T")[0]!;
}

async function main() {
  // 1) Book with an ambassador assigned -> should trigger notifyAmbassadorOfBooking without throwing
  const date = await nextDateForWeekday(0); // Sunday, open for CLG-5
  const visit = await CampusVisitsService.book(
    {
      college_id: "CLG-5",
      ambassador_id: "BLU-16", // wrong college on purpose? No, need a CLG-5 ambassador.
      full_name: "Notif Test",
      email: "notiftest@example.com",
      phone_number: "9999999999",
      additional_visitors_count: 0,
      reason_for_visit: "Verifying booking notification does not throw",
      proposed_date: date,
    },
    "STU-3",
  ).catch((e) => {
    console.log(
      "Book with cross-college ambassador failed as expected:",
      e.message,
    );
    return null;
  });

  // Find a real CLG-5 ambassador instead
  const clg5Ambassador = await prisma.blinkUser.findFirst({
    where: {
      collegeId: "CLG-5",
      blinkRole: { slug: "campus_ambassador" },
      status: "active",
    },
  });
  console.log("CLG-5 ambassador found:", clg5Ambassador?.id ?? "none");

  let realVisit;
  if (clg5Ambassador) {
    realVisit = await CampusVisitsService.book(
      {
        college_id: "CLG-5",
        ambassador_id: clg5Ambassador.id,
        full_name: "Notif Test",
        email: "notiftest@example.com",
        phone_number: "9999999999",
        additional_visitors_count: 0,
        reason_for_visit: "Verifying booking notification does not throw",
        proposed_date: date,
      },
      "STU-3",
    );
    console.log(
      "Booked (with ambassador) visit id:",
      realVisit.id,
      "- notification call completed without throwing",
    );

    // 2) Accept -> notifyStudentOfAcceptance
    const accepted = await CampusVisitsService.accept(
      realVisit.id,
      clg5Ambassador.id,
    );
    console.log(
      "Accepted visit status:",
      accepted.status,
      "- notification call completed without throwing",
    );

    // 3) Cancel -> notifyAmbassadorOfCancellation
    const cancelled = await CampusVisitsService.cancel(realVisit.id, "STU-3", {
      cancellation_reason: "test cleanup",
    });
    console.log(
      "Cancelled visit status:",
      cancelled.status,
      "- notification call completed without throwing",
    );

    await prisma.campusVisit.delete({ where: { id: realVisit.id } });
    console.log("Cleaned up test visit:", realVisit.id);
  }

  // 4) Reminder job function runs without throwing
  const remindersSent = await CampusVisitsService.sendUpcomingVisitReminders();
  console.log("sendUpcomingVisitReminders ran cleanly, count:", remindersSent);

  const upcoming = await CampusVisitsRepository.findUpcomingActiveVisits(
    new Date(),
  );
  console.log("findUpcomingActiveVisits returned", upcoming.length, "rows");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});
