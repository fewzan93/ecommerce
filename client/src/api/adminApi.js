import { apiSlice } from './apiSlice'

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats', 'Order', 'Product', 'User'],
    }),
    getUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'AdminStats'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'AdminStats'],
    }),
    getAdminReviews: builder.query({
      query: () => '/admin/reviews',
      providesTags: ['Review'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Product', 'AdminStats'],
    }),
    uploadImages: builder.mutation({
      query: (files) => {
        const formData = new FormData()
        files.forEach((file) => formData.append('images', file))
        return {
          url: '/admin/upload',
          method: 'POST',
          body: formData,
        }
      },
    }),
  }),
})

export const {
  useGetStatsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
  useUploadImagesMutation,
} = adminApi