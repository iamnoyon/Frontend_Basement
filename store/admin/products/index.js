import { apiSlice } from "../../apiSlice";
import { transformListResponse } from "@/utils/responseTransformer";

export const productSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    getProductList: builder.query({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: ["Products"],
      transformResponse: (response) => transformListResponse(response),
    }),
    getProductById: builder.query({
      query: ({ id }) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
    }),
    updateProductByID: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    getProductDropdown: builder.query({
      query: () => ({
        url: `/products/dropdown`,
        method: "GET",
      }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    updateStock: builder.mutation({
      query: ({id, data}) => ({
        url: `/products/${id}/stock`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Products"],
    }),
    getProductsByCategory: builder.query({
      query: (params) => ({
        url: `/products/by-category`,
        method: "GET",
        params
      }),
      keepUnusedDataFor: Infinity, // cached api call
    })
  }),
  overrideExisting: true,
});

export const {
  useCreateProductMutation,
  useUpdateProductByIDMutation,
  useLazyGetProductListQuery,
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useUpdateStockMutation,
  useLazyGetProductsByCategoryQuery
} = productSlice;
