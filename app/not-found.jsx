// app/not-found.tsx
'use client';
import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PublicNotFound() {
  const { data: session } = useSession();
  
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <SearchX className="h-10 w-10 text-gray-400" />
        </div>

        {/* 404 */}
        <p className="text-7xl font-bold tracking-tight text-gray-900">
          404
        </p>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          The page may have been moved, deleted, or the URL may be incorrect.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}