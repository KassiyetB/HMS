import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
} from '../controllers/staffController'

const router = Router()

// ── Validation rules ──────────────────────────────
const staffRules = [
  body('name')       .trim().notEmpty().withMessage('Name is required'),
  body('role')       .isIn(['Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Pharmacist']).withMessage('Invalid role'),
  body('specialty')  .optional().trim(),
  body('status')     .optional().isIn(['On Duty', 'Off Duty', 'On Leave']).withMessage('Invalid status'),
  body('experience') .trim().notEmpty().withMessage('Experience is required'),
  body('rating')     .isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('phone')      .trim().notEmpty().withMessage('Phone is required'),
  body('email')      .isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('patients')   .optional().isInt({ min: 0 }),
]

const updateRules = staffRules.map(rule => rule.optional())

// ── Routes ────────────────────────────────────────
router.get   ('/',      getAllStaff)               // GET    /api/staff
router.get   ('/stats', getStaffStats)             // GET    /api/staff/stats
router.get   ('/:id',   getStaffById)              // GET    /api/staff/S-001
router.post  ('/',      staffRules,  createStaff)  // POST   /api/staff
router.put   ('/:id',   updateRules, updateStaff)  // PUT    /api/staff/S-001
router.delete('/:id',   deleteStaff)               // DELETE /api/staff/S-001

export default router
