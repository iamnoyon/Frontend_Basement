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
import ProfileInfo from "./ProfileInfo";
import BusinessInfo from "./BusinessInfo";
import { useCheckPaymentStatusQuery } from "@/store/admin/package";
import { useRouter, useSearchParams } from "next/navigation";

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
    const { data: paymentStatus } = useCheckPaymentStatusQuery({tran_id}, {skip: !tran_id})

    useEffect(()=>{
        if(paymentStatus?.data?.status === "success"){
            Swal.fire({
                title: "Payment Successful!",
                text: "Your payment has been processed successfully.",
                icon: "success",
                confirmButtonColor: "#043570",
                confirmButtonText: "OK",
                didOpen: (popup) => {
                    const icon = popup.querySelector(".swal2-icon");
                    if (icon) icon.style.transform = "scale(0.7)";
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    router.replace("/profile");
                }
            });
        }
    }, [paymentStatus])


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
        superadmin: "bg-purple-100 text-purple-700 border-purple-200",
        admin: "bg-blue-100 text-blue-700 border-blue-200",
        manager: "bg-amber-100 text-amber-700 border-amber-200",
        staff: "bg-green-100 text-green-700 border-green-200",
    };

    const statusColors = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200",
        inactive: "bg-red-100 text-red-700 border-red-200",
        pending: "bg-orange-100 text-orange-700 border-orange-200",
    };

    const roleColor = roleColors[user?.role] || "bg-gray-100 text-gray-700 border-gray-200";
    const statusColor = statusColors[user?.billing_status] || "bg-gray-100 text-gray-700 border-gray-200";

    const tabs = [
        { id: "profile", label: "Profile Info", icon: User },
        { id: "business", label: "Business Info", icon: Building2 },
        // { id: "billing", label: "Billing Info", icon: Receipt },
    ];

    const hiddenRoles = ["cashier", "waiter"];
    const isRestricted = hiddenRoles.includes(user?.role);
    const visibleTabs = isRestricted ? tabs.filter((t) => t.id === "profile") : tabs;

    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-3 sm:p-4">
            <div className="mx-auto w-full">

                <div className="mb-4 flex flex-col sm:flex-row items-center gap-1 rounded-2xl bg-white p-1.5 shadow-md border border-gray-100">
                    {visibleTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:cursor-pointer w-full sm:w-auto ${
                                    isActive
                                        ? "bg-gradient-to-r from-[#042A55] to-[#0A4D99] text-white shadow-md shadow-blue-900/10"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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

                {activeTab === "business" && (
                    <BusinessInfo user={user} />
                )}

                {/* {activeTab === "billing" && (
                    <BillingInfo user={user} statusColor={statusColor} />
                )} */}

            </div>
        </div>
    );
}
