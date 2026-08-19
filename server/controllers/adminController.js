import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Review from '../models/Review.js'
import Coupon from '../models/Coupon.js'
import Category from '../models/Category.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date()

  const [revenueAgg, paidOrders, pendingOrders, products, users, categories, reviews] =
    await Promise.all([
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ isPaid: true }),
      Order.countDocuments({ status: { $in: ['Pending', 'Processing'] } }),
      Product.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Review.countDocuments(),
    ])

  const revenue = revenueAgg[0]?.total || 0

  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $exists: true } } },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
        },
        total: { $sum: '$totalPrice' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  const monthMap = new Map(monthlyRevenue.map((m) => [`${m._id.year}-${m._id.month}`, m.total]))
  const lastMonths = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    lastMonths.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      revenue: monthMap.get(key) || 0,
    })
  }

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        image: { $first: '$orderItems.image' },
        sold: { $sum: '$orderItems.qty' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ])

  res.json({
    success: true,
    stats: {
      revenue,
      paidOrders,
      pendingOrders,
      products,
      users,
      categories,
      reviews,
      monthlyRevenue: lastMonths,
      recentOrders,
      topProducts,
    },
  })
})

export const getUsers = asyncHandler(async (req, res) => {
  const { keyword = '', page = 1, limit = 10 } = req.query
  const query = keyword ? { $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }] } : {}

  const pageNum = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10))

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ])

  res.json({
    success: true,
    users,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  })
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  const { isBlocked, role } = req.body

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot modify your own account here')
  }

  if (isBlocked !== undefined) user.isBlocked = isBlocked
  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) throw new ApiError(400, 'Invalid role')
    user.role = role
  }

  await user.save()
  res.json({ success: true, message: 'User updated', user })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account')
  }

  const orderCount = await Order.countDocuments({ user: user._id })
  if (orderCount > 0) {
    throw new ApiError(400, 'This user has orders — block them instead of deleting')
  }

  await Review.deleteMany({ user: user._id })
  await user.deleteOne()
  res.json({ success: true, message: 'User deleted' })
})

export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 })
  res.json({ success: true, reviews })
})

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw new ApiError(404, 'Review not found')

  await review.deleteOne()

  const product = await Product.findById(review.product)
  if (product) {
    const [numReviews, avg] = await Promise.all([
      Review.countDocuments({ product: product._id }),
      Review.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
    ])
    product.numReviews = numReviews
    product.rating = Math.round((avg[0]?.avg || 0) * 10) / 10
    await product.save()
  }

  res.json({ success: true, message: 'Review deleted' })
})