import { transformListResponse } from "@/utils/responseTransformer";
import { apiSlice } from "../../apiSlice";

export const dashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSummaryCard: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: "/dashboard/summary",
        method: "GET",
        params: {
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
    }),
    getAdminChart: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: '/dashboard/charts',
        method: "GET",
        params: {
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      })
    }),
    getRecentOderList: builder.query({
      query: (params) => ({
        url: '/dashboard/recent-orders',
        method: 'GET',
        params
      })
    }),
    getSuperAdminSummaryCard: builder.query({
      query: (params) => ({
        url: '/dashboard/admin/overview',
        method: 'GET',
        params
      })
    }),
    getSuperAdminCharts: builder.query({
      query: (params) => ({
        url: '/dashboard/admin/charts',
        method: 'GET',
        params
      })
    }),
    getExpiringBusinesses: builder.query({
      query: (params) => ({
        url: '/dashboard/admin/expiring-businesses',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => transformListResponse(response),
    })
  }),
  overrideExisting: true,
});

export const {
    useGetAdminSummaryCardQuery,
    useGetAdminChartQuery,
    useGetRecentOderListQuery,
    useGetSuperAdminSummaryCardQuery,
    useLazyGetSuperAdminChartsQuery,
    useLazyGetAdminSummaryCardQuery,
    useLazyGetAdminChartQuery,
    useLazyGetExpiringBusinessesQuery
} = dashboardSlice;
