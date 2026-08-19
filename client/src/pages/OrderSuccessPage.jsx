import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetOrderBySessionQuery } from '../api/ordersApi'
import { formatPrice } from '../utils/format'
import Spinner from '../components/Spinner'

export default function OrderSuccessPage() {
  const { orderId: sessionId } = useParams()
  const [pollCount, setPollCount] = useState(0)

  const { data, isLoading, isError, refetch } = useGetOrderBySessionQuery(
    sessionId,
    { skip: !sessionId }
  )

  const order = data?.order
  const paid = order?.isPaid

  useEffect(() => {
    if (!isLoading && order && !paid && pollCount < 15) {
      const t = setTimeout(() => {
        setPollCount((c) => c + 1)
        refetch()
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [isLoading, order, paid, pollCount, refetch])

  if (isLoading || !order) return <Spinner />

  if (isError || !data?.success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <p className="mt-2 text-gray-500">
          We couldn't find this order. If you just paid, it may take a moment —
          check your order history shortly.
        </p>
        <Link to="/orders" className="mt-6 inline-block text-brand-600 hover:underline">
          View my orders
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {paid ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Thank you! Payment successful
            </h1>
            <p className="mt-2 text-gray-500">
              Your order has been placed and is being processed. A confirmation
              has been sent to your email.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-amber-100">
              <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Confirming your payment...
            </h1>
            <p className="mt-2 text-gray-500">
              This page refreshes automatically. You don't need to do anything.
            </p>
          </>
        )}

        <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              #{order._id.slice(-10).toUpperCase()}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                paid
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {order.status} {paid ? '· Paid' : '· Awaiting payment'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">Items</p>
            <p className="text-sm font-medium text-gray-900">
              {order.orderItems.reduce((s, i) => s + i.qty, 0)}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">Total paid</p>
            <p className="text-base font-extrabold text-gray-900">
              {formatPrice(order.totalPrice)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/orders/${order._id}`}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            View Order Details
          </Link>
          <Link
            to="/shop"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}