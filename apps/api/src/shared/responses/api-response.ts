import { PaginationMeta } from "./pagination";
import { ErrorCode } from "./error-codes";

/**
 * Standardized Response Structure for BeaconU API
 */
export interface StandardResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | unknown;
  error?: {
    code: string;
    details: unknown[];
  };
  timestamp: string;
}

export class ApiResponse {
  /**
   * Success Response Helper
   */
  static success<T>(
    message: string,
    data: T,
    meta?: PaginationMeta | unknown,
  ): StandardResponse<T> {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error Response Helper (mostly used by centralized error handler)
   */
  static error(
    message: string,
    code: ErrorCode,
    details: unknown[] = [],
  ): StandardResponse<null> {
    return {
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
