"use client";
import { signOut } from "next-auth/react";

export async function performLogout() {
  try {
    await signOut({ redirect: false });
  } catch {}

  window.location.replace("/");
}