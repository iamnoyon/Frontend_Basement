import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/profile",
];

export default auth((request) => {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  // Not a protected route
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Auth.js did not find a valid authenticated session
  if (!request.auth) {
    const loginUrl = new URL("/", request.url);

    // Optional: remember where the user wanted to go
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};