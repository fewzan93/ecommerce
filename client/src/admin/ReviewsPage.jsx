import { toast } from 'react-toastify'
import {
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
} from '../api/adminApi'
import Rating from '../components/Rating'
import Spinner from '../components/Spinner'

export default function AdminReviews() {
  const { data, isLoading } = useGetAdminReviewsQuery()
  const [deleteReview] = useDeleteReviewMutation()

  const confirmDelete = async (review) => {
    if (!window.confirm(`Delete review by "${review.user?.name}"?`)) return
    try {
      await deleteReview(review._id).unwrap()
      toast.success('Review deleted')
    } catch (err) {
      toast.error(err.data?.message || 'Delete failed')
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Reviews ({data?.reviews?.length || 0})</h2>

      {data?.reviews?.length === 0 ? (
        <p className="py-10 text-center text-gray-400">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {data?.reviews?.map((review) => (
            <div key={review._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {review.user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.user?.name} <span className="font-normal text-gray-400">· {review.user?.email}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Rating value={review.rating} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/product/${review.product?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <img
                      src={review.product?.images?.[0] || '/placeholder.svg'}
                      alt=""
                      className="h-6 w-6 rounded object-cover"
                    />
                    {review.product?.name?.slice(0, 30)}
                    {review.product?.name?.length > 30 ? '…' : ''}
                  </a>
                  <button
                    onClick={() => confirmDelete(review)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}