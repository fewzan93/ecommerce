import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '../api/couponsApi'
import { formatPrice } from '../utils/format'
import Spinner from '../components/Spinner'

const emptyForm = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  minOrder: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
}

export default function AdminCoupons() {
  const { data, isLoading } = useGetCouponsQuery()
  const [createCoupon] = useCreateCouponMutation()
  const [updateCoupon] = useUpdateCouponMutation()
  const [deleteCoupon] = useDeleteCouponMutation()

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const discountType = watch('discountType')

  useEffect(() => {
    if (editing) {
      reset({
        code: editing.code,
        discountType: editing.discountType,
        discountValue: editing.discountValue,
        minOrder: editing.minOrder || '',
        maxDiscount: editing.maxDiscount || '',
        usageLimit: editing.usageLimit || '',
        expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString().slice(0, 10) : '',
        isActive: editing.isActive,
      })
    } else {
      reset(emptyForm)
    }
  }, [editing, reset])

  const onSubmit = async (form) => {
    const payload = {
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrder: form.minOrder ? Number(form.minOrder) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: new Date(form.expiresAt).toISOString(),
      isActive: !!form.isActive,
    }
    try {
      if (editing) {
        await updateCoupon({ id: editing._id, ...payload }).unwrap()
        toast.success('Coupon updated')
      } else {
        await createCoupon(payload).unwrap()
        toast.success('Coupon created')
      }
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      toast.error(err.data?.message || 'Save failed')
    }
  }

  const confirmDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return
    try {
      await deleteCoupon(coupon._id).unwrap()
      toast.success('Coupon deleted')
    } catch (err) {
      toast.error(err.data?.message || 'Delete failed')
    }
  }

  const isExpired = (c) => new Date(c.expiresAt) < new Date()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Coupons</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Coupon
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.coupons?.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {c.discountType === 'percent' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    {c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {c.minOrder > 0 ? formatPrice(c.minOrder) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {new Date(c.expiresAt).toLocaleDateString()}
                    {isExpired(c) && <span className="ml-1 text-xs text-red-500">(expired)</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {c.usedCount}
                    {c.usageLimit ? `/${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.isActive && !isExpired(c)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.isActive && !isExpired(c) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(c)
                          setShowForm(true)
                        }}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(c)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Coupon' : 'Add Coupon'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code *</label>
                <input
                  {...register('code', { required: 'Code is required' })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-600"
                  placeholder="SAVE20"
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    {...register('discountType')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat ($)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {discountType === 'percent' ? 'Percent *' : 'Amount ($) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('discountValue', { required: 'Discount is required', min: { value: 1, message: 'Must be at least 1' } })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  />
                  {errors.discountValue && (
                    <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min order ($)</label>
                  <input type="number" {...register('minOrder')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max discount ($)</label>
                  <input type="number" {...register('maxDiscount')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Usage limit</label>
                  <input type="number" {...register('usageLimit')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Expires *</label>
                <input
                  type="date"
                  {...register('expiresAt', { required: 'Expiry is required' })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                />
                {errors.expiresAt && <p className="mt-1 text-xs text-red-500">{errors.expiresAt.message}</p>}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" {...register('isActive')} className="accent-brand-600" />
                Active
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  {editing ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}