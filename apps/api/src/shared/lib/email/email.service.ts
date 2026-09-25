import { SendEmailCommand, SESv2ServiceException } from "@aws-sdk/client-sesv2";
import { z } from "zod";
import { env } from "@/shared/config/env";
import { ValidationError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { getSesClient, isSesReady } from "@/shared/lib/ses";
import { EmailDeliveryError } from "./email.errors";
import type { SendEmailInput, SendEmailResult } from "./email.types";
import { htmlToText, maskEmail, sanitizeDisplayName } from "./email.utils";

const SEND_TIMEOUT_MS = 10_000;
const MAX_RECIPIENTS = 50;
const TAG_PATTERN = /^[A-Za-z0-9_.-]{1,256}$/;

// SES errors that will not succeed on retry without a config/content change.
const PERMANENT_SES_ERRORS = new Set([
  "MessageRejected",
  "MailFromDomainNotVerifiedException",
  "AccountSuspendedException",
  "SendingPausedException",
  "NotFoundException",
  "BadRequestException",
]);

const addressList = z
  .union([z.string().email(), z.array(z.string().email()).min(1)])
  .transform((value) => (Array.isArray(value) ? value : [value]));

const sendEmailSchema = z
  .object({
    to: addressList,
    cc: addressList.optional(),
    bcc: addressList.optional(),
    // No CR/LF: prevents header injection through the subject line.
    subject: z
      .string()
      .trim()
      .min(1)
      .max(998)
      .refine((v) => !/[\r\n]/.test(v), "Subject must be a single line"),
    html: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
    replyTo: addressList.optional(),
    tags: z
      .record(z.string(), z.string())
      .optional()
      .refine(
        (tags) =>
          !tags ||
          Object.entries(tags).every(
            ([k, v]) => TAG_PATTERN.test(k) && TAG_PATTERN.test(v),
          ),
        "Tag keys and values may only contain letters, numbers, _, - and .",
      ),
  })
  .refine((v) => v.html || v.text, "Either html or text is required")
  .refine(
    (v) =>
      v.to.length + (v.cc?.length ?? 0) + (v.bcc?.length ?? 0) <=
      MAX_RECIPIENTS,
    `A message can have at most ${MAX_RECIPIENTS} recipients`,
  );

function buildFromAddress(): string {
  return `"${sanitizeDisplayName(env.SES_FROM_NAME)}" <${env.SES_FROM_EMAIL}>`;
}

export class EmailService {
  static isConfigured(): boolean {
    return isSesReady();
  }

  /**
   * Send a single transactional email through Amazon SES.
   *
   * - Not configured + non-production: logs and returns `skipped`.
   * - Not configured + production: throws (a silent no-op would hide lost
   *   OTP / invite emails).
   * - Throws `ValidationError` for bad input and `EmailDeliveryError` for SES
   *   failures (check `retryable` before re-queuing).
   */
  static async send(input: SendEmailInput): Promise<SendEmailResult> {
    const parsed = sendEmailSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        `Invalid email: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
      );
    }
    const mail = parsed.data;
    const logContext = {
      to: mail.to.map(maskEmail),
      subject: mail.subject,
      tags: mail.tags,
    };

    if (!isSesReady()) {
      if (env.NODE_ENV === "production") {
        throw new EmailDeliveryError(
          "Email service is not configured",
          false,
          "NotConfigured",
        );
      }
      logger.warn(logContext, "SES not configured — email skipped");
      return { status: "skipped", reason: "ses_not_configured" };
    }

    const replyTo =
      mail.replyTo ??
      (env.SES_REPLY_TO_EMAIL ? [env.SES_REPLY_TO_EMAIL] : undefined);

    const command = new SendEmailCommand({
      FromEmailAddress: buildFromAddress(),
      Destination: {
        ToAddresses: mail.to,
        CcAddresses: mail.cc,
        BccAddresses: mail.bcc,
      },
      ReplyToAddresses: replyTo,
      ConfigurationSetName: env.SES_CONFIGURATION_SET || undefined,
      EmailTags: mail.tags
        ? Object.entries(mail.tags).map(([Name, Value]) => ({ Name, Value }))
        : undefined,
      Content: {
        Simple: {
          Subject: { Data: mail.subject, Charset: "UTF-8" },
          Body: {
            ...(mail.html && { Html: { Data: mail.html, Charset: "UTF-8" } }),
            Text: {
              Data: mail.text ?? htmlToText(mail.html ?? ""),
              Charset: "UTF-8",
            },
          },
        },
      },
    });

    try {
      const response = await getSesClient().send(command, {
        abortSignal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
      const messageId = response.MessageId ?? "";
      logger.info({ ...logContext, messageId }, "Email sent via SES");
      return { status: "sent", messageId };
    } catch (error) {
      const name = error instanceof Error ? error.name : "UnknownError";
      const retryable =
        !(error instanceof SESv2ServiceException) ||
        !PERMANENT_SES_ERRORS.has(name);
      logger.error(
        { ...logContext, sesError: name, retryable, err: error },
        "SES send failed",
      );
      throw new EmailDeliveryError("Failed to send email", retryable, name);
    }
  }
}
