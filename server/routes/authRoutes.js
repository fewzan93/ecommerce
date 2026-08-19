import express from 'express'
import { body, validationResult } from 'express-validator'
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    })
  }
  next()
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
)

router.post('/login', validate, login)
router.post('/logout', logout)
router.post('/forgot-password', validate, forgotPassword)
router.put('/reset-password/:token', validate, resetPassword)

router.use(protect)
router.get('/me', getMe)
router.put('/profile', validate, updateProfile)
router.put('/change-password', validate, changePassword)

export default router