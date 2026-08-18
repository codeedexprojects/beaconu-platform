import { logger } from "@/shared/lib/logger";
import {
  startSessionAutoCompleteJob,
  stopSessionAutoCompleteJob,
} from "@/modules/counselling/jobs/session-auto-complete.job";
import {
  startSessionReminderJob,
  stopSessionReminderJob,
} from "@/modules/counselling/jobs/session-reminder.job";
import {
  startSlotCleanupJob,
  stopSlotCleanupJob,
} from "@/modules/counselling/jobs/slot-cleanup.job";
import {
  startVisitReminderJob,
  stopVisitReminderJob,
} from "@/modules/campus-visits/jobs/visit-reminder.job";
import {
  startAssessmentAutoSubmitJob,
  stopAssessmentAutoSubmitJob,
} from "@/modules/assessments/jobs/assessment-auto-submit.job";
import {
  startInterviewSlotExpiryJob,
  stopInterviewSlotExpiryJob,
} from "@/modules/interviews/jobs/slot-expiry.job";
import {
  startInvoiceGenerationWorker,
  stopInvoiceGenerationWorker,
} from "@/modules/payments/jobs/invoice-generation.job";

const JOBS = [
  {
    name: "Session auto-complete",
    start: startSessionAutoCompleteJob,
    stop: stopSessionAutoCompleteJob,
  },
  {
    name: "Session reminder",
    start: startSessionReminderJob,
    stop: stopSessionReminderJob,
  },
  {
    name: "Slot cleanup",
    start: startSlotCleanupJob,
    stop: stopSlotCleanupJob,
  },
  {
    name: "Campus visit reminder",
    start: startVisitReminderJob,
    stop: stopVisitReminderJob,
  },
  {
    name: "Assessment auto-submit",
    start: startAssessmentAutoSubmitJob,
    stop: stopAssessmentAutoSubmitJob,
  },
  {
    name: "Interview slot expiry",
    start: startInterviewSlotExpiryJob,
    stop: stopInterviewSlotExpiryJob,
  },
  {
    name: "Invoice generation",
    start: startInvoiceGenerationWorker,
    stop: stopInvoiceGenerationWorker,
  },
];

export async function startBackgroundJobs(): Promise<void> {
  for (const job of JOBS) {
    try {
      await job.start();
      logger.info(`${job.name} job scheduled`);
    } catch (error) {
      logger.error(
        { error },
        `Failed to schedule ${job.name} job — continuing startup`,
      );
    }
  }
}

export async function stopBackgroundJobs(): Promise<void> {
  for (const job of JOBS) {
    await job.stop();
  }
}
