import { useState } from 'react'
import { toast } from 'react-toastify'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../api/ordersApi'
import { formatPrice } from '../utils/format'
import OrderStatusBadge from '../components/OrderStatusBadge'
import Spinner from '../components/Spinner'

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function AdminOrders() {
  const { data, isLoading } = useGetAllOrdersQuery()
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()
  const [expanded, setExpanded] = useState(null)

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateStatus({ id: orderId, status }).unwrap()
      toast.success(`Order marked as ${status}`)
    } catch (err) {
      toast.error(err.data?.message || 'Update failed')
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Orders ({data?.orders?.length || 0})</h2>

      {data?.orders?.length === 0 ? (
        <p className="py-10 text-center text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {data?.orders?.map((order) => (
            <div key={order._id} className="rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    #{order._id.slice(-10).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {order.user?.name || '—'} · {order.user?.email || ''} ·{' '}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                  <OrderStatusBadge status={order.status} paid={order.isPaid} />
                  <span className="text-gray-400">
                    {expanded === order._id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {expanded === order._id && (
                <div className="border-t border-gray-100 p-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.image || '/placeholder.svg'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.variant ? `${item.variant} · ` : ''}
                                {formatPrice(item.price)} × {item.qty}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Shipping to
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.fullName}, {order.shippingAddress.street},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.zip},{' '}
                        {order.shippingAddress.country} · {order.shippingAddress.phone}
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Update Status
                      </h4>
                      <select
                        value={order.status}
                        disabled={updating}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <dl className="mt-4 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Subtotal</dt>
                          <dd className="font-medium">{formatPrice(order.itemsPrice)}</dd>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <dt>Discount{order.coupon ? ` (${order.coupon.code})` : ''}</dt>
                            <dd>-{formatPrice(order.discount)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Tax</dt>
                          <dd className="font-medium">{formatPrice(order.taxPrice)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Shipping</dt>
                          <dd className="font-medium">
                            {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                          </dd>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-1.5 font-bold">
                          <dt>Total</dt>
                          <dd>{formatPrice(order.totalPrice)}</dd>
                        </div>
                        <div className="flex justify-between pt-1">
                          <dt className="text-gray-500">Payment</dt>
                          <dd className={order.isPaid ? 'font-medium text-green-600' : 'font-medium text-amber-600'}>
                            {order.isPaid ? `Paid ${order.paidAt ? new Date(order.paidAt).toLocaleDateString() : ''}` : 'Unpaid'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}