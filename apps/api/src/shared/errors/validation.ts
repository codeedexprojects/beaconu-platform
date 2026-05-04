import { AppError } from './app-error'

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR')
  }
}
