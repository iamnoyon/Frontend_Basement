import { apiSlice } from "../apiSlice";

// /union/list and /ward/list now wrap their rows in { success, message, data }; the map code expects the bare
// array, so unwrap here (still accepting a bare array from older backends).
const unwrapRows = (response) => (Array.isArray(response) ? response : response?.data ?? []);

export const publicMapSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUnionsCoverage: builder.query({
      query: () => ({
        url: "/union/list",
        method: "GET",
      }),
      transformResponse: unwrapRows,
    }),
    getWardsCoverage: builder.query({
      query: () => ({
        url: "/ward/list",
        method: "GET",
      }),
      transformResponse: unwrapRows,
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
    }),
    getFeatureById: builder.query({
      query: ({featureId})=>({
        url: `/feature/${featureId}`,
        method: 'GET'
      })
    }),
    updateFeatureById: builder.mutation({
      query: ({featureId, data})=>({
        url: `/feature/${featureId}`,
        method: 'PUT',
        body: data
      })
    }),
    getDurgaPujaList: builder.query({
      query: ({featureId})=>({
        url: '/durga-puja/list',
        method: 'GET',
        params: { feature_id: featureId }
      })
    }),
    getUnionDropdown: builder.query({
      query: ()=>({
        url: '/union/dropdown',
        method: "GET"
      })
    }),
    getWardDropdown: builder.query({
      query: (params) =>({
        url: '/ward/dropdown',
        method: 'GET',
        params
      })
    })
  }),
  overrideExisting: true,
});

export const {
    useGetUnionsCoverageQuery,
    useGetWardsCoverageQuery,
    useGetResultByFeatureIdQuery,
    useGetFeaturesDropdownQuery,
    useGetFeatureByIdQuery,
    useUpdateFeatureByIdMutation,
    useGetDurgaPujaListQuery,
    useGetUnionDropdownQuery,
    useLazyGetWardDropdownQuery
} = publicMapSlice;
