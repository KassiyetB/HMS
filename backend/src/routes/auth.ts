import { Router } from 'express'
import { body } from 'express-validator'
import {
  login, getMe, changePassword,
  updateUserPermissions, getAllUsers,
} from '../controllers/authController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().withMessage('Email дұрыс емес').normalizeEmail(),
    body('password').notEmpty().withMessage('Құпия сөз міндетті'),
  ],
  login
)

// GET /api/auth/me
router.get('/me', verifyToken, getMe)

// POST /api/auth/change-password
router.post('/change-password', verifyToken, changePassword)

// GET /api/auth/users  — тек Әкімші
router.get('/users', verifyToken, getAllUsers)

// PATCH /api/auth/users/:id/permissions  — тек Әкімші
router.patch('/users/:id/permissions', verifyToken, updateUserPermissions)

export default router
