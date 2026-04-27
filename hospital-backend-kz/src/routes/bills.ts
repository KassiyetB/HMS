import { Router } from 'express'
import { body } from 'express-validator'
import { getAllBills, getBillById, getBillStats, createBill, updateBill, deleteBill } from '../controllers/billController'

const router = Router()

const BILL_STATUSES = ['Төленді', 'Күтуде', 'Мерзімі өткен']

const billRules = [
  body('patient').trim().notEmpty().withMessage('Науқастың аты-жөні міндетті'),
  body('service').trim().notEmpty().withMessage('Қызмет түрі міндетті'),
  body('amount').isFloat({ min: 0 }).withMessage('Сома дұрыс болуы керек'),
  body('bill_date').optional().isDate().withMessage('Күн форматы дұрыс емес'),
  body('status').optional().isIn(BILL_STATUSES).withMessage('Жарамсыз мәртебе'),
]

const updateRules = billRules.map(r => r.optional())

router.get   ('/',        getAllBills)                   // GET    /api/bills
router.get   ('/stats',   getBillStats)                 // GET    /api/bills/stats
router.get   ('/:id',     getBillById)                  // GET    /api/bills/Ш-001
router.post  ('/',        billRules,   createBill)       // POST   /api/bills
router.put   ('/:id',     updateRules, updateBill)       // PUT    /api/bills/Ш-001
router.delete('/:id',     deleteBill)                   // DELETE /api/bills/Ш-001

export default router
