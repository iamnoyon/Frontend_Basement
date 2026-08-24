import { apiSlice } from "../../apiSlice";

export const healthSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSystemHealth: builder.query({
      query: () => ({
        url: "/health/current",
        method: "GET",
      }),
      invalidatesTags: ["health"],
    }),
  }),
  overrideExisting: true,
});

export const {
    useGetSystemHealthQuery
} = healthSlice;
