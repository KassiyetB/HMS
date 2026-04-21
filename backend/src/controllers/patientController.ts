import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import pool from '../db/pool'
import { AppError } from '../middleware/errorHandler'
import { CreatePatientDTO, UpdatePatientDTO, PatientQuery } from '../types'

// ── Helper: generate patient_id ───────────────────
async function generatePatientId(): Promise<string> {
  const result = await pool.query(`SELECT MAX(CAST(SUBSTRING(patient_id FROM 3) AS INTEGER)) AS max_num FROM patients`)
  const maxNum = result.rows[0].max_num ?? 0
  return `P-${String(maxNum + 1).padStart(3, '0')}`
}

// ── GET /api/patients ─────────────────────────────
export async function getAllPatients(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status, doctor, ward, page = '1', limit = '20' } = req.query as PatientQuery

    const offset     = (Number(page) - 1) * Number(limit)
    const conditions: string[] = []
    const values:     unknown[] = []
    let   idx = 1

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR patient_id ILIKE $${idx} OR condition ILIKE $${idx})`)
      values.push(`%${search}%`)
      idx++
    }
    if (status)  { conditions.push(`status = $${idx++}`);  values.push(status) }
    if (doctor)  { conditions.push(`doctor = $${idx++}`);  values.push(doctor) }
    if (ward)    { conditions.push(`ward   = $${idx++}`);  values.push(ward) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM patients ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, Number(limit), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM patients ${where}`, values),
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

// ── GET /api/patients/:id ─────────────────────────
export async function getPatientById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `SELECT * FROM patients WHERE patient_id = $1`,
      [req.params.id]
    )
    if (!result.rows.length) throw new AppError('Patient not found', 404)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/patients ────────────────────────────
export async function createPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const body: CreatePatientDTO = req.body
    const patient_id = await generatePatientId()

    const result = await pool.query(
      `INSERT INTO patients
         (patient_id, name, age, gender, blood, condition, doctor, status, ward, phone, admit_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        patient_id,
        body.name,
        body.age,
        body.gender,
        body.blood,
        body.condition,
        body.doctor,
        body.status     ?? 'Stable',
        body.ward       ?? 'General',
        body.phone,
        body.admit_date ?? new Date().toISOString().slice(0, 10),
        body.notes      ?? null,
      ]
    )

    res.status(201).json({ success: true, data: result.rows[0], message: 'Patient created' })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/patients/:id ─────────────────────────
export async function updatePatient(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const body: UpdatePatientDTO = req.body
    const fields = Object.keys(body)
    if (!fields.length) throw new AppError('No fields provided', 400)

    // Build SET clause dynamically — only update provided fields
    const setClauses = fields.map((key, i) => `${key} = $${i + 1}`)
    const values     = fields.map(key => (body as Record<string, unknown>)[key])

    const result = await pool.query(
      `UPDATE patients SET ${setClauses.join(', ')} WHERE patient_id = $${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    )

    if (!result.rows.length) throw new AppError('Patient not found', 404)
    res.json({ success: true, data: result.rows[0], message: 'Patient updated' })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/patients/:id ──────────────────────
export async function deletePatient(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `DELETE FROM patients WHERE patient_id = $1 RETURNING patient_id, name`,
      [req.params.id]
    )
    if (!result.rows.length) throw new AppError('Patient not found', 404)
    res.json({ success: true, message: `Patient ${result.rows[0].name} deleted` })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/patients/stats ───────────────────────
export async function getPatientStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                            AS total,
        COUNT(*) FILTER (WHERE status = 'Critical')        AS critical,
        COUNT(*) FILTER (WHERE status = 'Stable')          AS stable,
        COUNT(*) FILTER (WHERE status = 'Recovering')      AS recovering,
        COUNT(*) FILTER (WHERE status = 'Post-Op')         AS post_op,
        COUNT(*) FILTER (WHERE status = 'Discharged')      AS discharged
      FROM patients
    `)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}
