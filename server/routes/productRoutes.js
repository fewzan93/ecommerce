import express from 'express'
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/related/:id', getRelatedProducts)
router.get('/:slug', getProductBySlug)

router.post('/:id/reviews', protect, createReview)

router.use(protect, adminOnly)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router