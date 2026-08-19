import Coupon from '../models/Coupon.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body

  if (!code) throw new ApiError(400, 'Coupon code is required')

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  })

  if (!coupon) throw new ApiError(404, 'Invalid coupon code')
  if (coupon.expiresAt < new Date()) throw new ApiError(400, 'This coupon has expired')
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its usage limit')
  }
  if (subtotal !== undefined && subtotal < coupon.minOrder) {
    throw new ApiError(
      400,
      `Minimum order for this coupon is ${coupon.minOrder}`
    )
  }

  let discount = 0
  if (coupon.discountType === 'percent') {
    discount = (subtotal || 0) * (coupon.discountValue / 100)
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  } else {
    discount = Math.min(coupon.discountValue, subtotal || 0)
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      minOrder: coupon.minOrder,
    },
  })
})

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.json({ success: true, coupons })
})

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrder, maxDiscount, expiresAt, usageLimit } =
    req.body

  if (!code || !discountType || !discountValue || !expiresAt) {
    throw new ApiError(400, 'Code, discount type, value and expiry are required')
  }

  const exists = await Coupon.findOne({ code: code.toUpperCase().trim() })
  if (exists) throw new ApiError(409, 'This coupon code already exists')

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue,
    minOrder: minOrder || 0,
    maxDiscount: maxDiscount || null,
    expiresAt,
    usageLimit: usageLimit || null,
  })

  res.status(201).json({ success: true, message: 'Coupon created', coupon })
})

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) throw new ApiError(404, 'Coupon not found')

  const { code, discountType, discountValue, minOrder, maxDiscount, expiresAt, isActive, usageLimit } =
    req.body

  if (code !== undefined) coupon.code = code.toUpperCase().trim()
  if (discountType !== undefined) coupon.discountType = discountType
  if (discountValue !== undefined) coupon.discountValue = discountValue
  if (minOrder !== undefined) coupon.minOrder = minOrder
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt
  if (isActive !== undefined) coupon.isActive = isActive
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit

  await coupon.save()
  res.json({ success: true, message: 'Coupon updated', coupon })
})

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) throw new ApiError(404, 'Coupon not found')
  await coupon.deleteOne()
  res.json({ success: true, message: 'Coupon deleted' })
})