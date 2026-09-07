import { AppError } from "./app-error";
import { ErrorCode } from "../responses/error-codes";

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(message, 429, ErrorCode.RATE_LIMITED);
  }
}
