"use client";

import { Bell, ChevronRight, LogOut, Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { performLogout } from "@/utils/logout";
import { breadcrumbData } from "./breadcurmb";

const idEncrypted = false; // Set to true if you want to encrypt the ID in the breadcrumb

const encryptId = (id) => {
    if (!id) return "";

    return btoa(id)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
        .slice(0, 16);
};

export default function Topbar({ onMenuToggle }) {
    const state = useSelector((state) => state?.user);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const pathname = usePathname();

    const currentBreadcrumb = breadcrumbData.find((item) => {
        if (item.route.includes("[id]")) {
            const routePattern = item.route.replace("[id]", "([^/]+)");
            return new RegExp(`^${routePattern}$`).test(pathname);
        }

        return item.route === pathname;
    });

    let breadcrumbItems = currentBreadcrumb?.items || [];

    if (currentBreadcrumb?.route.includes("[id]")) {
        const id = pathname.split("/").filter(Boolean).pop();

        const displayId = idEncrypted ? encryptId(id) : id;

        breadcrumbItems = breadcrumbItems.map((item) =>
            item.label === "Edit"
                ? {
                      ...item,
                      label: `Edit (${displayId})`,
                  }
                : item
        );
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        performLogout();
    };

    return (
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    aria-label="Toggle menu"
                    className="rounded-lg p-2 transition hover:bg-gray-100 lg:hidden"
                >
                    <Menu size={22} className="text-gray-600" />
                </button>

                <nav
                    aria-label="Breadcrumb"
                    className="flex min-w-0 items-center overflow-hidden"
                >
                    {breadcrumbItems.length > 0 ? (
                        breadcrumbItems.map((item, index) => {
                            const isLast =
                                index === breadcrumbItems.length - 1;

                            return (
                                <div
                                    key={`${item.label}-${index}`}
                                    className="flex min-w-0 items-center"
                                >
                                    {index > 0 && (
                                        <ChevronRight
                                            size={16}
                                            className="mx-1 shrink-0 text-gray-400"
                                        />
                                    )}

                                    {isLast || item.url === "#" ? (
                                        <span
                                            className={`max-w-32 truncate text-sm sm:max-w-none ${
                                                isLast
                                                    ? "font-semibold text-gray-800"
                                                    : "font-medium text-gray-500"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    ) : (
                                        <NextLink
                                            href={item.url}
                                            className="max-w-24 truncate text-sm font-medium text-gray-500 transition hover:text-gray-900 sm:max-w-none"
                                        >
                                            {item.label}
                                        </NextLink>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <NextLink
                            href="/dashboard"
                            className="text-sm font-semibold text-gray-800"
                        >
                            Dashboard
                        </NextLink>
                    )}
                </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-full p-2 transition hover:bg-gray-100"
                >
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        aria-label="Open user menu"
                        aria-expanded={open}
                        className="flex items-center gap-2 rounded-xl px-1 py-1 transition hover:bg-gray-100 sm:px-2"
                    >
                        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-200 sm:h-10 sm:w-10">
                            <img
                                src={
                                    state?.profileImageUrl ||
                                    "/profile.png"
                                }
                                alt="User Avatar"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                    </button>

                    {open && (
                        <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-64">
                            <div className="border-b border-gray-100 px-4 py-4 text-center">
                                <p className="truncate text-sm font-semibold text-gray-800">
                                    {state?.name || "User"}
                                </p>

                                <div className="mt-1 text-xs text-gray-500">
                                    <span className="block truncate">
                                        {state?.email || ""}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 p-2">
                                <NextLink
                                    href="/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-[0.98]"
                                >
                                    <User size={18} />
                                    <span>Profile</span>
                                </NextLink>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}