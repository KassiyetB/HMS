import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import pool from '../db/pool'
import { AppError } from '../middleware/errorHandler'
import { CreateSupplyDTO, UpdateSupplyDTO, SupplyQuery } from '../types'

async function generateSupplyId(): Promise<string> {
  const result = await pool.query(`SELECT MAX(CAST(SUBSTRING(supply_id FROM 3) AS INTEGER)) AS max_num FROM supplies`)
  const maxNum = result.rows[0].max_num ?? 0
  return `Д-${String(maxNum + 1).padStart(3, '0')}`
}

// GET /api/supplies
export async function getAllSupplies(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, category, page = '1', limit = '50' } = req.query as SupplyQuery
    const offset = (Number(page) - 1) * Number(limit)
    const conditions: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR supply_id ILIKE $${idx} OR category ILIKE $${idx})`)
      values.push(`%${search}%`); idx++
    }
    if (category) { conditions.push(`category = $${idx++}`); values.push(category) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [dataResult, countResult] = await Promise.all([
      pool.query(`SELECT * FROM supplies ${where} ORDER BY name ASC LIMIT $${idx} OFFSET $${idx + 1}`, [...values, Number(limit), offset]),
      pool.query(`SELECT COUNT(*) FROM supplies ${where}`, values),
    ])

    res.json({ success: true, data: dataResult.rows, total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
}

// GET /api/supplies/stats
export async function getSupplyStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE stock = 0)                AS out_of_stock,
        COUNT(*) FILTER (WHERE stock > 0 AND stock < reorder) AS low_stock,
        COUNT(*) FILTER (WHERE stock >= reorder)         AS sufficient,
        COALESCE(SUM(stock * cost), 0)                   AS total_value
      FROM supplies
    `)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) { next(err) }
}

// GET /api/supplies/low-stock
export async function getLowStockSupplies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`SELECT * FROM supplies WHERE stock < reorder ORDER BY stock ASC`)
    res.json({ success: true, data: result.rows, total: result.rowCount })
  } catch (err) { next(err) }
}

// GET /api/supplies/:id
export async function getSupplyById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`SELECT * FROM supplies WHERE supply_id = $1`, [req.params.id])
    if (!result.rows.length) throw new AppError('Дәрі-дәрмек табылмады', 404)
    res.json({ success: true, data: result.rows[0] })
  } catch (err) { next(err) }
}

// POST /api/supplies
export async function createSupply(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return }

    const body: CreateSupplyDTO = req.body
    const supply_id = await generateSupplyId()

    const result = await pool.query(
      `INSERT INTO supplies (supply_id, name, category, stock, reorder, unit, cost, expiry)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [supply_id, body.name, body.category, body.stock, body.reorder, body.unit, body.cost, body.expiry]
    )

    res.status(201).json({ success: true, data: result.rows[0], message: `${body.name} қосылды` })
  } catch (err) { next(err) }
}

// PUT /api/supplies/:id
export async function updateSupply(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return }

    const body: UpdateSupplyDTO = req.body
    const fields = Object.keys(body)
    if (!fields.length) throw new AppError('Өрістер берілмеді', 400)

    const setClauses = fields.map((key, i) => `${key} = $${i + 1}`)
    const values     = fields.map(key => (body as Record<string, unknown>)[key])

    const result = await pool.query(
      `UPDATE supplies SET ${setClauses.join(', ')} WHERE supply_id = $${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    )

    if (!result.rows.length) throw new AppError('Дәрі-дәрмек табылмады', 404)
    res.json({ success: true, data: result.rows[0], message: 'Жаңартылды' })
  } catch (err) { next(err) }
}

// PATCH /api/supplies/:id/stock  — тек қойманы жаңарту
export async function updateStock(req: Request, res: Response, next: NextFunction) {
  try {
    const { stock } = req.body
    if (typeof stock !== 'number' || stock < 0) throw new AppError('Жарамсыз қойма мөлшері', 400)

    const result = await pool.query(
      `UPDATE supplies SET stock = $1 WHERE supply_id = $2 RETURNING *`,
      [stock, req.params.id]
    )

    if (!result.rows.length) throw new AppError('Дәрі-дәрмек табылмады', 404)
    res.json({ success: true, data: result.rows[0], message: 'Қойма жаңартылды' })
  } catch (err) { next(err) }
}

// DELETE /api/supplies/:id
export async function deleteSupply(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(`DELETE FROM supplies WHERE supply_id = $1 RETURNING supply_id, name`, [req.params.id])
    if (!result.rows.length) throw new AppError('Дәрі-дәрмек табылмады', 404)
    res.json({ success: true, message: `${result.rows[0].name} жойылды` })
  } catch (err) { next(err) }
}
