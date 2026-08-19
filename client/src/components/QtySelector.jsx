import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

export default function QtySelector({ qty, onChange, max = 99, min = 1 }) {
  const handle = (value) => {
    if (value < min || value > max) return
    onChange(value)
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300">
      <button
        type="button"
        onClick={() => handle(qty - 1)}
        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
        disabled={qty <= min}
      >
        −
      </button>
      <input
        type="number"
        value={qty}
        min={min}
        max={max}
        onChange={(e) => handle(parseInt(e.target.value) || min)}
        className="w-12 border-x border-gray-300 py-1.5 text-center text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => handle(qty + 1)}
        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
        disabled={qty >= max}
      >
        +
      </button>
    </div>
  )
}