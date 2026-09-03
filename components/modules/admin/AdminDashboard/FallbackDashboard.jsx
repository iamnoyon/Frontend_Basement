"use client";
import react from "react";

export default function FallbackDashboard() {
  return (
    <main className="flex min-h-[100vh] items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <span className="text-2xl">👋</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to your Dashboard
        </h1>

        <p className="mt-3 text-gray-500">
          You’re all set! Select an option from the sidebar to get started.
        </p>
      </div>
    </main>
  );
}