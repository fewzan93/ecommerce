import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  coupon: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, qty = 1, variant = null } = action.payload
      const id = product.id || product._id
      const existing = state.items.find(
        (item) => item.id === id && item.variant === variant
      )
      if (existing) {
        existing.qty += qty
      } else {
        state.items.push({
          id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock,
          qty,
          variant,
        })
      }
    },
    updateQty: (state, action) => {
      const { id, variant, qty } = action.payload
      const item = state.items.find(
        (i) => i.id === id && i.variant === variant
      )
      if (item) item.qty = Math.max(1, qty)
    },
    removeFromCart: (state, action) => {
      const { id, variant } = action.payload
      state.items = state.items.filter(
        (i) => !(i.id === id && i.variant === variant)
      )
    },
    setCoupon: (state, action) => {
      state.coupon = action.payload
    },
    clearCart: (state) => {
      state.items = []
      state.coupon = null
    },
  },
})

export const { addToCart, updateQty, removeFromCart, setCoupon, clearCart } =
  cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartCoupon = (state) => state.cart.coupon
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0)
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)

export default cartSlice.reducer
