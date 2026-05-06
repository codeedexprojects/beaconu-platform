import { AppError } from './app-error';
import { ErrorCode } from '../responses/error-codes';

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }
}
