"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export default function LoginForMap() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${siteConfig.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();
            localStorage.setItem('token', data?.data?.access_token)

            console.log(data);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-100)] px-4">
            <div className="w-full max-w-md bg-[var(--color-white)] rounded-2xl shadow-lg p-8">
                <div className="mb-2 text-center">
                    <h1 className="text-2xl font-bold text-[var(--color-primary-deep)]">Map Login</h1>
                    <p className="text-[var(--color-gray-500)] text-sm mt-1">
                        Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="map-login-email" className="block text-sm font-medium text-[var(--color-gray-700)] mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
                            <input
                                id="map-login-email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 border border-[var(--color-gray-300)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-deep)] focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="map-login-password" className="block text-sm font-medium text-[var(--color-gray-700)] mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
                            <input
                                id="map-login-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-11 py-2.5 border border-[var(--color-gray-300)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-deep)] focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[var(--color-primary-deep)] hover:bg-[var(--color-primary-hover)] hover:cursor-pointer text-[var(--color-white)] font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
