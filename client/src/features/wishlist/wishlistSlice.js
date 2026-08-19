import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const item = action.payload
      const exists = state.items.find((i) => i.id === item.id)
      if (exists) {
        state.items = state.items.filter((i) => i.id !== item.id)
      } else {
        state.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.images?.[0],
          slug: item.slug,
        })
      }
    },
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions

export const selectWishlistItems = (state) => state.wishlist.items
export const selectIsWishlisted = (state, id) =>
  state.wishlist.items.some((i) => i.id === id)

export default wishlistSlice.reducer
