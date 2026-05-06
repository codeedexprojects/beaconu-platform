import { AppError } from './app-error';
import { ErrorCode } from '../responses/error-codes';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, ErrorCode.INVALID_INPUT);
  }
}
