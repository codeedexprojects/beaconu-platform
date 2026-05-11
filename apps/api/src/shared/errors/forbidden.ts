import { AppError } from "./app-error";
import { ErrorCode } from "../responses/error-codes";

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}
