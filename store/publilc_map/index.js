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
    getResultByFeatureId: builder.query({
      query: ({featureId})=>({
        url: `/feature/result/${featureId}`,
        method: "GET",
      })
    }),
    getFeaturesDropdown: builder.query({
      query: ()=>({
        url: '/feature/dropdown',
        method: 'GET'
      })
    })
  }),
  overrideExisting: true,
});

export const {
    useGetUnionsCoverageQuery,
    useGetWardsCoverageQuery,
    useGetResultByFeatureIdQuery,
    useGetFeaturesDropdownQuery
} = publicMapSlice;
