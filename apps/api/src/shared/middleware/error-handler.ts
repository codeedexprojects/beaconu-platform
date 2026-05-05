import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/shared/errors'
import { logger } from '@/shared/lib/logger'

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    logger.warn({
      requestId: req.requestId,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    })

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    })
    return
  }

  logger.error(
    {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack,
    },
    'Unhandled error',
  )

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}
