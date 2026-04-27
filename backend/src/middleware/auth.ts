import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'
import { AppError } from './errorHandler'

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// ── Verify JWT ────────────────────────────────────
export function verifyToken(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Авторизация токені жоқ', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const secret  = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET анықталмаған')

    const decoded = jwt.verify(token, secret) as JwtPayload
    req.user = decoded
    next()
  } catch {
    next(new AppError('Токен жарамсыз немесе мерзімі өткен', 401))
  }
}

// ── Require specific roles ────────────────────────
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Авторизацияланбаған', 401))

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Рұқсат жоқ. Қажетті рөл: ${roles.join(', ')}`, 403))
    }

    next()
  }
}
