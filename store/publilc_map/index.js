import { apiSlice } from "../apiSlice";

// /union/list and /ward/list now wrap their rows in { success, message, data }; the map code expects the bare
// array, so unwrap here (still accepting a bare array from older backends).
const unwrapRows = (response) => (Array.isArray(response) ? response : response?.data ?? []);

// /durga-puja/list sends { data: { [union_name]: { "ward-1": [villages], ..., or "paurashava": [villages] } } };
// flatten it to one row per ward: { key, union_name, ward_no (null for a whole area), villages }.
// An already-flat array (older backend) is passed through.
const flattenPujaList = (response) => {
  const data = response?.data;
  if (!data || Array.isArray(data)) return response;
  const rows = Object.entries(data).flatMap(([union_name, wards]) =>
    Object.entries(wards ?? {}).map(([wardKey, villages]) => {
      const wardNo = Number(/^ward-(\d+)$/.exec(wardKey)?.[1]);
      return {
        key: `${union_name}-${wardKey}`,
        union_name,
        ward_no: Number.isFinite(wardNo) ? wardNo : null,
        villages: Array.isArray(villages) ? villages : [],
      };
    }),
  );
  return { ...response, data: rows };
};

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
      }),
      transformResponse: flattenPujaList,
    }),
    getDurgaPujaDetail: builder.query({
      query: ({unionId, wardCode, featureId})=>({
        url: '/durga-puja/detail',
        method: 'GET',
        params: { union_id: unionId, ward_code: wardCode, feature_id: featureId }
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
    useGetDurgaPujaDetailQuery,
    useGetUnionDropdownQuery,
    useLazyGetWardDropdownQuery
} = publicMapSlice;
