import { AppError } from "./app-error";
import { ErrorCode } from "../responses/error-codes";

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 422, ErrorCode.VALIDATION_ERROR);
  }
}
