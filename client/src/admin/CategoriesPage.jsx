import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../api/categoriesApi'
import ImageUploader from '../components/ImageUploader'
import Spinner from '../components/Spinner'

export default function AdminCategories() {
  const { data, isLoading } = useGetCategoriesQuery()
  const [createCategory] = useCreateCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()
  const image = watch('image') || ''

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, description: editing.description || '', image: editing.image || '' })
    } else {
      reset({ name: '', description: '', image: '' })
    }
  }, [editing, reset])

  const onSubmit = async (form) => {
    try {
      if (editing) {
        await updateCategory({ id: editing._id, ...form }).unwrap()
        toast.success('Category updated')
      } else {
        await createCategory(form).unwrap()
        toast.success('Category created')
      }
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      toast.error(err.data?.message || 'Save failed')
    }
  }

  const confirmDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    try {
      await deleteCategory(cat._id).unwrap()
      toast.success('Category deleted')
    } catch (err) {
      toast.error(err.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Category
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.categories?.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {c.image && (
                        <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-2.5 text-gray-700">{c.productCount}</td>
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
                {editing ? 'Edit Category' : 'Add Category'}
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={2}
                  {...register('description')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
                <div className="flex items-start gap-3">
                  <input
                    {...register('image')}
                    placeholder="Image URL — or upload below"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  />
                  {image && (
                    <img src={image} alt="" className="h-10 w-16 shrink-0 rounded-lg object-cover" />
                  )}
                </div>
                <div className="mt-2">
                  <ImageUploader label="image" onUploaded={(urls) => setValue('image', urls[0])} />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}