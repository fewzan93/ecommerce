import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../api/productsApi'
import { useGetCategoriesQuery } from '../api/categoriesApi'
import ImageUploader from '../components/ImageUploader'
import { formatPrice } from '../utils/format'
import Spinner from '../components/Spinner'

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  description: '',
  shortDescription: '',
  imagesText: '',
  sizesText: '',
  colorsText: '',
  featured: false,
  isActive: true,
}

export default function AdminProducts() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useGetProductsQuery({
    keyword: keyword || undefined,
    page,
    limit: 10,
  })
  const { data: catData } = useGetCategoriesQuery()
  const [createProduct] = useCreateProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()
  const featured = watch('featured')
  const isActive = watch('isActive')
  const imagesText = watch('imagesText') || ''

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        brand: editing.brand || '',
        category: editing.category?._id || editing.category || '',
        price: editing.price,
        compareAtPrice: editing.compareAtPrice || '',
        stock: editing.stock,
        description: editing.description,
        shortDescription: editing.shortDescription || '',
        imagesText: (editing.images || []).join('\n'),
        sizesText: (editing.sizes || []).join(', '),
        colorsText: (editing.colors || []).map((c) => `${c.name}:${c.hex}`).join(', '),
        featured: editing.featured,
        isActive: editing.isActive,
      })
    } else {
      reset(emptyForm)
    }
  }, [editing, reset])

  const openCreate = () => {
    setEditing(null)
    reset(emptyForm)
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setShowForm(true)
  }

  const onSubmit = async (form) => {
    const payload = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock) || 0,
      description: form.description,
      shortDescription: form.shortDescription,
      images: form.imagesText.split('\n').map((s) => s.trim()).filter(Boolean),
      sizes: form.sizesText.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colorsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((pair) => {
          const [name, hex] = pair.split(':')
          return { name: name?.trim(), hex: (hex || '#000000').trim() }
        }),
      featured: !!featured,
      isActive: !!isActive,
    }

    try {
      if (editing) {
        await updateProduct({ id: editing._id, ...payload }).unwrap()
        toast.success('Product updated')
      } else {
        await createProduct(payload).unwrap()
        toast.success('Product created')
      }
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      toast.error(err.data?.message || 'Save failed')
    }
  }

  const confirmDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(product._id).unwrap()
      toast.success('Product deleted')
    } catch (err) {
      toast.error(err.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Products</h2>
        <div className="flex items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(1)
            }}
            placeholder="Search products..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <button
            onClick={openCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                )}
                {data?.products?.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{p.category?.name || '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-2.5">
                      <span className={p.stock === 0 ? 'font-semibold text-red-600' : 'text-gray-700'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(p)}
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

          {data?.pagination?.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page >= data.pagination.pages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="mt-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                  <input {...register('brand')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  >
                    <option value="">Select category</option>
                    {catData?.categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price (USD) *</label>
                  <input type="number" step="0.01" {...register('price', { required: 'Price is required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Compare-at price</label>
                  <input type="number" step="0.01" {...register('compareAtPrice')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stock *</label>
                  <input type="number" {...register('stock', { required: 'Stock is required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Short description</label>
                <input {...register('shortDescription')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                <textarea rows={3} {...register('description', { required: 'Description is required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <div className="flex items-start gap-3">
                  <textarea
                    rows={3}
                    {...register('imagesText')}
                    placeholder="Image URLs (one per line) — or upload below"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  />
                  {imagesText && (
                    <div className="hidden w-28 shrink-0 flex-col gap-1 sm:flex">
                      {imagesText
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((url, i) => (
                          <img key={i} src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
                        ))}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <ImageUploader
                    label="images"
                    multiple
                    max={5}
                    onUploaded={(urls) => {
                      const existing = imagesText
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean)
                      setValue('imagesText', [...existing, ...urls].join('\n'))
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sizes (comma separated)</label>
                  <input {...register('sizesText')} placeholder="S, M, L, XL" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Colors (name:hex, comma)</label>
                  <input {...register('colorsText')} placeholder="Black:#000000, White:#FFFFFF" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('featured')} checked={featured} className="accent-brand-600" />
                  Featured
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('isActive')} checked={isActive} className="accent-brand-600" />
                  Active (visible in store)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  {editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}