const styles = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function OrderStatusBadge({ status, paid }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Pending}`}>
        {status}
      </span>
      {paid && (
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          Paid
        </span>
      )}
    </div>
  )
}