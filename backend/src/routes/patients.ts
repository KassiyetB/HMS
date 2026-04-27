import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllPatients, getPatientById, createPatient,
  updatePatient, deletePatient, getPatientStats,
} from '../controllers/patientController'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()
router.use(verifyToken)

// Науқастар: Әкімші, Дәрігер, Мейіргер, Регистратор
const READ   = ['Әкімші', 'Дәрігер', 'Мейіргер', 'Регистратор']
const WRITE  = ['Әкімші', 'Дәрігер', 'Регистратор']
const DELETE_ROLES = ['Әкімші']

const patientRules = [
  body('name')      .trim().notEmpty().withMessage('Аты-жөні міндетті'),
  body('age')       .isInt({ min: 1, max: 130 }).withMessage('Жас 1-130 аралығында болуы керек'),
  body('gender')    .trim().notEmpty().withMessage('Жынысы міндетті'),
  body('blood')     .trim().notEmpty().withMessage('Қан тобы міндетті'),
  body('condition') .trim().notEmpty().withMessage('Диагноз міндетті'),
  body('doctor')    .trim().notEmpty().withMessage('Дәрігер міндетті'),
  body('phone')     .trim().notEmpty().withMessage('Телефон міндетті'),
  body('status')    .optional().isString(),
  body('ward')      .optional().isString(),
  body('admit_date').optional().isDate(),
  body('notes')     .optional().trim(),
]
const updateRules = patientRules.map(r => r.optional())

router.get   ('/',       requireRole(...READ),         getAllPatients)
router.get   ('/stats',  requireRole(...READ),         getPatientStats)
router.get   ('/:id',    requireRole(...READ),         getPatientById)
router.post  ('/',       requireRole(...WRITE),        patientRules, createPatient)
router.put   ('/:id',    requireRole(...WRITE),        updateRules,  updatePatient)
router.delete('/:id',    requireRole(...DELETE_ROLES), deletePatient)

export default router
