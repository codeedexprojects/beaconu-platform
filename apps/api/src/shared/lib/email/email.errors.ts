import { AppError } from "@/shared/errors";
import { ErrorCode } from "@/shared/responses/error-codes";

/**
 * Delivery to SES failed. `retryable` tells callers (e.g. a queue worker)
 * whether the same message can succeed later without changes.
 */
export class EmailDeliveryError extends AppError {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly sesErrorName?: string,
  ) {
    super(message, 503, ErrorCode.SERVICE_UNAVAILABLE);
  }
}
