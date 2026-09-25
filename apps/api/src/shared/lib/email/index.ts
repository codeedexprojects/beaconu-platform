export { EmailService } from "./email.service";
export { EmailDeliveryError } from "./email.errors";
export { escapeHtml } from "./email.utils";
export {
  enqueueEmail,
  enqueueEmailSafe,
  startEmailWorker,
  stopEmailWorker,
} from "./email.queue";
export type { SendEmailInput, SendEmailResult } from "./email.types";
export type { EmailTemplateName, EmailTemplateData } from "./templates";
