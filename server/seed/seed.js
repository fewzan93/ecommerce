import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import Review from '../models/Review.js'
import Coupon from '../models/Coupon.js'
import { slugify } from '../utils/slugify.js'

const img = (seed, w = 800, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

const categories = [
  {
    name: 'Electronics',
    description: 'Phones, laptops, audio and smart gadgets',
    image: img('electronics', 1200, 500),
  },
  {
    name: 'Fashion',
    description: 'Clothing, footwear and accessories for everyone',
    image: img('fashion', 1200, 500),
  },
  {
    name: 'Home & Kitchen',
    description: 'Everything to make your home comfortable',
    image: img('home', 1200, 500),
  },
  {
    name: 'Beauty & Care',
    description: 'Skincare, makeup and personal care essentials',
    image: img('beauty', 1200, 500),
  },
  {
    name: 'Sports & Outdoors',
    description: 'Gear for fitness, travel and adventure',
    image: img('sports', 1200, 500),
  },
  {
    name: 'Books',
    description: 'Bestsellers, classics and new releases',
    image: img('books', 1200, 500),
  },
]

const productsData = [
  // Electronics
  {
    name: 'Aurora Wireless Headphones Pro',
    description:
      'Premium over-ear wireless headphones with active noise cancellation, 40-hour battery life, and crystal-clear call quality. Includes a hard travel case and USB-C fast charging.',
    shortDescription: 'ANC over-ear headphones with 40h battery',
    price: 249.99,
    compareAtPrice: 329.99,
    images: [img('headphones-1'), img('headphones-2'), img('headphones-3')],
    category: 'Electronics',
    stock: 34,
    brand: 'Aurora',
    featured: true,
    rating: 4.7,
    numReviews: 128,
  },
  {
    name: 'Nova 14 Smartphone 256GB',
    description:
      'Flagship smartphone with a 6.7" AMOLED 120Hz display, triple 50MP camera system, 256GB storage and all-day battery with 80W fast charging.',
    shortDescription: '6.7" AMOLED, triple camera, 256GB',
    price: 899.0,
    compareAtPrice: 999.0,
    images: [img('phone-1'), img('phone-2'), img('phone-3')],
    category: 'Electronics',
    stock: 20,
    brand: 'Nova',
    featured: true,
    rating: 4.8,
    numReviews: 342,
  },
  {
    name: 'LiteBook Air 14" Laptop',
    description:
      'Ultra-light 14" laptop with a 2.8K display, 16GB RAM, 512GB SSD and 18-hour battery life. Perfect for work, study and travel.',
    shortDescription: '2.8K display, 16GB RAM, 512GB SSD',
    price: 749.0,
    compareAtPrice: 899.0,
    images: [img('laptop-1'), img('laptop-2')],
    category: 'Electronics',
    stock: 12,
    brand: 'LiteBook',
    featured: true,
    rating: 4.6,
    numReviews: 97,
  },
  {
    name: 'SoundCore Mini Bluetooth Speaker',
    description:
      'Pocket-sized waterproof Bluetooth speaker with surprisingly big sound, 12-hour playtime and a built-in mic for calls.',
    shortDescription: 'Waterproof portable speaker, 12h playtime',
    price: 49.99,
    images: [img('speaker-1'), img('speaker-2')],
    category: 'Electronics',
    stock: 60,
    brand: 'SoundCore',
    rating: 4.4,
    numReviews: 210,
  },
  {
    name: 'TechWatch GT4 Smartwatch',
    description:
      'Advanced smartwatch with AMOLED display, heart-rate and SpO2 monitoring, GPS, and 14-day battery life. Compatible with iOS and Android.',
    shortDescription: 'AMOLED smartwatch with GPS, 14-day battery',
    price: 199.0,
    compareAtPrice: 249.0,
    images: [img('watch-1'), img('watch-2')],
    category: 'Electronics',
    stock: 45,
    brand: 'TechWatch',
    featured: true,
    rating: 4.5,
    numReviews: 154,
  },
  // Fashion
  {
    name: 'Classic Denim Jacket',
    description:
      'Timeless medium-wash denim jacket with a comfortable regular fit. Pre-washed for softness with durable stitching and brass buttons.',
    shortDescription: 'Regular-fit medium-wash denim jacket',
    price: 79.99,
    compareAtPrice: 99.99,
    images: [img('denim-1'), img('denim-2')],
    category: 'Fashion',
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Medium Wash', hex: '#4a6fa5' },
      { name: 'Dark Wash', hex: '#2b3a5c' },
    ],
    brand: 'UrbanWear',
    featured: true,
    rating: 4.3,
    numReviews: 76,
  },
  {
    name: 'Everyday Sneakers',
    description:
      'Lightweight everyday sneakers with breathable mesh upper, cushioned insole and grippy rubber outsole. True to size.',
    shortDescription: 'Breathable mesh everyday sneakers',
    price: 64.99,
    compareAtPrice: 85.0,
    images: [img('sneakers-1'), img('sneakers-2')],
    category: 'Fashion',
    stock: 55,
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: [
      { name: 'White', hex: '#f5f5f5' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    brand: 'Stride',
    rating: 4.6,
    numReviews: 188,
  },
  {
    name: 'Merino Wool Crew Sweater',
    description:
      'Soft 100% merino wool crew-neck sweater that keeps you warm without the bulk. Machine washable on gentle cycle.',
    shortDescription: '100% merino wool crew sweater',
    price: 89.99,
    compareAtPrice: 119.99,
    images: [img('sweater-1'), img('sweater-2')],
    category: 'Fashion',
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal', hex: '#3d3d3d' },
      { name: 'Cream', hex: '#f1e8d8' },
    ],
    brand: 'UrbanWear',
    rating: 4.7,
    numReviews: 64,
  },
  {
    name: 'Canvas Tote Bag',
    description:
      'Heavy-duty canvas tote with reinforced handles and an interior zip pocket. Holds a 15" laptop with room to spare.',
    shortDescription: 'Heavy-duty canvas tote, fits 15" laptop',
    price: 24.99,
    images: [img('tote-1'), img('tote-2')],
    category: 'Fashion',
    stock: 90,
    colors: [
      { name: 'Natural', hex: '#d9c9a3' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Olive', hex: '#5d6b4e' },
    ],
    brand: 'Stride',
    rating: 4.5,
    numReviews: 143,
  },
  {
    name: 'Aviator Sunglasses',
    description:
      'Classic aviator sunglasses with UV400 protection, metal frame and adjustable nose pads. Includes a microfiber pouch.',
    shortDescription: 'UV400 aviator sunglasses with case',
    price: 39.99,
    compareAtPrice: 59.99,
    images: [img('aviator-1'), img('aviator-2')],
    category: 'Fashion',
    stock: 70,
    brand: 'Vista',
    rating: 4.2,
    numReviews: 51,
  },
  // Home & Kitchen
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description:
      'Hand-finished ceramic pour-over brewer with matching carafe and permanent filter. Makes 1-2 cups of rich, clean coffee.',
    shortDescription: 'Ceramic pour-over brewer + carafe set',
    price: 45.0,
    compareAtPrice: 59.0,
    images: [img('coffee-1'), img('coffee-2')],
    category: 'Home & Kitchen',
    stock: 32,
    brand: 'HomeCraft',
    featured: true,
    rating: 4.8,
    numReviews: 89,
  },
  {
    name: 'Cast Iron Skillet 12"',
    description:
      'Pre-seasoned 12-inch cast iron skillet for stovetop and oven use. Retains heat beautifully and lasts a lifetime with proper care.',
    shortDescription: 'Pre-seasoned 12" cast iron skillet',
    price: 54.99,
    compareAtPrice: 69.99,
    images: [img('skillet-1'), img('skillet-2')],
    category: 'Home & Kitchen',
    stock: 28,
    brand: 'HomeCraft',
    rating: 4.9,
    numReviews: 231,
  },
  {
    name: 'Memory Foam Pillow (2-Pack)',
    description:
      'Cooling gel memory foam pillows that support your neck and align your spine. Includes removable, washable covers.',
    shortDescription: 'Cooling gel memory foam pillows, 2-pack',
    price: 59.99,
    compareAtPrice: 89.99,
    images: [img('pillow-1'), img('pillow-2')],
    category: 'Home & Kitchen',
    stock: 48,
    brand: 'RestWell',
    rating: 4.4,
    numReviews: 320,
  },
  {
    name: 'Stainless Steel Cookware Set (10-Piece)',
    description:
      'Tri-ply stainless steel cookware set with encapsulated aluminum core for even heating. Includes pots, pans and lids. Dishwasher safe.',
    shortDescription: '10-piece tri-ply stainless steel set',
    price: 299.0,
    compareAtPrice: 449.0,
    images: [img('cookware-1'), img('cookware-2'), img('cookware-3')],
    category: 'Home & Kitchen',
    stock: 10,
    brand: 'ChefPro',
    featured: true,
    rating: 4.7,
    numReviews: 105,
  },
  {
    name: 'Smart LED Bulb (4-Pack)',
    description:
      'Wi-Fi enabled smart LED bulbs with 16 million colors, dimmable, and works with Alexa and Google Home. 9W (60W equivalent).',
    shortDescription: 'Wi-Fi smart bulbs, 16M colors, 4-pack',
    price: 39.99,
    compareAtPrice: 49.99,
    images: [img('bulb-1'), img('bulb-2')],
    category: 'Home & Kitchen',
    stock: 80,
    brand: 'BrightHub',
    rating: 4.3,
    numReviews: 167,
  },
  // Beauty & Care
  {
    name: 'Vitamin C Glow Serum',
    description:
      'Brightening vitamin C serum with hyaluronic acid and vitamin E. Reduces dark spots and evens skin tone. For all skin types.',
    shortDescription: 'Brightening vitamin C + hyaluronic serum',
    price: 29.99,
    compareAtPrice: 39.99,
    images: [img('serum-1'), img('serum-2')],
    category: 'Beauty & Care',
    stock: 100,
    brand: 'GlowLab',
    featured: true,
    rating: 4.6,
    numReviews: 412,
  },
  {
    name: 'Spa Essentials Gift Set',
    description:
      'Luxury gift set with bath salts, body butter, essential oil candle and a loofah. Beautifully boxed — ready to gift.',
    shortDescription: 'Luxury spa gift set, boxed',
    price: 49.99,
    images: [img('spa-1'), img('spa-2')],
    category: 'Beauty & Care',
    stock: 36,
    brand: 'GlowLab',
    rating: 4.8,
    numReviews: 74,
  },
  {
    name: 'Matte Lipstick Trio',
    description:
      'Three long-wear matte lipsticks in universally flattering shades. Velvety texture that lasts up to 12 hours.',
    shortDescription: 'Long-wear matte lipstick, 3 shades',
    price: 34.99,
    compareAtPrice: 45.0,
    images: [img('lipstick-1'), img('lipstick-2')],
    category: 'Beauty & Care',
    stock: 62,
    brand: 'Velvet',
    rating: 4.5,
    numReviews: 203,
  },
  {
    name: 'Electric Facial Cleansing Brush',
    description:
      'Waterproof silicone facial cleansing brush with 4 speed settings and 7-day battery life. Gentle on sensitive skin.',
    shortDescription: 'Waterproof silicone cleansing brush',
    price: 27.99,
    compareAtPrice: 36.99,
    images: [img('brush-1'), img('brush-2')],
    category: 'Beauty & Care',
    stock: 44,
    brand: 'GlowLab',
    rating: 4.2,
    numReviews: 119,
  },
  {
    name: 'Hydrating Face Cream SPF 30',
    description:
      'Daily moisturizer with SPF 30 protection, niacinamide and ceramides. Lightweight, non-greasy, fragrance-free.',
    shortDescription: 'Daily moisturizer with SPF 30',
    price: 22.99,
    images: [img('cream-1'), img('cream-2')],
    category: 'Beauty & Care',
    stock: 88,
    brand: 'DermaPure',
    rating: 4.4,
    numReviews: 256,
  },
  // Sports & Outdoors
  {
    name: 'Pro Yoga Mat 6mm',
    description:
      'Non-slip, eco-friendly TPE yoga mat with alignment lines and carry strap. Extra cushioning for joints, easy to clean.',
    shortDescription: '6mm non-slip TPE yoga mat with strap',
    price: 34.99,
    compareAtPrice: 44.99,
    images: [img('yoga-1'), img('yoga-2')],
    category: 'Sports & Outdoors',
    stock: 50,
    colors: [
      { name: 'Mint', hex: '#a8d8c8' },
      { name: 'Lavender', hex: '#c3b6e8' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    brand: 'FlexFit',
    rating: 4.7,
    numReviews: 198,
  },
  {
    name: 'Insulated Water Bottle 32oz',
    description:
      'Double-wall vacuum insulated steel bottle keeps drinks cold 24 hours or hot 12 hours. Leak-proof lid, fits cup holders.',
    shortDescription: '32oz vacuum insulated steel bottle',
    price: 29.99,
    compareAtPrice: 39.99,
    images: [img('bottle-1'), img('bottle-2')],
    category: 'Sports & Outdoors',
    stock: 120,
    colors: [
      { name: 'Matte Black', hex: '#1a1a1a' },
      { name: 'Ocean Blue', hex: '#3a7ca5' },
    ],
    brand: 'FlexFit',
    featured: true,
    rating: 4.8,
    numReviews: 567,
  },
  {
    name: 'Foldable Camping Chair',
    description:
      'Lightweight aluminum camping chair with padded armrests, cup holder and carry bag. Supports up to 120kg.',
    shortDescription: 'Foldable aluminum camping chair',
    price: 44.99,
    compareAtPrice: 59.99,
    images: [img('chair-1'), img('chair-2')],
    category: 'Sports & Outdoors',
    stock: 38,
    brand: 'TrailMax',
    rating: 4.5,
    numReviews: 92,
  },
  {
    name: 'Adjustable Dumbbell Pair 20kg',
    description:
      'Two adjustable dumbbells from 2.5kg to 20kg per pair with a twist-lock system. Compact storage tray included.',
    shortDescription: 'Adjustable dumbbells, 2.5-10kg each',
    price: 119.0,
    compareAtPrice: 149.0,
    images: [img('dumbbell-1'), img('dumbbell-2')],
    category: 'Sports & Outdoors',
    stock: 16,
    brand: 'IronCore',
    rating: 4.6,
    numReviews: 84,
  },
  {
    name: 'Trail Running Backpack 10L',
    description:
      'Ultralight 10L hydration backpack with 1.5L bladder, chest straps, and reflective details for night runs.',
    shortDescription: '10L hydration vest with 1.5L bladder',
    price: 59.99,
    images: [img('pack-1'), img('pack-2')],
    category: 'Sports & Outdoors',
    stock: 22,
    brand: 'TrailMax',
    rating: 4.4,
    numReviews: 67,
  },
  // Books
  {
    name: 'The Midnight Library',
    description:
      'Between life and death there is a library, and within that library the shelves go on forever. A bestselling novel about the choices we make and the lives we could have lived.',
    shortDescription: 'Bestselling novel by Matt Haig',
    price: 14.99,
    compareAtPrice: 19.99,
    images: [img('book-1'), img('book-2')],
    category: 'Books',
    stock: 75,
    brand: 'Penguin',
    rating: 4.6,
    numReviews: 890,
  },
  {
    name: 'Atomic Habits',
    description:
      'An easy and proven way to build good habits and break bad ones. The #1 New York Times bestseller on habit formation.',
    shortDescription: 'Habit-building guide by James Clear',
    price: 16.99,
    compareAtPrice: 21.99,
    images: [img('book-2'), img('book-3')],
    category: 'Books',
    stock: 110,
    brand: 'Avery',
    featured: true,
    rating: 4.8,
    numReviews: 1240,
  },
  {
    name: 'The Psychology of Money',
    description:
      'Timeless lessons on wealth, greed, and happiness — an accessible guide to how money works and how to think about it.',
    shortDescription: 'Personal finance classic by Morgan Housel',
    price: 17.99,
    images: [img('book-3'), img('book-4')],
    category: 'Books',
    stock: 95,
    brand: 'Harriman House',
    rating: 4.7,
    numReviews: 734,
  },
  {
    name: 'Dune',
    description:
      'The epic science fiction masterpiece that inspired the films. Set on the desert planet Arrakis, a tale of power, faith and survival.',
    shortDescription: 'Sci-fi masterpiece by Frank Herbert',
    price: 12.99,
    compareAtPrice: 15.99,
    images: [img('book-4'), img('book-5')],
    category: 'Books',
    stock: 60,
    brand: 'Ace',
    rating: 4.7,
    numReviews: 456,
  },
  {
    name: 'The Art of War (Illustrated)',
    description:
      'The ancient classic on strategy and leadership, newly illustrated with commentary for modern readers.',
    shortDescription: 'Illustrated classic by Sun Tzu',
    price: 18.99,
    images: [img('book-5'), img('book-6')],
    category: 'Books',
    stock: 40,
    brand: 'Penguin Classics',
    rating: 4.5,
    numReviews: 312,
  },
]

const coupons = [
  { code: 'WELCOME10', discountType: 'percent', discountValue: 10, minOrder: 0, maxDiscount: 100, expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000) },
  { code: 'SAVE20', discountType: 'percent', discountValue: 20, minOrder: 100, maxDiscount: 250, expiresAt: new Date(Date.now() + 15 * 24 * 3600 * 1000) },
  { code: 'FLAT15', discountType: 'flat', discountValue: 15, minOrder: 50, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) },
]

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[seed] MONGODB_URI not set. Copy .env.example to .env first.')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('[seed] Connected to MongoDB')

    await Promise.all([
      Review.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
    ])
    await User.deleteMany({})
    console.log('[seed] Cleared existing data')

    const admin = await User.create({
      name: 'Store Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      phone: '+92 300 0000000',
    })

    const demoUser = await User.create({
      name: 'Demo User',
      email: 'user@example.com',
      password: 'user123',
      phone: '+92 300 1111111',
    })

    console.log('[seed] Users created:')
    console.log(`  Admin -> admin@example.com / admin123`)
    console.log(`  User  -> user@example.com / user123`)

    const catMap = {}
    for (const c of categories) {
      const created = await Category.create({
        ...c,
        slug: slugify(c.name),
      })
      catMap[c.name] = created._id
    }
    console.log(`[seed] ${categories.length} categories created`)

    const products = []
    for (const p of productsData) {
      const { category, ...rest } = p
      products.push({
        ...rest,
        category: catMap[category],
        slug: slugify(p.name),
      })
    }
    await Product.insertMany(products)
    console.log(`[seed] ${products.length} products created`)

    await Coupon.insertMany(coupons)
    console.log(`[seed] ${coupons.length} coupons created`)

    await mongoose.disconnect()
    console.log('[seed] Done!')
  } catch (err) {
    console.error('[seed] Failed:', err)
    process.exit(1)
  }
}

seed()