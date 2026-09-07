"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed left-0 top-0 z-50 h-full w-[70vw] max-w-[380px] lg:hidden animate-slide-in">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white transition hover:bg-white/10"
                        >
                            <X size={20} />
                        </button>
                        <Sidebar
                            onNavClick={() => setMobileMenuOpen(false)}
                            hideToggle
                        />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Topbar */}
                <Topbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-3 py-5 bg-gray-200">{children}</main>
            </div>
        </div>
    );
}