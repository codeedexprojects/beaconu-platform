import { Request, Response, NextFunction } from "express";
import { ApiError } from "../responses/api-error";
import { ErrorCode } from "../responses/error-codes";
import { logger } from "@/shared/logger";
import { z } from "zod";
import getPrismaErrorMessage from "../utils/getPrismaErrorMessage";
import { Prisma } from "@beaconu/db";

type JsonBodyParseError = SyntaxError & {
  status?: number;
  type?: string;
  body?: unknown;
};

function isJsonBodyParseError(error: Error): error is JsonBodyParseError {
  const candidate = error as JsonBodyParseError;
  return (
    error instanceof SyntaxError &&
    (candidate.status === 400 || candidate.type === "entity.parse.failed") &&
    Object.prototype.hasOwnProperty.call(candidate, "body")
  );
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isJsonBodyParseError(error)) {
    const apiError = new ApiError(
      400,
      error.message,
      ErrorCode.VALIDATION_ERROR,
      [{ path: "body", message: "Invalid JSON payload" }],
    );

    res.status(400).json(apiError.toJSON());
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const userMessage = getPrismaErrorMessage(
      error.code,
      error.meta as { field_name?: string } | undefined,
    );
    res.status(400).json({ message: userMessage });
    return;
  }

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

  if (error instanceof z.ZodError) {
    const details = error.issues.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    const apiError = new ApiError(
      400,
      details[0]?.message ?? "Validation failed",
      ErrorCode.VALIDATION_ERROR,
      details,
    );

    res.status(400).json(apiError.toJSON());
    return;
  }

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
