import { ErrorCode } from './error-codes';

/**
 * Enterprise-grade custom error class for BeaconU.
 * Allows passing standardized error codes and detailed metadata.
 */
export class ApiError extends Error {
  public readonly success: boolean = false;
  public readonly timestamp: string;

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    public readonly details: unknown[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Helper to format error for JSON response
   */
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      error: {
        code: this.code,
        details: this.details,
      },
      timestamp: this.timestamp,
    };
  }
}
