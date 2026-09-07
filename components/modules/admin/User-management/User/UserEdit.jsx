"use client";

import CardLayout from '@/components/common/CardLayout'
import React, { useEffect } from 'react'
import { User } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { userUpdateSchema } from './schema';
import Formwrapper from '@/Forms/Formwrapper';
import FormInput from '@/Forms/FormInput';
import { useForm } from 'react-hook-form';
import { useGetUserInfoByIdQuery, useUpdateUserInfoMutation } from '@/store/admin/user-management';
import { useParams, useRouter } from 'next/navigation';
import useToaster from '@/components/hooks/useToaster';
import FormSelect from '@/Forms/FormSelect';
import { useSelector } from 'react-redux';
import Swal from "sweetalert2";

const UserEdit = () => {
    const id = useParams()?.id;
    const router = useRouter();
    const { errorToaster, successToaster } = useToaster();
    //api
    const [Update] = useUpdateUserInfoMutation()
    const {data: userInfo} = useGetUserInfoByIdQuery({id}, {skip: !id})

    const methods = useForm({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            role: ''
        }
    });

    useEffect(()=>{
        if(userInfo?.success){
            methods.reset({
                name: userInfo?.data?.name,
                email: userInfo?.data?.email,
                phone: userInfo?.data?.phone,
                role: userInfo?.data?.role
            })
        }
    }, [userInfo])

    const onSubmit = async (data) => {
        const result = await Swal.fire({
            title: "Confirm Update",
            text: "Are you sure you want to update this user?",
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

        Update(data)
            .unwrap()
            .then((res) => {
                if (res?.success || res?.status_code === 201) {
                    successToaster("User created successfully!");
                    router.push("/user-management/users");
                }
            })
            .catch((err) => {
                errorToaster(err?.data?.message || "Failed to create user.");
                console.log(err);
            })
    }

    return (
        <CardLayout
            title="Edit User"
            titleIcon={User}
        >
            <Formwrapper
                methods={methods}
                onSubmit={onSubmit}
            >
                <div className='grid lg:grid-cols-2 gap-5'>
                    <FormInput
                        name="name"
                        label="Name"
                        placeholder='Mr. Jhon'
                        required
                    />
                    <FormInput
                        name="email"
                        label="Email"
                        placeholder='example@gmail.com'
                        required
                    />
                    <FormInput
                        name="phone"
                        label="Phone"
                        placeholder='01889010237'
                        required
                    />
                    <FormSelect
                        name='role'
                        label='Role'
                        options={[
                            { label: 'Admin', id: 'admin' },
                            { label: 'Cashier', id: 'cashier' },
                            { label: 'Waiter', id: 'waiter' },
                        ]}
                    />
                </div>
                <div className='flex items-center justify-center gap-10 mt-20'>
                    <button type='button' onClick={() => router.push("/user-management/users")} className='w-40 hover:cursor-pointer hover:bg-[#0A4D99] rounded font-semibold py-2 border text-[#0A4D99] hover:text-white border-[#0A4D99]'>Cancel</button>
                    <button type="submit" className='w-40 hover:cursor-pointer hover:bg-[#053872] rounded font-semibold py-2  bg-[#0A4D99] text-white'>Update</button>
                </div>
            </Formwrapper>
        </CardLayout>
    )
}

export default UserEdit
