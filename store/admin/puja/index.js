import { apiSlice } from "../../apiSlice";

export const pujaSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDurgaPuja: builder.mutation({
      query: (data) => ({
        url: "/durga-puja/create",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
    useCreateDurgaPujaMutation
} = pujaSlice;
