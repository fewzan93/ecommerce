import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useGetProductsQuery } from '../api/productsApi'
import { useGetCategoriesQuery } from '../api/categoriesApi'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name: A to Z' },
]

const ratingOptions = [4, 3, 2, 1]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceOpen, setPriceOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const keyword = searchParams.get('keyword') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const rating = searchParams.get('rating') || ''
  const page = searchParams.get('page') || '1'

  const { data: catData } = useGetCategoriesQuery()
  const { data, isLoading, isFetching } = useGetProductsQuery({
    category: category || undefined,
    keyword: keyword || undefined,
    sort,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    rating: rating || undefined,
    page,
    limit: 12,
  })

  const updateParams = (updates, resetPage = true) => {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === '' || value === null || value === undefined) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    if (resetPage) params.delete('page')
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const resultLabel = useMemo(() => {
    if (!data) return ''
    const { total, pages } = data.pagination
    const start = (data.pagination.page - 1) * data.pagination.limit + 1
    const end = Math.min(page * data.pagination.limit, total)
    return pages > 1
      ? `Showing ${start}–${end} of ${total} products`
      : `${total} product${total === 1 ? '' : 's'}`
  }, [data, page])

  const activeFilterCount =
    (category ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + (rating ? 1 : 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-900">Shop</span>
        {keyword && (
          <>
            <span className="mx-1.5">/</span>
            <span className="text-gray-900">Search: "{keyword}"</span>
          </>
        )}
      </nav>

      {keyword && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <p className="text-sm text-brand-800">
            Results for <b>"{keyword}"</b> — {resultLabel}
          </p>
          <button
            onClick={() => updateParams({ keyword: '' })}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-60">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Category</h3>
              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="category"
                    checked={category === ''}
                    onChange={() => updateParams({ category: '' })}
                    className="accent-brand-600"
                  />
                  All Categories
                </label>
                {catData?.categories?.map((cat) => (
                  <label key={cat._id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat.slug}
                      onChange={() => updateParams({ category: cat.slug })}
                      className="accent-brand-600"
                    />
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat.productCount}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
              >
                Price Range
                <span className="text-gray-400">{priceOpen ? '−' : '+'}</span>
              </button>
              {priceOpen && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParams({ minPrice: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-600"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-600"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Rating</h3>
              <div className="space-y-1.5">
                {ratingOptions.map((r) => (
                  <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="rating"
                      checked={rating === String(r)}
                      onChange={() =>
                        updateParams({ rating: rating === String(r) ? '' : String(r) })
                      }
                      className="accent-brand-600"
                    />
                    <span className="text-amber-400">
                      {'★'.repeat(r)}
                      <span className="text-gray-300">{'★'.repeat(5 - r)}</span>
                    </span>
                    <span className="text-xs text-gray-400">& up</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">{resultLabel}</p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Sort by</label>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <Spinner />
          ) : data?.products?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-lg font-medium text-gray-700">No products found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 ${
                  isFetching ? 'opacity-60' : ''
                }`}
              >
                {data?.products?.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination pagination={data?.pagination} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}