export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly isOperational: boolean

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}
