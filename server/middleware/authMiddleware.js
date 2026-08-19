import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — please log in')
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Session expired — please log in again')
  }

  const user = await User.findById(decoded.id)
  if (!user) throw new ApiError(401, 'User no longer exists')
  if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked')

  req.user = user
  next()
})

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Admin access required')
  }
  next()
}