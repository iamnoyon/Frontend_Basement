"use client";

import { User, Mail, Shield, Lock, Eye, EyeOff, Settings, Phone } from "lucide-react";
import Image from "next/image";

export default function ProfileInfo({
    user,
    fileRef,
    preview,
    handleImageChange,
    roleColor,
    handleUpdate,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleChangePassword,
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100">
                    <div className="h-16 bg-gradient-to-r from-[#042A55] via-[#063C76] to-[#0A4D99]" />
                    <div className="flex flex-col items-center -mt-8 px-4">
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                            <div
                                onClick={() => fileRef.current.click()}
                                className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg ring-2 ring-gray-100"
                            >
                                {preview || user?.profileImageUrl ? (
                                    <Image
                                        src={preview || user?.profileImageUrl}
                                        alt="avatar"
                                        fill
                                        className="object-cover"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-gray-900/50 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 5v14" /><path d="M5 12h14" />
                                    </svg>
                                    <span className="text-[10px] font-medium text-white">Change</span>
                                </div>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageChange}
                            />
                        </div>
                        <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${roleColor}`}>
                            <Shield size={12} />
                            {user?.role}
                        </span>
                    </div>
                    <div className="mt-4 space-y-0.5 px-4">
                        {[
                            { label: "Full Name", value: user?.name, icon: User },
                            { label: "Email Address", value: user?.email, icon: Mail },
                            { label: "Phone", value: user?.phone, icon: Phone },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover/item:bg-blue-100 transition-colors">
                                        <Icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                                            {item.label}
                                        </p>
                                        <p className="truncate text-sm font-medium text-gray-700">
                                            {item.value || "-"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-4 pb-4 mt-4">
                        <button
                            onClick={handleUpdate}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#042A55] to-[#0A4D99] text-white py-3 px-5 hover:from-[#053d7e] hover:to-[#0C5DB3] hover:cursor-pointer text-sm font-semibold transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20 active:scale-[0.98]"
                        >
                            <Settings size={16} />
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-sm shadow-red-200">
                            <Lock size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800 tracking-tight">
                                Change Password
                            </h2>
                            <p className="text-xs text-gray-400">Keep your account secure</p>
                        </div>
                    </div>
                    <form onSubmit={handleChangePassword} className="p-4 space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword.new_password ? "text" : "password"}
                                    value={password.new_password}
                                    onChange={(e) =>
                                        setPassword((prev) => ({
                                            ...prev,
                                            new_password: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter new password"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => ({
                                            ...prev,
                                            new_password: !prev.new_password,
                                        }))
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword.new_password ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword.confirm_password ? "text" : "password"}
                                    value={password.confirm_password}
                                    onChange={(e) =>
                                        setPassword((prev) => ({
                                            ...prev,
                                            confirm_password: e.target.value,
                                        }))
                                    }
                                    placeholder="Re-enter new password"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => ({
                                            ...prev,
                                            confirm_password: !prev.confirm_password,
                                        }))
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword.confirm_password ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all duration-300 shadow-md shadow-gray-900/10 hover:shadow-lg active:scale-[0.98] hover:cursor-pointer"
                        >
                            <Lock size={16} />
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
