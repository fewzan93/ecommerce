import express from 'express'
import {
  checkout,
  getOrderById,
  getOrderBySession,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  stripeWebhook,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/webhook', stripeWebhook)

router.use(protect)
router.post('/checkout', checkout)
router.get('/my-orders', getMyOrders)
router.get('/session/:sessionId', getOrderBySession)
router.get('/:id', getOrderById)

router.use(adminOnly)
router.get('/', getAllOrders)
router.put('/:id/status', updateOrderStatus)

export default router