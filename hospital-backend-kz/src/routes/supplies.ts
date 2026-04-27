import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllSupplies, getSupplyById, getSupplyStats, getLowStockSupplies,
  createSupply, updateSupply, updateStock, deleteSupply,
} from '../controllers/supplyController'

const router = Router()

const supplyRules = [
  body('name').trim().notEmpty().withMessage('Атауы міндетті'),
  body('category').trim().notEmpty().withMessage('Санаты міндетті'),
  body('stock').isInt({ min: 0 }).withMessage('Қойма мөлшері дұрыс болуы керек'),
  body('reorder').isInt({ min: 1 }).withMessage('Тапсырыс шегі дұрыс болуы керек'),
  body('unit').trim().notEmpty().withMessage('Өлшем бірлігі міндетті'),
  body('cost').isFloat({ min: 0 }).withMessage('Баға дұрыс болуы керек'),
  body('expiry').trim().notEmpty().withMessage('Жарамдылық мерзімі міндетті'),
]

const updateRules = supplyRules.map(r => r.optional())

router.get   ('/',             getAllSupplies)                    // GET    /api/supplies
router.get   ('/stats',        getSupplyStats)                   // GET    /api/supplies/stats
router.get   ('/low-stock',    getLowStockSupplies)              // GET    /api/supplies/low-stock
router.get   ('/:id',          getSupplyById)                    // GET    /api/supplies/Д-001
router.post  ('/',             supplyRules,  createSupply)        // POST   /api/supplies
router.put   ('/:id',          updateRules,  updateSupply)        // PUT    /api/supplies/Д-001
router.patch ('/:id/stock',    updateStock)                      // PATCH  /api/supplies/Д-001/stock
router.delete('/:id',          deleteSupply)                     // DELETE /api/supplies/Д-001

export default router
