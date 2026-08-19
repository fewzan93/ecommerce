import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getStripe } from '../config/stripe.js'
import { sendEmail } from '../utils/sendEmail.js'

const SHIPPING_THRESHOLD = 50
const FLAT_SHIPPING = 5
const TAX_RATE = 0.05

export const checkout = asyncHandler(async (req, res) => {
  const { items, shippingAddress, couponCode } = req.body

  if (!items?.length) throw new ApiError(400, 'Your cart is empty')
  if (!shippingAddress?.fullName || !shippingAddress?.street || !shippingAddress?.city) {
    throw new ApiError(400, 'Complete shipping address is required')
  }

  const stripe = await getStripe()
  if (!stripe) {
    throw new ApiError(
      500,
      'Stripe is not configured — add STRIPE_SECRET_KEY to server/.env'
    )
  }

  const productIds = items.map((i) => i.id)
  const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean()
  const productMap = new Map(products.map((p) => [p._id.toString(), p]))

  const orderItems = []
  let subtotal = 0

  for (const item of items) {
    const product = productMap.get(item.id)
    if (!product) throw new ApiError(400, `A product in your cart is no longer available`)
    if (item.qty < 1) throw new ApiError(400, 'Invalid quantity')

    const price = product.price
    subtotal += price * item.qty
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price,
      qty: item.qty,
      variant: item.variant || null,
    })
  }

  let discount = 0
  let coupon = null

  if (couponCode) {
    const found = await Coupon.findOne({
      code: couponCode.toUpperCase().trim(),
      isActive: true,
    })
    if (!found) throw new ApiError(404, 'Invalid coupon code')
    if (found.expiresAt < new Date()) throw new ApiError(400, 'This coupon has expired')
    if (found.usageLimit && found.usedCount >= found.usageLimit) {
      throw new ApiError(400, 'This coupon has reached its usage limit')
    }
    if (subtotal < found.minOrder) {
      throw new ApiError(400, `Minimum order for this coupon is $${found.minOrder}`)
    }

    if (found.discountType === 'percent') {
      discount = subtotal * (found.discountValue / 100)
      if (found.maxDiscount) discount = Math.min(discount, found.maxDiscount)
    } else {
      discount = Math.min(found.discountValue, subtotal)
    }
    discount = Math.round(discount * 100) / 100
    coupon = {
      code: found.code,
      discountType: found.discountType,
      discountValue: found.discountValue,
    }
  }

  const taxableBase = subtotal - discount
  const taxPrice = Math.round(taxableBase * TAX_RATE * 100) / 100
  const shippingPrice = taxableBase >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
  const totalPrice = Math.round((taxableBase + taxPrice + shippingPrice) * 100) / 100

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: req.user.email,
    line_items: orderItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
          metadata: { variant: item.variant || '' },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    metadata: {
      userId: req.user._id.toString(),
    },
    success_url: `${process.env.CLIENT_URL}/order-success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cart?canceled=1`,
  })

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: 'stripe',
    paymentResult: { id: session.id, status: 'pending' },
    itemsPrice: Math.round(subtotal * 100) / 100,
    taxPrice,
    shippingPrice,
    discount,
    totalPrice,
    coupon,
    status: 'Pending',
    isPaid: false,
  })

  res.status(201).json({
    success: true,
    message: 'Checkout session created',
    url: session.url,
    orderId: order._id,
  })
})

export const getOrderBySession = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ 'paymentResult.id': req.params.sessionId })
  if (!order) throw new ApiError(404, 'Order not found')

  const isOwner = order.user.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to view this order')

  res.json({ success: true, order })
})

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')

  const isOwner = order.user.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to view this order')

  res.json({ success: true, order })
})

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, orders })
})

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
  res.json({ success: true, orders })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const valid = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  if (!valid.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${valid.join(', ')}`)
  }

  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')

  if (status === 'Cancelled' && order.status === 'Cancelled') {
    throw new ApiError(400, 'Order is already cancelled')
  }

  order.status = status
  if (status === 'Delivered') order.deliveredAt = new Date()

  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } })
    }
    order.deliveredAt = undefined
  }

  await order.save()
  res.json({ success: true, message: `Order marked as ${status}`, order })
})

export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature']
  const stripe = await getStripe()

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ received: false, message: 'Stripe not configured' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).json({ received: false, message: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const order = await Order.findOne({ 'paymentResult.id': session.id })

    if (order && !order.isPaid) {
      order.isPaid = true
      order.paidAt = new Date()
      order.paymentResult.status = 'paid'
      order.paymentResult.email_address = session.customer_details?.email || ''
      await order.save()

      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty },
        })
      }

      if (order.coupon?.code) {
        await Coupon.findOneAndUpdate(
          { code: order.coupon.code },
          { $inc: { usedCount: 1 } }
        )
      }

      await sendEmail({
        to: req.user ? req.user.email : session.customer_details?.email || order.shippingAddress?.phone,
        subject: `Order #${order._id} confirmed`,
        text: `Your order of $${order.totalPrice} has been paid. Order ID: ${order._id}`,
        html: `<p>Thank you for your purchase! Your order <b>#${order._id}</b> for <b>$${order.totalPrice}</b> has been paid successfully.</p>`,
      }).catch(() => {})
    }
  }

  res.json({ received: true })
})