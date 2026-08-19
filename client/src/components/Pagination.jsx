import { Link, useSearchParams } from 'react-router-dom'

export default function Pagination({ pagination, basePath = '/shop' }) {
  const [searchParams] = useSearchParams()

  if (!pagination || pagination.pages <= 1) return null

  const buildUrl = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return `${basePath}?${params.toString()}`
  }

  const { page, pages } = pagination

  const getPages = () => {
    const items = []
    const start = Math.max(1, page - 2)
    const end = Math.min(pages, start + 4)
    for (let i = start; i <= end; i++) items.push(i)
    return items
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      <Link
        to={buildUrl(page - 1)}
        className={`rounded-lg border px-3 py-2 text-sm ${
          page === 1
            ? 'pointer-events-none border-gray-200 text-gray-300'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
      >
        Prev
      </Link>

      {getPages().map((p) => (
        <Link
          key={p}
          to={buildUrl(p)}
          className={`rounded-lg border px-3.5 py-2 text-sm ${
            p === page
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        to={buildUrl(page + 1)}
        className={`rounded-lg border px-3 py-2 text-sm ${
          page === pages
            ? 'pointer-events-none border-gray-200 text-gray-300'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
      >
        Next
      </Link>
    </nav>
  )
}