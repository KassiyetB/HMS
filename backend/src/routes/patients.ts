import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats,
} from '../controllers/patientController'

const router = Router()

// ── Validation rules ──────────────────────────────
const patientRules = [
  body('name')       .trim().notEmpty().withMessage('Name is required'),
  body('age')        .isInt({ min: 1, max: 130 }).withMessage('Age must be between 1 and 130'),
  body('gender')     .trim().notEmpty().withMessage('Gender is required'),
  body('blood')      .trim().notEmpty().withMessage('Blood type is required'),
  body('condition')  .trim().notEmpty().withMessage('Condition is required'),
  body('doctor')     .trim().notEmpty().withMessage('Doctor is required'),
  body('phone')      .trim().notEmpty().withMessage('Phone is required'),
  body('status')     .optional().isIn(['Stable', 'Critical', 'Recovering', 'Post-Op', 'Discharged']),
  body('ward')       .optional().isIn(['General', 'Cardiology', 'Surgery', 'Pediatrics', 'ICU']),
  body('admit_date') .optional().isDate().withMessage('Invalid date format'),
  body('notes')      .optional().trim(),
]

const updateRules = patientRules.map(rule => rule.optional())

// ── Routes ────────────────────────────────────────
router.get ('/',           getAllPatients)    // GET    /api/patients
router.get ('/stats',      getPatientStats)  // GET    /api/patients/stats
router.get ('/:id',        getPatientById)   // GET    /api/patients/P-001
router.post('/',           patientRules, createPatient)  // POST   /api/patients
router.put ('/:id',        updateRules,  updatePatient)  // PUT    /api/patients/P-001
router.delete('/:id',      deletePatient)    // DELETE /api/patients/P-001

export default router
