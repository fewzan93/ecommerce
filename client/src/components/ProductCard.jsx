import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Rating from './Rating'
import { formatPrice, discountPercent } from '../utils/format'
import { addToCart } from '../features/cart/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../features/wishlist/wishlistSlice'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const wishlisted = useSelector((state) =>
    selectIsWishlisted(state, product._id)
  )
  const discount = discountPercent(product.price, product.compareAtPrice)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addToCart({ product, qty: 1 }))
    toast.success('Added to cart')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(product))
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute right-2 top-2 rounded bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
            Featured
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute right-2 bottom-2 rounded-full bg-white/90 p-2 shadow transition hover:scale-110"
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-medium text-gray-500">
          {product.category?.name || ''}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-brand-600">
          {product.name}
        </h3>
        <Rating value={product.rating} count={product.numReviews} />
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="rounded-lg bg-brand-600 p-2 text-white transition hover:bg-brand-700"
            title="Add to cart"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM3 3h2l2.4 12.2A2 2 0 0 0 9.36 17h7.7a2 2 0 0 0 1.96-1.6L21 7H6" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}