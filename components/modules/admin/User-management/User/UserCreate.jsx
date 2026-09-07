"use client";

import CardLayout from '@/components/common/CardLayout'
import React from 'react'
import { User } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from './schema';
import Formwrapper from '@/Forms/Formwrapper';
import FormInput from '@/Forms/FormInput';
import { useForm } from 'react-hook-form';
import { useCreateUserMutation } from '@/store/admin/user-management';
import { useRouter } from 'next/navigation';
import useToaster from '@/components/hooks/useToaster';
import FormSelect from '@/Forms/FormSelect';

const UserCreate = () => {
    const router = useRouter()
    const { errorToaster, successToaster } = useToaster();
    //api
    const [Create] = useCreateUserMutation()

    const methods = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
            role: ''
        }
    });

    const onSubmit = (data) => {
        Create(data)
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
            title="Add User"
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
                        name="password"
                        label="Password"
                        placeholder='Admin123!'
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
                    <button type="submit" className='w-40 hover:cursor-pointer hover:bg-[#053872] rounded font-semibold py-2  bg-[#0A4D99] text-white'>Save</button>
                </div>
            </Formwrapper>
        </CardLayout>
    )
}

export default UserCreate
