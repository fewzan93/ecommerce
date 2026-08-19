import { apiSlice } from './apiSlice'

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: data,
      }),
    }),
    getCoupons: builder.query({
      query: () => '/coupons',
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (data) => ({
        url: '/coupons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupon', 'AdminStats'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/coupons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon', 'AdminStats'],
    }),
  }),
})

export const {
  useValidateCouponMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi