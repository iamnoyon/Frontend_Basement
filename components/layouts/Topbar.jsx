// components/layout/Topbar.jsx
"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import NextLink from "next/link"
import { performLogout } from "@/utils/logout";

export default function Topbar({ onMenuToggle }) {
    const state = useSelector(state => state?.user)
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        performLogout();
    }

    const dropdownRef = useRef(null);

    // Close dropdown outside click
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
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
            {/* Hamburger menu for mobile */}
            <button
                onClick={onMenuToggle}
                className="rounded-lg p-2 transition hover:bg-gray-100 lg:hidden"
            >
                <Menu size={22} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
                {/* Notification */}
                {/* <button className="relative rounded-full p-2 transition hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />

                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button> */}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-gray-100"
                    >
                        {/* Avatar */}
                        <div className="relative h-10 w-10 overflow-hidden rounded-full hover:cursor-pointer bg-gray-200">
                                <img
                                    src={state?.profileImageUrl || "/profile.png"}
                                    alt="User Avatar"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                    </button>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute -right-3 top-14 z-50 w-[92vw] max-w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-64">

                            {/* User Info */}
                            <div className="border-b border-gray-100 px-4 py-4 text-center">
                                <p className="truncate text-sm font-semibold text-gray-800">
                                    {state?.name}
                                </p>
                                <div className="mt-1 text-xs text-gray-500">
                                    <span className="max-w-full truncate">
                                        {state?.email}
                                    </span>
                                </div>
                            </div>

                            {/* Menu */}
                            <div className="p-2 flex items-center justify-between">
                                <NextLink href="/profile" onClick={() => setOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition-all duration-200 hover:cursor-pointer hover:bg-gray-100 active:scale-[0.98]">
                                    <User size={18} />
                                    <span>Profile</span>
                                </NextLink>

                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 transition-all duration-200 hover:cursor-pointer hover:bg-red-50 active:scale-[0.98]"
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