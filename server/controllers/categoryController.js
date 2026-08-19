import Category from '../models/Category.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { slugify } from '../utils/slugify.js'

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 })

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({
        category: cat._id,
        isActive: true,
      })
      return { ...cat.toObject(), productCount: count }
    })
  )

  res.json({ success: true, categories: categoriesWithCounts })
})

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
  if (!category) throw new ApiError(404, 'Category not found')
  res.json({ success: true, category })
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body
  if (!name) throw new ApiError(400, 'Category name is required')

  const slug = slugify(name)
  const exists = await Category.findOne({ slug })
  if (exists) throw new ApiError(409, 'A category with this name already exists')

  const category = await Category.create({ name, slug, description, image })
  res.status(201).json({ success: true, message: 'Category created', category })
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw new ApiError(404, 'Category not found')

  const { name, description, image, isActive } = req.body
  if (name !== undefined) {
    category.name = name
    category.slug = slugify(name)
  }
  if (description !== undefined) category.description = description
  if (image !== undefined) category.image = image
  if (isActive !== undefined) category.isActive = isActive

  await category.save()
  res.json({ success: true, message: 'Category updated', category })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw new ApiError(404, 'Category not found')

  const productCount = await Product.countDocuments({ category: category._id })
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete — ${productCount} product(s) use this category. Move or delete them first.`
    )
  }

  await category.deleteOne()
  res.json({ success: true, message: 'Category deleted' })
})