const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered']

export default function OrderStatusTimeline({ status }) {
  const cancelled = status === 'Cancelled'
  const currentIndex = STEPS.indexOf(status)

  return (
    <div className="mt-4">
      {cancelled ? (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
            <p className="text-xs text-red-500">
              This order was cancelled and any stock has been restored.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const completed = i <= currentIndex
            const isCurrent = i === currentIndex
            return (
              <div key={step} className={`flex items-center ${i > 0 ? 'flex-1' : ''}`}>
                {i > 0 && (
                  <div
                    className={`h-1 flex-1 ${i <= currentIndex ? 'bg-brand-600' : 'bg-gray-200'}`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      completed
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                  >
                    {completed ? '✓' : i + 1}
                  </span>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      completed ? 'text-brand-700' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}