"use client";

import CardLayout from '@/components/common/CardLayout';
import React, { useEffect } from 'react';
import { ShieldCheck } from "lucide-react";
import Formwrapper from '@/components/Forms/Formwrapper';
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
            confirmButtonColor: "var(--color-primary)",
            cancelButtonColor: "var(--color-danger-swal)",
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
                <p className="mb-5 text-sm text-[var(--color-gray-500)]">
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
                                            ${isSelected ? "border-[var(--color-black)] bg-[var(--color-gray-50)]" : "border-[var(--color-gray-200)] bg-[var(--color-white)] hover:border-[var(--color-black)]"}`}
                                    >
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all
                                            ${isSelected ? "border-[var(--color-black)]" : "border-[var(--color-gray-300)]"}`}
                                        >
                                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-black)]" />}
                                        </div>
                                        <span className="text-sm text-[var(--color-gray-700)]">{optionLabel}</span>
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
                        className="w-40 hover:cursor-pointer hover:bg-[var(--color-primary-light)] rounded font-semibold py-2 border text-[var(--color-primary-light)] hover:text-[var(--color-white)] border-[var(--color-primary-light)]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="w-40 hover:cursor-pointer hover:bg-[var(--color-primary-button-hover)] rounded font-semibold py-2 bg-[var(--color-primary-light)] text-[var(--color-white)]"
                    >
                        Save
                    </button>
                </div>
            </Formwrapper>
        </CardLayout>
    );
};

export default UserPermissionUpdate;
