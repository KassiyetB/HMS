import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import pool from '../db/pool'
import { AppError } from '../middleware/errorHandler'
import { CreateStaffDTO, UpdateStaffDTO, StaffQuery } from '../types'

// ── Helper: generate staff_id ─────────────────────
async function generateStaffId(): Promise<string> {
  const result = await pool.query(`SELECT MAX(CAST(SUBSTRING(staff_id FROM 3) AS INTEGER)) AS max_num FROM staff`)
  const maxNum = result.rows[0].max_num ?? 0
  return `S-${String(maxNum + 1).padStart(3, '0')}`
}

// ── GET /api/staff ────────────────────────────────
export async function getAllStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, role, status, page = '1', limit = '20' } = req.query as StaffQuery

    const offset     = (Number(page) - 1) * Number(limit)
    const conditions: string[] = []
    const values:     unknown[] = []
    let   idx = 1

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR staff_id ILIKE $${idx} OR specialty ILIKE $${idx})`)
      values.push(`%${search}%`)
      idx++
    }
    if (role)   { conditions.push(`role   = $${idx++}`); values.push(role) }
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM staff ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, Number(limit), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM staff ${where}`, values),
    ])

    res.json({
      success: true,
      data:    dataResult.rows,
      total:   Number(countResult.rows[0].count),
      page:    Number(page),
      limit:   Number(limit),
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/staff/:id ────────────────────────────
export async function getStaffById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `SELECT * FROM staff WHERE staff_id = $1`,
      [req.params.id]
    )
    if (!result.rows.length) throw new AppError('Қызметкер табылмады', 404)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/staff ───────────────────────────────
export async function createStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const body: CreateStaffDTO = req.body
    const staff_id = await generateStaffId()

    const result = await pool.query(
      `INSERT INTO staff
         (staff_id, name, role, specialty, status, patients, experience, rating, phone, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        staff_id,
        body.name,
        body.role,
        body.specialty  ?? '—',
        body.status     ?? 'On Duty',
        body.patients   ?? 0,
        body.experience,
        body.rating,
        body.phone,
        body.email,
      ]
    )

    res.status(201).json({ success: true, data: result.rows[0], message: 'Қызметкер қосылды' })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/staff/:id ────────────────────────────
export async function updateStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const body: UpdateStaffDTO = req.body
    const fields = Object.keys(body)
    if (!fields.length) throw new AppError('Өрістер берілмеді', 400)

    const setClauses = fields.map((key, i) => `${key} = $${i + 1}`)
    const values     = fields.map(key => (body as Record<string, unknown>)[key])

    const result = await pool.query(
      `UPDATE staff SET ${setClauses.join(', ')} WHERE staff_id = $${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    )

    if (!result.rows.length) throw new AppError('Қызметкер табылмады', 404)
    res.json({ success: true, data: result.rows[0], message: 'Қызметкер жаңартылды' })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/staff/:id ─────────────────────────
export async function deleteStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `DELETE FROM staff WHERE staff_id = $1 RETURNING staff_id, name`,
      [req.params.id]
    )
    if (!result.rows.length) throw new AppError('Қызметкер табылмады', 404)
    res.json({ success: true, message: `${result.rows[0].name} removed` })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/staff/stats ──────────────────────────
export async function getStaffStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                            AS total,
        COUNT(*) FILTER (WHERE status = 'On Duty')         AS on_duty,
        COUNT(*) FILTER (WHERE status = 'Off Duty')        AS off_duty,
        COUNT(*) FILTER (WHERE status = 'On Leave')        AS on_leave,
        COUNT(*) FILTER (WHERE role   = 'Doctor')          AS doctors,
        COUNT(*) FILTER (WHERE role   = 'Nurse')           AS nurses,
        ROUND(AVG(rating), 2)                              AS avg_rating
      FROM staff
    `)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}
