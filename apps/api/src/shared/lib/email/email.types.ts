export interface SendEmailInput {
  /** One address or a list. SES allows at most 50 recipients per message. */
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  /** Plain-text alternative. Derived from `html` when omitted. */
  text?: string;
  replyTo?: string | string[];
  /**
   * SES message tags for reporting/event filtering. Keys and values may only
   * contain letters, numbers, `_`, `-` and `.` (max 256 chars).
   */
  tags?: Record<string, string>;
}

export type SendEmailResult =
  | { status: "sent"; messageId: string }
  | { status: "skipped"; reason: "ses_not_configured" };
