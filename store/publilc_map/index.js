import { apiSlice } from "../apiSlice";

export const publicMapSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUnionsCoverage: builder.query({
      query: () => ({
        url: "/union/list",
        method: "GET",
      }),
    }),
    getWardsCoverage: builder.query({
      query: () => ({
        url: "/ward/list",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
    useGetUnionsCoverageQuery,
    useGetWardsCoverageQuery,
} = publicMapSlice;
