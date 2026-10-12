import { transformListResponse } from "@/utils/responseTransformer";
import { apiSlice } from "../../apiSlice";

export const featureSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureList: builder.query({
      query: () => ({
        url: "/feature/list",
        method: "GET",
      }),
      providesTags: ['featurelist']
    }),
    createFeature: builder.mutation({
      query: (data)=>({
        url: '/feature/create',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['featurelist']
    }),
    updateFeatureStatus: builder.mutation({
      query: ({id, data})=>({
        url: `/feature/${id}/status`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['featurelist']
    })
  }),
  overrideExisting: true,
});

export const {
    useGetFeatureListQuery,
    useCreateFeatureMutation,
    useUpdateFeatureStatusMutation
} = featureSlice;
