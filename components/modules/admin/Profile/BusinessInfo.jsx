"use client";

import { Building2, MapPin, Map, Navigation, Crosshair, Pencil, X, Check, Upload, Loader, Calendar, BadgeCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSingleFileUploadMutation } from "@/store/attachment";
import useToaster from "@/components/hooks/useToaster";
import Image from "next/image";
import { useGetBusinessInfoQuery, useUpdateBusinessMutation } from "@/store/admin/businesses";

export default function BusinessInfo({ user }) {
    const [isEditing, setIsEditing] = useState(false);
    const { errorToaster, successToaster } = useToaster();
    const logoInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    //api
    const [UpdateBusiness] = useUpdateBusinessMutation();
    const [UploadFile] = useSingleFileUploadMutation();
    const {data: businessInfo} = useGetBusinessInfoQuery()

    const [formData, setFormData] = useState({
        businessName: "",
        division: "",
        district: "",
        thana: "",
        area: "",
        businessLogo: "",
    });

    useEffect(() => {
        if (businessInfo?.success) {
            setFormData({
                businessName: businessInfo?.data?.businessName || "",
                division: businessInfo?.data?.division || "",
                district: businessInfo?.data?.district || "",
                thana: businessInfo?.data?.thana || "",
                area: businessInfo?.data?.area || "",
                businessLogo: businessInfo?.data?.businessLogo || "",
            });
        }
    }, [businessInfo]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await UploadFile(fd).unwrap();
            if (res?.url) {
                setFormData((prev) => ({ ...prev, businessLogo: res.url }));
                successToaster("Logo uploaded.");
            }
        } catch (err) {
            errorToaster(err?.data?.message || "Failed to upload logo.");
        } finally {
            setUploading(false);
            if (logoInputRef.current) logoInputRef.current.value = "";
        }
    };

    const handleSave = () => {
        UpdateBusiness(formData)
            .unwrap()
            .then((res) => {
                if (res?.success || res?.status_code == 200) {
                    successToaster("Business info updated.");
                    setIsEditing(false);
                    window.location.reload();
                }
            })
            .catch((err) => {
                errorToaster(err?.data?.message || "Failed to update business info.");
            });
    };

    const handleCancel = () => {
        setFormData({
            businessName: user?.businessName || "",
            division: user?.division || "",
            district: user?.district || "",
            thana: user?.thana || "",
            area: user?.area || "",
            businessLogo: user?.businessLogo || "",
        });
        setIsEditing(false);
    };

    const fields = [
        { label: "Business Name", name: "businessName", icon: Building2 },
        { label: "Division", name: "division", icon: MapPin },
        { label: "District", name: "district", icon: Map },
        { label: "Thana", name: "thana", icon: Navigation },
        { label: "Area", name: "area", icon: Crosshair },
    ];

    return (
        <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm shadow-blue-200">
                    <Building2 size={18} />
                </div>
                <div>
                    <h2 className="text-base font-bold text-gray-800 tracking-tight">
                        Restaurant Information
                    </h2>
                    <p className="text-xs text-gray-400">Your business details</p>
                </div>
                <div className="ml-auto">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#042A55] to-[#0A4D99] text-white px-4 py-2 text-xs font-semibold hover:from-[#053d7e] hover:to-[#0C5DB3] transition-all duration-200 hover:cursor-pointer"
                            >
                                <Check size={14} />
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1.5 rounded-xl border border-gray-200 text-gray-600 px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-all duration-200 hover:cursor-pointer"
                            >
                                <X size={14} />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-gray-100 text-gray-600 px-4 py-2 text-xs font-semibold hover:bg-gray-200 transition-all duration-200 hover:cursor-pointer"
                        >
                            <Pencil size={14} />
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Business Logo Upload */}
                <div>
                    <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Business Logo
                    </p>
                    <div
                        onClick={() => isEditing && !uploading && logoInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (!isEditing) return;
                            const file = e.dataTransfer.files?.[0];
                            if (file && !uploading) {
                                const fakeEvent = { target: { files: [file] } };
                                handleLogoUpload(fakeEvent);
                            }
                        }}
                        className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${uploading ? "pointer-events-none opacity-60" : ""} ${isEditing ? "cursor-pointer hover:border-blue-500 hover:bg-gray-50" : "cursor-default"}`}
                    >
                        {formData.businessLogo ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200">
                                    <Image
                                        src={formData.businessLogo}
                                        alt="Business Logo"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Click or drag to replace</p>
                            </div>
                        ) : uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader size={36} className="animate-spin text-blue-500" />
                                <p className="text-sm font-medium text-gray-600">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-400">
                                    <Upload size={28} />
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Click to upload or drag logo here
                                </p>
                                <p className="text-xs text-gray-400">Allowed: image/*</p>
                            </div>
                        )}
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={uploading}
                            onChange={handleLogoUpload}
                        />
                </div>

                {businessInfo?.data?.subscription && (
                    <div>
                        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Subscription
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 transition-all duration-200">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 flex-shrink-0">
                                    <BadgeCheck size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Status</p>
                                    <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                        businessInfo?.data?.subscription === "active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                    }`}>
                                        {businessInfo?.data?.subscription}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5 transition-all duration-200">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
                                    <Calendar size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Expire Date</p>
                                    <p className="truncate text-sm font-medium text-gray-700">
                                        {businessInfo?.data?.subEndDate
                                            ? new Date(businessInfo.data.subEndDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                            : <span className="text-gray-300 italic">Not set</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                                    <Icon size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                                        {item.label}
                                    </p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name={item.name}
                                            value={formData[item.name] || ""}
                                            onChange={handleChange}
                                            className="w-full mt-0.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                    ) : (
                                        <p className="truncate text-sm font-medium text-gray-700">
                                            {formData[item.name] || <span className="text-gray-300 italic">Not set</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
