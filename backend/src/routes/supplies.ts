import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllSupplies, getSupplyById, getSupplyStats,
  getLowStockSupplies, createSupply, updateSupply,
  updateStock, deleteSupply,
} from '../controllers/supplyController'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()
router.use(verifyToken)

// Дәрі-дәрмектер: Зертханашы, Фармацевт, Әкімші
const READ       = ['Әкімші', 'Зертханашы', 'Фармацевт']
const WRITE      = ['Әкімші', 'Фармацевт']
const ADMIN_ONLY = ['Әкімші']

const supplyRules = [
  body('name')   .trim().notEmpty().withMessage('Атауы міндетті'),
  body('category').trim().notEmpty().withMessage('Санаты міндетті'),
  body('stock')  .isInt({ min: 0 }).withMessage('Қойма мөлшері дұрыс болуы керек'),
  body('reorder').isInt({ min: 1 }).withMessage('Тапсырыс шегі дұрыс болуы керек'),
  body('unit')   .trim().notEmpty().withMessage('Өлшем бірлігі міндетті'),
  body('cost')   .isFloat({ min: 0 }).withMessage('Баға дұрыс болуы керек'),
  body('expiry') .trim().notEmpty().withMessage('Жарамдылық мерзімі міндетті'),
]
const updateRules = supplyRules.map(r => r.optional())

router.get   ('/',           requireRole(...READ),       getAllSupplies)
router.get   ('/stats',      requireRole(...READ),       getSupplyStats)
router.get   ('/low-stock',  requireRole(...READ),       getLowStockSupplies)
router.get   ('/:id',        requireRole(...READ),       getSupplyById)
router.post  ('/',           requireRole(...WRITE),      supplyRules,  createSupply)
router.put   ('/:id',        requireRole(...WRITE),      updateRules,  updateSupply)
router.patch ('/:id/stock',  requireRole(...READ),       updateStock)
router.delete('/:id',        requireRole(...ADMIN_ONLY), deleteSupply)

export default router
