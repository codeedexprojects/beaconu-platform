import { ApiError } from '../responses/api-error';
import { ErrorCode } from '../responses/error-codes';

export class AppError extends ApiError {
  constructor(message: string, statusCode: number, code: ErrorCode) {
    super(statusCode, message, code);
  }
}
