import { Request, Response, NextFunction } from "express";
import { ApiError } from "../responses/api-error";
import { ErrorCode } from "../responses/error-codes";
import { logger } from "@/shared/logger";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "node_modules/@beaconu/db/generated/client/internal/prismaNamespace";
import getPrismaErrorMessage from "../utils/getPrismaErrorMessage";

/**
 * Global Error Handler Middleware
 * Standardizes all errors into the enterprise response format.
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle Prisma Errors
  if (error instanceof PrismaClientKnownRequestError) {
    const userMessage = getPrismaErrorMessage(error.code);
    res.status(400).json({ message: userMessage });
    return;
  }

  // Handle Custom ApiError
  if (error instanceof ApiError) {
    logger.warn({
      requestId: req.requestId,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    });

    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle Zod Validation Errors
  if (error instanceof z.ZodError) {
    const details = error.issues.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    const apiError = new ApiError(
      400,
      "Validation failed",
      ErrorCode.VALIDATION_ERROR,
      details,
    );

    res.status(400).json(apiError.toJSON());
    return;
  }

  // Handle Generic Errors
  logger.error(
    {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack,
    },
    "Unhandled error",
  );

  const internalError = new ApiError(
    500,
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : error.message,
    ErrorCode.INTERNAL_SERVER_ERROR,
  );

  res.status(500).json(internalError.toJSON());
}
