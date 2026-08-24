import { siteConfig } from "@/config/siteConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: siteConfig?.baseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.user?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
  tagTypes: ["userlist", "Categories", "Products", "tables", "expenses", "Orders", "Packages", "Business", "Payments", "health"]
});