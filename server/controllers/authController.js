import crypto from 'crypto'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { signToken, setTokenCookie } from '../utils/jwt.js'
import { sendEmail } from '../utils/sendEmail.js'

const createAuthResponse = (res, user, statusCode, message) => {
  const token = signToken(user._id)
  setTokenCookie(res, token)
  res.status(statusCode).json({ success: true, message, user })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required')
  }

  const exists = await User.findOne({ email })
  if (exists) throw new ApiError(409, 'An account with this email already exists')

  const user = await User.create({ name, email, password })
  createAuthResponse(res, user, 201, 'Account created successfully')
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked. Contact support.')
  }

  createAuthResponse(res, user, 200, 'Welcome back!')
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  res.json({ success: true, message: 'Logged out successfully' })
})

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, addresses } = req.body

  const user = await User.findById(req.user._id)

  if (name !== undefined) user.name = name
  if (phone !== undefined) user.phone = phone
  if (avatar !== undefined) user.avatar = avatar
  if (addresses !== undefined) user.addresses = addresses

  await user.save()
  res.json({ success: true, message: 'Profile updated', user })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required')
  }

  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  res.clearCookie('token', { httpOnly: true })
  res.json({ success: true, message: 'Password changed — please log in again' })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) throw new ApiError(400, 'Email is required')

  const user = await User.findOne({ email })
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists for this email, a reset link has been sent',
    })
  }

  const token = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000
  await user.save()

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`
  const sent = await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    text: `You requested a password reset. Click the link to reset it (valid for 30 minutes): ${resetUrl}`,
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a> — valid for 30 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
  })

  if (!sent) {
    console.log(`[auth] Password reset link (dev fallback): ${resetUrl}`)
  }

  res.json({
    success: true,
    message: 'If an account exists for this email, a reset link has been sent',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters')
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired')

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  res.json({ success: true, message: 'Password reset successfully — please log in' })
})