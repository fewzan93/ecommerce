export default function Rating({ value, count, size = 'text-sm' }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${size}`}>
        {stars.map((s) => (
          <span
            key={s}
            className={
              s <= Math.round(value)
                ? 'text-amber-400'
                : 'text-gray-300'
            }
          >
            ★
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">
          {value ? value.toFixed(1) : 'No'} {value ? `(${count})` : 'reviews'}
        </span>
      )}
    </div>
  )
}