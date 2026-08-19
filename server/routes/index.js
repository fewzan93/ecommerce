import express from 'express'
import authRoutes from './authRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import productRoutes from './productRoutes.js'
import couponRoutes from './couponRoutes.js'
import orderRoutes from './orderRoutes.js'
import adminRoutes from './adminRoutes.js'

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/coupons', couponRoutes)
router.use('/orders', orderRoutes)
router.use('/admin', adminRoutes)

export default router