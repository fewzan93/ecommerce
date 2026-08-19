import { apiSlice } from './apiSlice'

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Product'],
    }),
    getRelatedProducts: builder.query({
      query: (id) => `/products/related/${id}`,
    }),
    createReview: builder.mutation({
      query: ({ id, rating, comment }) => ({
        url: `/products/${id}/reviews`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product', 'AdminStats'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product', 'AdminStats'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'AdminStats'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useCreateReviewMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi