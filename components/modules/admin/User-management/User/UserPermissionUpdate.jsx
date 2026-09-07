"use client";

import CardLayout from '@/components/common/CardLayout';
import React, { useEffect } from 'react';
import { ShieldCheck } from "lucide-react";
import Formwrapper from '@/Forms/Formwrapper';
import { useGetPermissionsByUserIdQuery, useUpdatePermissionsByUserIdMutation } from '@/store/admin/user-management';
import { useParams, useRouter } from 'next/navigation';
import useToaster from '@/components/hooks/useToaster';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import Swal from "sweetalert2";

const UserPermissionUpdate = () => {
    const id = useParams()?.id;
    const router = useRouter();
    const { successToaster, errorToaster } = useToaster();
    const user = useSelector((state) => state?.user);

    const { data: permissionsList } = useGetPermissionsByUserIdQuery({ id }, { skip: !id });
    const [updatePermissions] = useUpdatePermissionsByUserIdMutation();

    const methods = useForm({
        defaultValues: {
            permissions: []
        }
    });

    useEffect(() => {
        if (permissionsList?.success) {
            const permValues = (permissionsList?.data?.permissions || []).map((p) => p.value);
            methods.reset({
                permissions: permValues
            });
        }
    }, [permissionsList, methods]);

    const onSubmit = async (data) => {
        const result = await Swal.fire({
            title: "Confirm Update",
            text: "Are you sure you want to update this user's permissions?",
            icon: "question",
            width: "350px",
            padding: "1.25rem",
            showCancelButton: true,
            confirmButtonColor: "#043570",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update",
            cancelButtonText: "Cancel",
            didOpen: (popup) => {
                const icon = popup.querySelector(".swal2-icon");
                if (icon) icon.style.transform = "scale(0.7)";
            },
        });
        if (!result.isConfirmed) return;

        updatePermissions({
            id: id,
            data: { permissions: data.permissions },
        })
            .unwrap()
            .then((res) => {
                if (res?.success || res?.status_code === 200) {
                    successToaster(res?.message || "Permissions updated successfully.");
                    router.push("/user-management/users");
                }
            })
            .catch((err) => {
                errorToaster(err?.data?.message || "Failed to update permissions.");
            });
    };

    return (
        <CardLayout
            title="Update User Permissions"
            titleIcon={ShieldCheck}
        >
            <Formwrapper methods={methods} onSubmit={onSubmit}>
                <p className="mb-5 text-sm text-gray-500">
                    Select the permissions you want to assign to this user.
                </p>

                <Controller
                    name="permissions"
                    control={methods.control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {(user?.permissions || []).map((item) => {
                                const optionLabel = item?.name;
                                const optionValue = item?.value;
                                const isSelected = (field.value || []).includes(optionValue);

                                const handleToggle = () => {
                                    const currentValues = field.value || [];
                                    const updatedValues = isSelected
                                        ? currentValues.filter((v) => v !== optionValue)
                                        : [...currentValues, optionValue];
                                    field.onChange(updatedValues);
                                };

                                return (
                                    <div
                                        key={optionValue}
                                        onClick={handleToggle}
                                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer select-none
                                            ${isSelected ? "border-black bg-gray-50" : "border-gray-200 bg-white hover:border-black"}`}
                                    >
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all
                                            ${isSelected ? "border-black" : "border-gray-300"}`}
                                        >
                                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
                                        </div>
                                        <span className="text-sm text-gray-700">{optionLabel}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                />

                <div className="flex items-center justify-center gap-10 mt-20">
                    <button
                        type="button"
                        onClick={() => router.push("/user-management/users")}
                        className="w-40 hover:cursor-pointer hover:bg-[#0A4D99] rounded font-semibold py-2 border text-[#0A4D99] hover:text-white border-[#0A4D99]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="w-40 hover:cursor-pointer hover:bg-[#053872] rounded font-semibold py-2 bg-[#0A4D99] text-white"
                    >
                        Save
                    </button>
                </div>
            </Formwrapper>
        </CardLayout>
    );
};

export default UserPermissionUpdate;
