import { PaginationMeta } from "./pagination";
import { ErrorCode } from "./error-codes";

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
