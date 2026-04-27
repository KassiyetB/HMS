import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import pool from '../db/pool'
import { AppError } from '../middleware/errorHandler'
import { CreateBillDTO, UpdateBillDTO, BillQuery } from '../types'

async function generateBillId(): Promise<string> {
  const result = await pool.query(`SELECT MAX(CAST(SUBSTRING(bill_id FROM 3) AS INTEGER)) AS max_num FROM bills`)
  const maxNum = result.rows[0].max_num ?? 0
  return `Ш-${String(maxNum + 1).padStart(3, '0')}`
}

// GET /api/bills
export async function getAllBills(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status, page = '1', limit = '20' } = req.query as BillQuery
    const offset = (Number(page) - 1) * Number(limit)
    const conditions: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (search) {
      conditions.push(`(patient ILIKE $${idx} OR bill_id ILIKE $${idx} OR service ILIKE $${idx})`)
      values.push(`%${search}%`); idx++
    }
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [dataResult, countResult] = await Promise.all([
      pool.query(`SELECT * FROM bills ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...values, Number(limit), offset]),
      pool.query(`SELECT COUNT(*) FROM bills ${where}`, values),
    ])

    res.json({ success: true, data: dataResult.rows, total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
}

// GET /api/bills/stats
export async function getBillStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                                  AS total,
        COUNT(*)  FILTER (WHERE status = 'Төленді')              AS paid,
        COUNT(*)  FILTER (WHERE status = 'Күтуде')               AS pending,
        COUNT(*)  FILTER (WHERE status = 'Мерзімі өткен')        AS overdue,
        COALESCE(SUM(amount) FILTER (WHERE status = 'Төленді'),       0) AS total_collected,
        COALESCE(SUM(amount) FILTER (WHERE status = 'Күтуде'),         0) AS total_pending,
        COALESCE(SUM(amount) FILTER (WHERE status = 'Мерзімі өткен'),  0) AS total_overdue,
        COALESCE(SUM(amount), 0)                                  AS total_billed
      FROM bills
    `)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) { next(err) }
}

// GET /api/bills/:id
export async function getBillById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`SELECT * FROM bills WHERE bill_id = $1`, [req.params.id])
    if (!result.rows.length) throw new AppError('Шот табылмады', 404)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) { next(err) }
}

// POST /api/bills
export async function createBill(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return }

    const body: CreateBillDTO = req.body
    const bill_id = await generateBillId()

    const result = await pool.query(
      `INSERT INTO bills (bill_id, patient, service, amount, bill_date, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [bill_id, body.patient, body.service, body.amount, body.bill_date ?? new Date().toISOString().slice(0, 10), body.status ?? 'Күтуде']
    )

    res.status(201).json({ success: true, data: result.rows[0], message: 'Шот қосылды' })
  } catch (err) { next(err) }
}

// PUT /api/bills/:id
export async function updateBill(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return }

    const body: UpdateBillDTO = req.body
    const fields = Object.keys(body)
    if (!fields.length) throw new AppError('Өрістер берілмеді', 400)

    const setClauses = fields.map((key, i) => `${key} = $${i + 1}`)
    const values     = fields.map(key => (body as Record<string, unknown>)[key])

    const result = await pool.query(
      `UPDATE bills SET ${setClauses.join(', ')} WHERE bill_id = $${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    )

    if (!result.rows.length) throw new AppError('Шот табылмады', 404)
    res.json({ success: true, data: result.rows[0], message: 'Шот жаңартылды' })
  } catch (err) { next(err) }
}

// DELETE /api/bills/:id
export async function deleteBill(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`DELETE FROM bills WHERE bill_id = $1 RETURNING bill_id, patient`, [req.params.id])
    if (!result.rows.length) throw new AppError('Шот табылмады', 404)
    res.json({ success: true, message: `${result.rows[0].patient} шоты жойылды` })
  } catch (err) { next(err) }
}
