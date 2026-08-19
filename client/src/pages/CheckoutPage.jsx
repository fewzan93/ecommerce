import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { clearCart, selectCartItems, selectCartCoupon } from '../features/cart/cartSlice'
import { useCheckoutMutation } from '../api/ordersApi'
import { formatPrice } from '../utils/format'
import Spinner from '../components/Spinner'

const SHIPPING_THRESHOLD = 50
const FLAT_SHIPPING = 5
const TAX_RATE = 0.05

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const appliedCoupon = useSelector(selectCartCoupon)
  const [checkout, { isLoading }] = useCheckoutMutation()
  const [saveAddress, setSaveAddress] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const discount = appliedCoupon?.discount || 0
  const taxableBase = subtotal - discount
  const tax = taxableBase * TAX_RATE
  const shipping = taxableBase >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
  const total = taxableBase + tax + shipping

  if (items.length === 0 && !isLoading && !redirecting) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nothing to check out</h1>
        <p className="mt-2 text-gray-500">Your cart is empty.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Go Shopping
        </Link>
      </div>
    )
  }

  const onSubmit = async (data) => {
    try {
      const res = await checkout({
        items: items.map((i) => ({
          id: i.id,
          qty: i.qty,
          variant: i.variant,
        })),
        shippingAddress: data,
        couponCode: appliedCoupon?.code,
      }).unwrap()

      setRedirecting(true)
      window.location.href = res.url
      dispatch(clearCart())
    } catch (err) {
      toast.error(err.data?.message || 'Checkout failed')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      {(isLoading || redirecting) && <Spinner />}

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2"
        >
          <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register('phone', { required: 'Phone is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                placeholder="+92 3XX XXXXXXX"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Street address</label>
            <input
              {...register('street', { required: 'Street address is required' })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              placeholder="House #, Street, Area"
            />
            {errors.street && (
              <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                {...register('city', { required: 'City is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">State / Province</label>
              <input
                {...register('state')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">ZIP / Postal</label>
              <input
                {...register('zip', { required: 'ZIP code is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              />
              {errors.zip && <p className="mt-1 text-xs text-red-500">{errors.zip.message}</p>}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="accent-brand-600"
            />
            Save this address to my account
          </label>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Payment Method</h3>
            <div className="flex items-center gap-3 rounded-xl border-2 border-brand-600 bg-brand-50 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-extrabold italic shadow-sm">
                S
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Stripe Checkout</p>
                <p className="text-xs text-gray-500">
                  You'll be redirected to Stripe's secure payment page. Test card:{' '}
                  <b>4242 4242 4242 4242</b>
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || redirecting}
            className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-gray-300"
          >
            {isLoading || redirecting ? 'Creating checkout session...' : 'Continue to Payment'}
          </button>
        </form>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant || ''}`} className="flex items-center gap-3">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">{item.name}</p>
                  {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discount ({appliedCoupon.code})</dt>
                <dd>-{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Tax (5%)</dt>
              <dd className="font-medium">{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Shipping</dt>
              <dd className="font-medium">
                {shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold">{formatPrice(total)}</dd>
            </div>
          </dl>

          <Link to="/cart" className="mt-3 block text-center text-sm text-brand-600 hover:underline">
            ← Back to cart
          </Link>
        </div>
      </div>
    </div>
  )
}