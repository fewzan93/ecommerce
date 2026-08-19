import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  updateQty,
  removeFromCart,
  clearCart,
  setCoupon,
  selectCartItems,
  selectCartCoupon,
} from '../features/cart/cartSlice'
import { useValidateCouponMutation } from '../api/couponsApi'
import { formatPrice } from '../utils/format'
import QtySelector from '../components/QtySelector'

const SHIPPING_THRESHOLD = 50
const FLAT_SHIPPING = 5
const TAX_RATE = 0.05

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const appliedCoupon = useSelector(selectCartCoupon)
  const [validateCoupon] = useValidateCouponMutation()

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    if (appliedCoupon && items.length === 0) {
      dispatch(setCoupon(null))
    }
  }, [items, appliedCoupon, dispatch])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const discount = appliedCoupon ? appliedCoupon.discount : 0
  const taxableBase = subtotal - discount
  const tax = taxableBase * TAX_RATE
  const shipping = taxableBase >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
  const total = taxableBase + tax + shipping

  const handleApplyCoupon = async () => {
    const code = couponCode.trim()
    if (!code) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await validateCoupon({ code, subtotal }).unwrap()
      dispatch(setCoupon(res.coupon))
      toast.success(`Coupon applied — you save ${formatPrice(res.coupon.discount)}`)
    } catch (err) {
      setCouponError(err.data?.message || 'Invalid coupon')
      dispatch(setCoupon(null))
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM3 3h2l2.4 12.2A2 2 0 0 0 9.36 17h7.7a2 2 0 0 0 1.96-1.6L21 7H6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Shopping Cart ({items.reduce((s, i) => s + i.qty, 0)} items)
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.variant || ''}`}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-0.5 text-xs text-gray-500">Variant: {item.variant}</p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart({ id: item.id, variant: item.variant }))}
                    className="text-gray-400 hover:text-red-500"
                    title="Remove"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7l-.9 12.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M3 7h18" />
                    </svg>
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QtySelector
                    qty={item.qty}
                    onChange={(qty) =>
                      dispatch(updateQty({ id: item.id, variant: item.variant, qty }))
                    }
                    max={Math.max(1, item.stock)}
                  />
                  <span className="font-bold text-gray-900">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => dispatch(clearCart())}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Clear cart
            </button>
            <Link to="/shop" className="text-sm font-medium text-brand-600 hover:underline">
              ← Continue shopping
            </Link>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="mb-4 flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Coupon code (try WELCOME10)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-600"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:bg-gray-300"
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
          {appliedCoupon ? (
            <p className="mb-3 text-xs font-medium text-green-600">
              ✓ {appliedCoupon.code} applied — save {formatPrice(discount)}
              <button
                onClick={() => dispatch(setCoupon(null))}
                className="ml-2 text-gray-500 underline hover:text-red-500"
              >
                remove
              </button>
            </p>
          ) : couponError ? (
            <p className="mb-3 text-xs font-medium text-red-500">{couponError}</p>
          ) : null}

          <dl className="space-y-2 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discount</dt>
                <dd>-{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Tax (5%)</dt>
              <dd className="font-medium text-gray-900">{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Shipping</dt>
              <dd className="font-medium text-gray-900">
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
              <dt className="font-bold text-gray-900">Total</dt>
              <dd className="font-extrabold text-gray-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Add {formatPrice(SHIPPING_THRESHOLD - taxableBase)} more for free shipping
            </p>
          )}

          <button
            onClick={() => navigate('/checkout')}
            className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Proceed to Checkout
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}