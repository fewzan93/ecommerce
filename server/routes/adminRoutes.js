import express from 'express'
import {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getReviews,
  deleteReview,
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import { uploadImages } from '../controllers/uploadController.js'

const router = express.Router()

router.use(protect, adminOnly)
router.get('/stats', getStats)
router.post('/upload', uploadImages)
router.get('/users', getUsers)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/reviews', getReviews)
router.delete('/reviews/:id', deleteReview)

export default router