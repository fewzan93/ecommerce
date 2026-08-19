import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  toggleWishlist,
  clearWishlist,
  selectWishlistItems,
} from '../features/wishlist/wishlistSlice'
import { addToCart } from '../features/cart/cartSlice'
import { formatPrice } from '../utils/format'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectWishlistItems)

  const handleMoveToCart = (item) => {
    dispatch(
      addToCart({
        product: {
          id: item.id,
          slug: item.slug,
          name: item.name,
          price: item.price,
          images: item.image ? [item.image] : [],
          stock: 99,
        },
        qty: 1,
      })
    )
    dispatch(toggleWishlist(item))
    toast.success('Moved to cart')
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h1>
        <p className="mt-2 text-gray-500">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          My Wishlist ({items.length})
        </h1>
        <button
          onClick={() => {
            dispatch(clearWishlist())
            toast.success('Wishlist cleared')
          }}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
          >
            <Link to={`/product/${item.slug}`}>
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="p-3">
              <Link
                to={`/product/${item.slug}`}
                className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-brand-600"
              >
                {item.name}
              </Link>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => dispatch(toggleWishlist(item))}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Remove"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7l-.9 12.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M3 7h18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}