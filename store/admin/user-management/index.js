import { apiSlice } from "../../apiSlice";
import { transformListResponse } from "@/utils/responseTransformer";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
    }),
    getUserList: builder.query({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: ["userlist"],
      transformResponse: (response) => transformListResponse(response),
    }),
    getUserInfoById: builder.query({
      query: ({id}) => ({
        url: `/users/${id}`,
        method: 'GET'
      })
    }),
    updateUserInfo: builder.mutation({
      query: ({id, data})=>({
        url: `/users/${id}`,
        method: "PATCH",
        body: data 
      })
    }),
    getPermissionsByUserId: builder.query({
      query: ({id})=>({
        url: `/permissions/users/${id}`,
        method: 'GET'
      })
    }),
    updatePermissionsByUserId: builder.mutation({
      query: ({id, data})=>({
        url: `/permissions/users/${id}`,
        method: 'PUT',
        body: data
      })
    }),
    getWaiterList: builder.query({
      query: ()=>({
        url: '/users/waiters',
        method: 'GET'
      })
    }),
    getAdminWithBusiness: builder.query({
      query: () => ({
        url: '/users/admin-with-business',
        method: 'GET',
      }),
      providesTags: ['userlist'],
    }),
    updateUserStatus: builder.mutation({
      query: ({id, data})=>({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['userlist']
    })
  }),
  overrideExisting: true,
});

export const {
  useCreateUserMutation,
  useLazyGetUserListQuery,
  useUpdateUserStatusMutation,
  useGetUserInfoByIdQuery,
  useUpdateUserInfoMutation,
  useGetPermissionsByUserIdQuery,
  useUpdatePermissionsByUserIdMutation,
  useGetWaiterListQuery,
  useGetAdminWithBusinessQuery,
  useup
} = userApiSlice;
