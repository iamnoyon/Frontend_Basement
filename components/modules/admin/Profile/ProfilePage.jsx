"use client";

import useToaster from "@/components/hooks/useToaster";
import { useSingleFileUploadMutation } from "@/store/attachment";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/store/auth";
import {
    User,
    Building2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileInfo from "./ProfileInfo";

export default function ProfilePage() {
    const tran_id = useSearchParams().get("tran_id");
    const router = useRouter();
    const user = useSelector((state) => state?.user);
    const [fileUrl, setFileUrl] = useState(null);
    const { errorToaster, successToaster } = useToaster();
    const [activeTab, setActiveTab] = useState("profile");

    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const [password, setPassword] = useState({
        new_password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState({
        new_password: false,
        confirm_password: false,
    });

    // api
    const [ChangePassword] = useChangePasswordMutation()
    const [UploadProfilePhoto] = useSingleFileUploadMutation()
    const [UpdateProfile] = useUpdateProfileMutation()


    const handleImageChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setPreview(URL.createObjectURL(selectedFile));
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            UploadProfilePhoto(formData)
                .unwrap()
                .then(res => {
                    if (res?.url) {
                        setFileUrl(res.url);
                    }
                })
                .catch(err => {
                    errorToaster(err?.data?.message || "Failed to upload profile photo.");
                    console.log(err.message);
                })
        } catch (err) {
            errorToaster("An unexpected error occurred.");
            console.log(err.message);
        }
    };

    const handleUpdate = () => {
        UpdateProfile({
            profileImageUrl: fileUrl ?? user?.profileImageUrl,
        })
            .unwrap()
            .then(res => {
                if (res?.success || res?.status_code == 200) {
                    successToaster("Profile photo updated.");
                    window.location.reload()
                }
            })
            .catch(err => {
                errorToaster(err?.data?.message || "Failed to update profile.");
            })
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (password?.new_password === password.confirm_password) {
            ChangePassword({
                newPassword: password.new_password,
                confirmPassword: password.confirm_password
            })
                .unwrap()
                .then(res => {
                    if (res?.success == true || res?.status_code == 200) {
                        successToaster("Password changed.");
                        window.location.reload()
                    }
                })
                .catch(err => {
                    errorToaster(err?.data?.message || "Failed to change password.");
                    console.log(err.message);
                })
        } else {
            errorToaster("New & Confirm password are not same");
        }
    };

    const roleColors = {
        superadmin: "bg-[var(--color-purple-100)] text-[var(--color-purple-700)] border-[var(--color-purple-200)]",
        admin: "bg-[var(--color-blue-100)] text-[var(--color-blue-700)] border-[var(--color-blue-200)]",
        manager: "bg-[var(--color-amber-100)] text-[var(--color-amber-700)] border-[var(--color-amber-200)]",
        staff: "bg-[var(--color-green-100)] text-[var(--color-green-700)] border-[var(--color-green-200)]",
    };

    const statusColors = {
        active: "bg-[var(--color-emerald-100)] text-[var(--color-emerald-700)] border-[var(--color-emerald-200)]",
        inactive: "bg-[var(--color-red-100)] text-[var(--color-red-700)] border-[var(--color-red-200)]",
        pending: "bg-[var(--color-orange-100)] text-[var(--color-orange-700)] border-[var(--color-orange-200)]",
    };

    const roleColor = roleColors[user?.role] || "bg-[var(--color-gray-100)] text-[var(--color-gray-700)] border-[var(--color-gray-200)]";
    const statusColor = statusColors[user?.billing_status] || "bg-[var(--color-gray-100)] text-[var(--color-gray-700)] border-[var(--color-gray-200)]";

    const tabs = [
        { id: "profile", label: "Profile Info", icon: User },
        { id: "business", label: "Business Info", icon: Building2 },
        // { id: "billing", label: "Billing Info", icon: Receipt },
    ];

    const hiddenRoles = ["cashier", "waiter"];
    const isRestricted = hiddenRoles.includes(user?.role);
    const visibleTabs = isRestricted ? tabs.filter((t) => t.id === "profile") : tabs;

    return (
        <div className="bg-gradient-to-br from-[var(--color-from-gray-50)] via-[var(--color-via-blue-50-30)] to-[var(--color-to-indigo-50-20)] p-3 sm:p-4">
            <div className="mx-auto w-full">

                <div className="mb-4 flex flex-col sm:flex-row items-center gap-1 rounded-2xl bg-[var(--color-white)] p-1.5 shadow-md border border-[var(--color-gray-100)]">
                    {visibleTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:cursor-pointer w-full sm:w-auto ${
                                    isActive
                                        ? "bg-gradient-to-r from-[var(--color-primary-deep)] to-[var(--color-primary-light)] text-[var(--color-white)] shadow-md shadow-[var(--color-shadow-blue-900-10)]"
                                        : "text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] hover:bg-[var(--color-gray-50)]"
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "profile" && (
                    <ProfileInfo
                        user={user}
                        fileRef={fileRef}
                        preview={preview}
                        handleImageChange={handleImageChange}
                        roleColor={roleColor}
                        handleUpdate={handleUpdate}
                        password={password}
                        setPassword={setPassword}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        handleChangePassword={handleChangePassword}
                    />
                )}
            </div>
        </div>
    );
}
