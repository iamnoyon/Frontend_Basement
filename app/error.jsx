"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
} from "lucide-react";

const AdminErrorPage = ({ error, reset }) => {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-red-500">
          Something went wrong
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Unable to load this page
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          We encountered an unexpected error while loading this page.
          Please try again or return to the dashboard.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* Try Again */}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:cursor-pointer hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          {/* Go Back */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Error Details - Always Open */}
        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mt-8 rounded-xl border border-red-100 bg-slate-200 p-4 text-left shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />

              <span className="text-sm font-semibold text-slate-800">
                Error details
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="break-words font-mono text-xs leading-5 text-red-500">
                {error.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminErrorPage;