import { useId, useRef, useState } from 'react'
import { useUploadImagesMutation } from '../api/adminApi'

export default function ImageUploader({ onUploaded, label, multiple = false, max = 5 }) {
  const [uploadImages, { isLoading }] = useUploadImagesMutation()
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const inputId = useId()

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setError('')
    try {
      const res = await uploadImages(multiple ? files.slice(0, max) : [files[0]]).unwrap()
      onUploaded(res.images.map((img) => img.url))
    } catch (err) {
      setError(err.data?.message || 'Upload failed')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-brand-600 hover:text-brand-600 disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : `Upload ${label}${multiple ? ` (up to ${max})` : ''}`}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}