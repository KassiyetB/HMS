import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllBills, getBillById, getBillStats,
  createBill, updateBill, deleteBill,
} from '../controllers/billController'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()
router.use(verifyToken)

// Шоттар/Кіріс: тек Регистратор және Әкімші
const ALLOWED     = ['Әкімші', 'Регистратор']
const ADMIN_ONLY  = ['Әкімші']

const billRules = [
  body('patient')  .trim().notEmpty().withMessage('Науқастың аты-жөні міндетті'),
  body('service')  .trim().notEmpty().withMessage('Қызмет түрі міндетті'),
  body('amount')   .isFloat({ min: 0 }).withMessage('Сома дұрыс болуы керек'),
  body('bill_date').optional().isDate(),
  body('status')   .optional().isIn(['Төленді','Күтуде','Мерзімі өткен']),
]
const updateRules = billRules.map(r => r.optional())

router.get   ('/',       requireRole(...ALLOWED),    getAllBills)
router.get   ('/stats',  requireRole(...ALLOWED),    getBillStats)
router.get   ('/:id',    requireRole(...ALLOWED),    getBillById)
router.post  ('/',       requireRole(...ALLOWED),    billRules,   createBill)
router.put   ('/:id',    requireRole(...ALLOWED),    updateRules, updateBill)
router.delete('/:id',    requireRole(...ADMIN_ONLY), deleteBill)

export default router
