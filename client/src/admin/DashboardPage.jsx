import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useGetStatsQuery } from '../api/adminApi'
import { formatPrice } from '../utils/format'
import OrderStatusBadge from '../components/OrderStatusBadge'
import Spinner from '../components/Spinner'

const StatCard = ({ label, value, icon, sub, accent = 'text-brand-600' }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <span className={`text-xl ${accent}`}>{icon}</span>
    </div>
    <p className="mt-2 text-2xl font-extrabold text-gray-900">{value}</p>
    {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
  </div>
)

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetStatsQuery()

  if (isLoading) return <Spinner />
  if (isError || !data?.stats) {
    return <p className="py-10 text-center text-gray-500">Could not load stats.</p>
  }

  const s = data.stats

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Revenue (paid)" value={formatPrice(s.revenue)} accent="text-green-600" icon="💰" />
        <StatCard label="Orders" value={s.paidOrders} sub={`${s.pendingOrders} pending/processing`} icon="📦" />
        <StatCard label="Products" value={s.products} icon="🛍️" />
        <StatCard label="Users" value={s.users} icon="👥" />
        <StatCard label="Categories" value={s.categories} icon="🗂️" />
        <StatCard label="Reviews" value={s.reviews} icon="⭐" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="mb-4 font-bold text-gray-900">Revenue — last 6 months</h3>
          {s.monthlyRevenue.every((m) => m.revenue === 0) ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No paid orders yet. When customers pay, revenue appears here.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={s.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [formatPrice(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Top Products</h3>
            <Link to="/admin/products" className="text-xs font-medium text-brand-600 hover:underline">
              Manage →
            </Link>
          </div>
          {s.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {s.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-bold text-gray-400">{i + 1}</span>
                  <img src={p.image || '/placeholder.svg'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sold} sold</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{formatPrice(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-medium text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {s.recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="pb-2 pr-4">Order</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-gray-900">
                      #{o._id.slice(-10).toUpperCase()}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">{o.user?.name || '—'}</td>
                    <td className="py-2.5 pr-4 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-gray-900">
                      {formatPrice(o.totalPrice)}
                    </td>
                    <td className="py-2.5">
                      <OrderStatusBadge status={o.status} paid={o.isPaid} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}