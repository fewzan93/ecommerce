import { Link, useParams } from 'react-router-dom'
import { useGetOrderQuery } from '../api/ordersApi'
import OrderStatusTimeline from '../components/OrderStatusTimeline'
import OrderStatusBadge from '../components/OrderStatusBadge'
import Spinner from '../components/Spinner'
import { formatPrice } from '../utils/format'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { data, isLoading, isError } = useGetOrderQuery(orderId)

  if (isLoading) return <Spinner />

  if (isError || !data?.order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Link to="/orders" className="mt-4 inline-block text-brand-600 hover:underline">
          ← Back to my orders
        </Link>
      </div>
    )
  }

  const order = data.order

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/orders" className="hover:text-brand-600">
          My Orders
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-900">#{order._id.slice(-10).toUpperCase()}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-10).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} paid={order.isPaid} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatPrice(item.price)} × {item.qty}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Shipping Address</h2>
            <p className="text-sm font-medium text-gray-900">
              {order.shippingAddress.fullName}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
              {order.shippingAddress.zip}
              <br />
              {order.shippingAddress.country}
            </p>
            <p className="mt-2 text-sm text-gray-600">{order.shippingAddress.phone}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Payment</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium capitalize text-gray-900">
                {order.paymentMethod === 'stripe' ? 'Stripe (Card)' : order.paymentMethod}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-medium ${
                  order.isPaid ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {order.isPaid ? 'Paid' : 'Awaiting payment'}
              </span>
            </div>
            {order.isPaid && order.paidAt && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Paid at</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.paidAt).toLocaleString()}
                </span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivered at</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.deliveredAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="font-medium text-gray-900">
                  {formatPrice(order.itemsPrice)}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Discount{order.coupon ? ` (${order.coupon.code})` : ''}</dt>
                  <dd>-{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Tax</dt>
                <dd className="font-medium text-gray-900">{formatPrice(order.taxPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Shipping</dt>
                <dd className="font-medium text-gray-900">
                  {order.shippingPrice === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(order.shippingPrice)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-bold text-gray-900">Total</dt>
                <dd className="font-extrabold text-gray-900">
                  {formatPrice(order.totalPrice)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}