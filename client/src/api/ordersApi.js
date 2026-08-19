import { apiSlice } from './apiSlice'

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (data) => ({
        url: '/orders/checkout',
        method: 'POST',
        body: data,
      }),
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    getOrderBySession: builder.query({
      query: (sessionId) => `/orders/session/${sessionId}`,
      providesTags: ['Order'],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),
    getAllOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Order', 'AdminStats'],
    }),
  }),
})

export const {
  useCheckoutMutation,
  useGetOrderQuery,
  useGetOrderBySessionQuery,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersApi