import { AppError } from "./app-error";
import { ErrorCode } from "../responses/error-codes";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}
