import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message    = err.message || 'Internal server error'

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${message}`)

  res.status(statusCode).json({
    success: false,
    error:   message,
  })
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('Route not found', 404))
}
