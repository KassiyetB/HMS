import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool'
import { AppError } from '../middleware/errorHandler'
import { LoginDTO, JwtPayload, ROLE_PERMISSIONS } from '../types'

// ── Helper: resolve allowed routes for a user ─────
// If user has custom allowed_routes → use those
// Otherwise → fall back to role defaults
function resolveAllowedRoutes(role: string, customRoutes: string[] | null): string[] {
  if (customRoutes && customRoutes.length > 0) return customRoutes
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([, roles]) => roles.includes(role))
    .map(([route]) => route)
}

// ── POST /api/auth/login ──────────────────────────
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const { email, password }: LoginDTO = req.body

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 AND is_active = true`,
      [email.toLowerCase().trim()]
    )

    if (!result.rows.length) throw new AppError('Email немесе құпия сөз қате', 401)

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError('Email немесе құпия сөз қате', 401)

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET анықталмаған')

    const allowedRoutes = resolveAllowedRoutes(user.role, user.allowed_routes)

    const payload: JwtPayload = {
      id:             user.id,
      email:          user.email,
      name:           user.name,
      role:           user.role,
      staff_id:       user.staff_id,
      allowed_routes: user.allowed_routes,
    }

    const token = jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn'],
    })

    res.json({
      success: true,
      token,
      user: {
        id:            user.id,
        email:         user.email,
        name:          user.name,
        role:          user.role,
        staff_id:      user.staff_id,
        allowedRoutes,
      },
      message: `Қош келдіңіз, ${user.name}!`,
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/me ──────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Авторизацияланбаған', 401)

    const result = await pool.query(
      `SELECT id, email, name, role, staff_id, is_active, allowed_routes, created_at FROM users WHERE id = $1`,
      [req.user.id]
    )

    if (!result.rows.length) throw new AppError('Пайдаланушы табылмады', 404)

    const user = result.rows[0]
    const allowedRoutes = resolveAllowedRoutes(user.role, user.allowed_routes)

    res.json({ success: true, user: { ...user, allowedRoutes } })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/change-password ────────────────
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Авторизацияланбаған', 401)

    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) throw new AppError('Ескі және жаңа құпия сөздер міндетті', 400)
    if (newPassword.length < 6) throw new AppError('Жаңа құпия сөз кемінде 6 таңба болуы керек', 400)

    const result = await pool.query(`SELECT password FROM users WHERE id = $1`, [req.user.id])
    if (!result.rows.length) throw new AppError('Пайдаланушы табылмады', 404)

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password)
    if (!isMatch) throw new AppError('Ескі құпия сөз қате', 401)

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, req.user.id])

    res.json({ success: true, message: 'Құпия сөз сәтті өзгертілді' })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/auth/users/:id/permissions ─────────
// Only Әкімші can call this
export async function updateUserPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Авторизацияланбаған', 401)
    if (req.user.role !== 'Әкімші') throw new AppError('Тек Әкімші рұқсаттарды өзгерте алады', 403)

    const userId = Number(req.params.id)
    const { allowed_routes } = req.body

    // allowed_routes: string[] | null
    // null = reset to role default
    // [] or string[] = set custom
    if (allowed_routes !== null && !Array.isArray(allowed_routes)) {
      throw new AppError('allowed_routes массив немесе null болуы керек', 400)
    }

    const ALL_ROUTES = ['/dashboard', '/patients', '/staff', '/revenue', '/supplies']
    if (Array.isArray(allowed_routes)) {
      const invalid = allowed_routes.filter((r: string) => !ALL_ROUTES.includes(r))
      if (invalid.length) throw new AppError(`Жарамсыз маршруттар: ${invalid.join(', ')}`, 400)
    }

    const result = await pool.query(
      `UPDATE users SET allowed_routes = $1 WHERE id = $2
       RETURNING id, email, name, role, staff_id, allowed_routes`,
      [allowed_routes, userId]
    )

    if (!result.rows.length) throw new AppError('Пайдаланушы табылмады', 404)

    const user = result.rows[0]
    const resolvedRoutes = resolveAllowedRoutes(user.role, user.allowed_routes)

    res.json({
      success: true,
      data: { ...user, allowedRoutes: resolvedRoutes },
      message: allowed_routes === null
        ? 'Рұқсаттар рөлдің әдепкі мәніне қайтарылды'
        : 'Рұқсаттар жаңартылды',
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/users — list all users (admin only)
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Авторизацияланбаған', 401)
    if (req.user.role !== 'Әкімші') throw new AppError('Рұқсат жоқ', 403)

    const result = await pool.query(
      `SELECT id, email, name, role, staff_id, is_active, allowed_routes, created_at
       FROM users ORDER BY id ASC`
    )

    const users = result.rows.map(u => ({
      ...u,
      allowedRoutes: resolveAllowedRoutes(u.role, u.allowed_routes),
    }))

    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
}
