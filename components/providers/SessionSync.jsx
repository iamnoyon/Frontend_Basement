"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { setUser, setToken } from "@/store/user";
import { useProfileQuery } from "@/store/auth";
import { performLogout } from "@/utils/logout";

export default function SessionSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  // Get backend token from NextAuth session
  const token = session?.user?.backendToken;

  // Sync NextAuth token → Redux
  useEffect(() => {
    if (status === "authenticated" && token) {
      dispatch(setToken(token));
    }

    // Clear Redux token when logged out
    if (status === "unauthenticated") {
      dispatch(setToken(null));
    }
  }, [status, token, dispatch]);

  // Profile API
  // RTK Query will get the token from Redux automatically
  const {
    data: profileData,
    isError,
    error,
  } = useProfileQuery(undefined, {
    skip: status !== "authenticated",
  });

  // Store profile/user in Redux
  useEffect(() => {
    if (profileData?.data) {
      dispatch(setUser(profileData.data));
    }
  }, [profileData, dispatch]);

  // Logout only when authentication fails
  useEffect(() => {
    if (isError && token) {
      performLogout();
    }
  }, [isError, token]);

  return null;
}

