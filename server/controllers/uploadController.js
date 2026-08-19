import multer from 'multer'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new ApiError(400, 'Only image files are allowed'))
  },
})

export const uploadImages = [
  upload.array('images', 5),
  asyncHandler(async (req, res) => {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(500, 'Cloudinary is not configured on the server')
    }
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'No image files received')
    }

    const urls = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file.buffer).then((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
        }))
      )
    )

    res.json({ success: true, images: urls })
  }),
]