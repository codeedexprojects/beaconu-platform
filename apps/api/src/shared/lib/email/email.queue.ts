import { Queue, UnrecoverableError, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { EmailService } from "./email.service";
import { EmailDeliveryError } from "./email.errors";
import {
  EMAIL_TEMPLATES,
  type EmailTemplateData,
  type EmailTemplateName,
} from "./templates";

const QUEUE_NAME = "email-delivery";
const MAX_ATTEMPTS = 5;
// Stay well under the default SES sending rate (14/s) even with bursts.
const RATE_LIMIT = { max: 10, duration: 1000 };

interface EmailJob<T extends EmailTemplateName = EmailTemplateName> {
  template: T;
  to: string;
  data: EmailTemplateData[T];
  tags?: Record<string, string>;
}

let queue: Queue<EmailJob> | null = null;
let worker: Worker<EmailJob> | null = null;

export async function startEmailWorker(): Promise<void> {
  queue = createQueue(QUEUE_NAME) as Queue<EmailJob>;

  worker = createWorker<EmailJob>(
    QUEUE_NAME,
    async (job) => {
      const { template, to, data, tags } = job.data;
      const definition = EMAIL_TEMPLATES[template] as {
        subject: (d: unknown) => string;
        html: (d: unknown) => string;
      };

      try {
        await EmailService.send({
          to,
          subject: definition.subject(data),
          html: definition.html(data),
          tags: { template, ...tags },
        });
      } catch (error) {
        // Retrying a message SES will always reject only delays the failure.
        if (error instanceof EmailDeliveryError && !error.retryable) {
          throw new UnrecoverableError(error.message);
        }
        throw error;
      }
    },
    { concurrency: 5, limiter: RATE_LIMIT },
  );
}

export async function stopEmailWorker(): Promise<void> {
  await worker?.close();
  await queue?.close();
  worker = null;
  queue = null;
}

/**
 * Queue a templated email. Delivery happens in the background with retries,
 * so callers are never blocked by (or fail on) an SES outage.
 *
 * Throws only if the job could not be enqueued (Redis down / queue not
 * started). Callers decide whether that is fatal — e.g. a password-reset
 * request should surface it, an informational email should just log.
 */
export async function enqueueEmail<T extends EmailTemplateName>(
  template: T,
  to: string,
  data: EmailTemplateData[T],
  tags?: Record<string, string>,
): Promise<void> {
  if (!queue) {
    throw new Error("Email queue is not initialized");
  }
  await queue.add(template, { template, to, data, tags } as EmailJob, {
    attempts: MAX_ATTEMPTS,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: true,
    // Payloads can contain one-time links, so failed jobs are short-lived.
    removeOnFail: { age: 24 * 60 * 60 },
  });
  logger.debug({ template }, "Email enqueued");
}

/** Like `enqueueEmail`, but logs instead of throwing. For non-critical mail. */
export async function enqueueEmailSafe<T extends EmailTemplateName>(
  template: T,
  to: string,
  data: EmailTemplateData[T],
  tags?: Record<string, string>,
): Promise<void> {
  try {
    await enqueueEmail(template, to, data, tags);
  } catch (error) {
    logger.error({ err: error, template }, "Failed to enqueue email");
  }
}
