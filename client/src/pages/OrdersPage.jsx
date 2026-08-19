import { Link } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../api/ordersApi'
import OrderStatusBadge from '../components/OrderStatusBadge'
import Spinner from '../components/Spinner'
import { formatPrice } from '../utils/format'

export default function OrdersPage() {
  const { data, isLoading, isError } = useGetMyOrdersQuery()

  if (isLoading) return <Spinner />

  if (isError || !data?.orders?.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">No orders yet</h1>
        <p className="mt-2 text-gray-500">
          When you place an order, it will show up here with live status updates.
        </p>
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
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      <div className="space-y-3">
        {data.orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  #{order._id.slice(-10).toUpperCase()}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex -space-x-2">
                  {order.orderItems.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  {order.orderItems.length > 4 && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600">
                      +{order.orderItems.length - 4}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.orderItems.reduce((s, i) => s + i.qty, 0)} item(s)
                  </p>
                </div>

                <OrderStatusBadge status={order.status} paid={order.isPaid} />

                <span className="text-brand-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}