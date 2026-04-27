import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllStaff, getStaffById, createStaff,
  updateStaff, deleteStaff, getStaffStats,
} from '../controllers/staffController'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()
router.use(verifyToken)

// Қызметкерлер: тек Дәрігер және Әкімші
// Дәрігер — тек қарай алады, Әкімші — барлығын жасай алады
const READ        = ['Әкімші', 'Дәрігер']
const ADMIN_ONLY  = ['Әкімші']

const staffRules = [
  body('name')      .trim().notEmpty().withMessage('Аты-жөні міндетті'),
  body('role')      .isIn(['Дәрігер','Мейіргер','Зертханашы','Регистратор','Фармацевт']).withMessage('Жарамсыз лауазым'),
  body('specialty') .optional().trim(),
  body('status')    .optional().isIn(['Кезекте','Кезектен тыс','Демалыста']),
  body('experience').trim().notEmpty().withMessage('Тәжірибе міндетті'),
  body('rating')    .isFloat({ min: 1, max: 5 }).withMessage('Рейтинг 1-5 аралығында болуы керек'),
  body('phone')     .trim().notEmpty().withMessage('Телефон міндетті'),
  body('email')     .isEmail().withMessage('Email дұрыс емес').normalizeEmail(),
  body('patients')  .optional().isInt({ min: 0 }),
]
const updateRules = staffRules.map(r => r.optional())

router.get   ('/',       requireRole(...READ),       getAllStaff)
router.get   ('/stats',  requireRole(...READ),       getStaffStats)
router.get   ('/:id',    requireRole(...READ),       getStaffById)
router.post  ('/',       requireRole(...ADMIN_ONLY), staffRules,  createStaff)
router.put   ('/:id',    requireRole(...ADMIN_ONLY), updateRules, updateStaff)
router.delete('/:id',    requireRole(...ADMIN_ONLY), deleteStaff)

export default router
