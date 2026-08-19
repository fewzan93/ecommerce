import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Review from '../models/Review.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { slugify } from '../utils/slugify.js'

const normalizeSlug = (name) => {
  const base = slugify(name)
  if (base) return base
  throw new ApiError(400, 'Product name must produce a valid slug')
}

const getUniqueSlug = async (name, excludeId) => {
  const base = normalizeSlug(name)
  let slug = base
  let n = 1
  while (await Product.findOne({ slug, _id: { $ne: excludeId } })) {
    slug = `${base}-${n++}`
  }
  return slug
}

export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword = '',
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query

  const query = { isActive: true }

  if (keyword) {
    query.$text = { $search: keyword }
  }

  if (category) {
    const cat = await Category.findOne({ slug: category })
    if (cat) query.category = cat._id
    else query.category = null
  }

  if (brand) query.brand = brand

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {}
    if (minPrice !== undefined) query.price.$gte = Number(minPrice)
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice)
  }

  if (rating) {
    query.rating = { $gte: Number(rating) }
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1, numReviews: -1 },
    'name-asc': { name: 1 },
    featured: { featured: -1, createdAt: -1 },
  }

  const pageNum = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12))
  const skip = (pageNum - 1) * limitNum

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ])

  res.json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .lean()
  if (!product) throw new ApiError(404, 'Product not found')

  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .lean()

  res.json({ success: true, product: { ...product, reviews } })
})

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .lean()

  res.json({ success: true, products: related })
})

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    price,
    compareAtPrice,
    images,
    category,
    stock,
    sizes,
    colors,
    brand,
    featured,
  } = req.body

  if (!name || !description || price === undefined || !category) {
    throw new ApiError(400, 'Name, description, price and category are required')
  }

  const cat = await Category.findById(category)
  if (!cat) throw new ApiError(400, 'Invalid category')

  const slug = await getUniqueSlug(name)

  const product = await Product.create({
    name,
    slug,
    description,
    shortDescription,
    price,
    compareAtPrice,
    images: images || [],
    category,
    stock: stock ?? 0,
    sizes: sizes || [],
    colors: colors || [],
    brand,
    featured: !!featured,
  })

  res.status(201).json({ success: true, message: 'Product created', product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')

  const { name, category, images, ...rest } = req.body

  if (name !== undefined && name !== product.name) {
    product.slug = await getUniqueSlug(name, product._id)
    product.name = name
  }
  if (category !== undefined) {
    const cat = await Category.findById(category)
    if (!cat) throw new ApiError(400, 'Invalid category')
    product.category = category
  }
  if (images !== undefined) product.images = images

  const updatableFields = [
    'description',
    'shortDescription',
    'price',
    'compareAtPrice',
    'stock',
    'sizes',
    'colors',
    'brand',
    'featured',
    'isActive',
  ]
  for (const field of updatableFields) {
    if (rest[field] !== undefined) product[field] = rest[field]
  }

  await product.save()
  res.json({ success: true, message: 'Product updated', product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')

  await Review.deleteMany({ product: product._id })
  await product.deleteOne()
  res.json({ success: true, message: 'Product deleted' })
})

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  if (!rating || !comment) {
    throw new ApiError(400, 'Rating and comment are required')
  }

  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')

  const existing = await Review.findOne({ product: product._id, user: req.user._id })
  if (existing) throw new ApiError(409, 'You have already reviewed this product')

  await Review.create({
    user: req.user._id,
    product: product._id,
    rating: Number(rating),
    comment,
  })

  const [numReviews, avg] = await Promise.all([
    Review.countDocuments({ product: product._id }),
    Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]),
  ])

  product.numReviews = numReviews
  product.rating = Math.round((avg[0]?.avg || 0) * 10) / 10
  await product.save()

  res.status(201).json({ success: true, message: 'Review submitted' })
})