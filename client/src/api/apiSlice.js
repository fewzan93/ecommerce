import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: [
    'User',
    'Product',
    'Category',
    'Order',
    'Coupon',
    'Review',
    'Wishlist',
    'AdminStats',
  ],
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => '/health',
    }),
  }),
})

export const { useGetHealthQuery } = apiSlice
