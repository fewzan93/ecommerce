import { Link } from 'react-router-dom'
import { useGetCategoriesQuery } from '../api/categoriesApi'
import { useGetProductsQuery } from '../api/productsApi'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function HomePage() {
  const { data: catData, isLoading: catsLoading } = useGetCategoriesQuery()
  const { data: featured, isLoading: featuredLoading } = useGetProductsQuery({
    sort: 'featured',
    limit: 8,
  })
  const { data: newArrivals, isLoading: newLoading } = useGetProductsQuery({
    sort: 'newest',
    limit: 8,
  })

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-white sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-200">
            Summer Sale — up to 30% off
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything You Need, Delivered
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Electronics, fashion, home essentials and more — from trusted
            brands at unbeatable prices. Free shipping over $50.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:bg-gray-100"
            >
              Shop Now
            </Link>
            <Link
              to="/shop?category=electronics"
              className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse Electronics
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Shop by Category</h2>
        {catsLoading ? (
          <Spinner className="h-6 w-6" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {catData?.categories?.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={cat.image || '/placeholder.svg'}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {cat.productCount} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/shop?sort=featured" className="text-sm font-medium text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {featuredLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {featured?.products?.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/shop" className="text-sm font-medium text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          {newLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {newArrivals?.products?.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-8 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-extrabold">Get 10% off your first order</h2>
            <p className="mt-1 text-amber-100">
              Use code <b className="rounded bg-white/20 px-2 py-0.5">WELCOME10</b> at
              checkout. Valid on orders over $20.
            </p>
          </div>
          <Link
            to="/shop"
            className="shrink-0 rounded-full bg-white px-8 py-3 text-sm font-semibold text-orange-600 shadow transition hover:bg-gray-50"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  )
}