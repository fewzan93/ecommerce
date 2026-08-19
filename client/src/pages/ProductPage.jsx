import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useGetProductQuery, useGetRelatedProductsQuery, useCreateReviewMutation } from '../api/productsApi'
import { addToCart } from '../features/cart/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../features/wishlist/wishlistSlice'
import { selectCurrentUser } from '../features/auth/authSlice'
import ProductCard from '../components/ProductCard'
import Rating from '../components/Rating'
import QtySelector from '../components/QtySelector'
import Spinner from '../components/Spinner'
import { formatPrice, discountPercent } from '../utils/format'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)

  const { data, isLoading, error } = useGetProductQuery(slug)
  const { data: relatedData } = useGetRelatedProductsQuery(data?.product?._id, {
    skip: !data?.product?._id,
  })
  const [createReview, { isLoading: reviewSubmitting }] = useCreateReviewMutation()
  const wishlisted = useSelector((state) =>
    selectIsWishlisted(state, data?.product?._id)
  )

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  if (isLoading) return <Spinner />
  if (error || !data?.product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <Link to="/shop" className="mt-3 inline-block text-brand-600 hover:underline">
          Back to shop
        </Link>
      </div>
    )
  }

  const product = data.product
  const discount = discountPercent(product.price, product.compareAtPrice)
  const outOfStock = product.stock === 0

  const variantLabel = [selectedColor, selectedSize].filter(Boolean).join(' / ')

  const handleAddToCart = (buyNow = false) => {
    if (outOfStock) {
      toast.error('This product is out of stock')
      return
    }
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    if (product.colors?.length && !selectedColor) {
      toast.error('Please select a color')
      return
    }
    dispatch(addToCart({ product, qty, variant: variantLabel || null }))
    toast.success('Added to cart')
    if (buyNow) navigate('/cart')
  }

  const handleWishlist = () => {
    dispatch(toggleWishlist(product))
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await createReview({ id: product._id, rating, comment }).unwrap()
      toast.success('Review submitted — thank you!')
      setComment('')
      setRating(5)
    } catch (err) {
      toast.error(err.data?.message || 'Could not submit review')
    }
  }

  const ratingBars = [5, 4, 3, 2, 1].map((r) => ({
    r,
    count: product.reviews?.filter((rev) => rev.rating === r).length || 0,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/shop" className="hover:text-brand-600">Shop</Link>
        <span className="mx-1.5">/</span>
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-brand-600">
          {product.category?.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <img
              src={product.images?.[activeImage] || '/placeholder.svg'}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {product.brand || product.category?.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <Rating value={product.rating} count={product.numReviews} />
            <button
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-brand-600 hover:underline"
            >
              Write a review
            </button>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-600">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {product.shortDescription || product.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {outOfStock ? (
              <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-600">
                Out of stock
              </span>
            ) : product.stock <= 10 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                In stock
              </span>
            )}
          </div>

          {product.colors?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Color: <span className="font-normal text-gray-500">{selectedColor || 'Select'}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={`h-9 w-9 rounded-full border-2 ${
                      selectedColor === c.name
                        ? 'border-brand-600 ring-2 ring-brand-200'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Size: <span className="font-normal text-gray-500">{selectedSize || 'Select'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === s
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-brand-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtySelector qty={qty} onChange={setQty} max={Math.max(1, product.stock)} disabled={outOfStock} />
            <button
              onClick={() => handleAddToCart(false)}
              disabled={outOfStock}
              className="flex-1 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:flex-none sm:min-w-44"
            >
              Add to Cart
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={outOfStock}
              className="flex-1 rounded-lg border-2 border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 sm:flex-none sm:min-w-44"
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlist}
              className={`rounded-lg border p-3 transition ${
                wishlisted
                  ? 'border-red-300 bg-red-50 text-red-500'
                  : 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500'
              }`}
              title="Wishlist"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
            <div className="rounded-lg bg-gray-50 p-2.5">
              <p className="font-semibold text-gray-700">Free Shipping</p>
              On orders over $50
            </div>
            <div className="rounded-lg bg-gray-50 p-2.5">
              <p className="font-semibold text-gray-700">Easy Returns</p>
              30-day return policy
            </div>
            <div className="rounded-lg bg-gray-50 p-2.5">
              <p className="font-semibold text-gray-700">Secure Payment</p>
              Stripe encrypted checkout
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Description</h2>
          <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Details</h2>
          <dl className="space-y-2 text-sm">
            {product.brand && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Brand</dt>
                <dd className="font-medium text-gray-900">{product.brand}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Category</dt>
              <dd className="font-medium text-gray-900">{product.category?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Availability</dt>
              <dd className="font-medium text-gray-900">
                {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
              </dd>
            </div>
            {product.sizes?.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Sizes</dt>
                <dd className="font-medium text-gray-900">{product.sizes.join(', ')}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">SKU</dt>
              <dd className="font-medium text-gray-900">{product._id.slice(-8).toUpperCase()}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div id="reviews" className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-extrabold text-gray-900">
              {product.rating ? product.rating.toFixed(1) : '0.0'}
            </span>
            <div>
              <Rating value={product.rating} />
              <p className="mt-1 text-xs text-gray-500">
                Based on {product.numReviews} review{product.numReviews === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {ratingBars.map(({ r, count }) => (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-gray-500">{r}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{
                      width: product.numReviews
                        ? `${(count / product.numReviews) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <span className="w-6 text-right text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Reviews</h2>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="mb-6 rounded-xl bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`text-2xl ${r <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="Share your thoughts about this product..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-brand-600"
              />
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="mt-3 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="mb-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Log in
              </Link>{' '}
              to write a review.
            </p>
          )}

          {product.reviews?.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No reviews yet — be the first to review this product!
            </p>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map((rev) => (
                <div key={rev._id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {rev.user?.name?.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rev.user?.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Rating value={rev.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {relatedData?.products?.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {relatedData.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}