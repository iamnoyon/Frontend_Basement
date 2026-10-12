/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CardLayout from '@/components/common/CardLayout'
import React, { useEffect } from 'react'
import { Landmark } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { pujaSchema } from './schema';
import Formwrapper from '@/components/Forms/Formwrapper';
import FormInput from '@/components/Forms/FormInput';
import FormSelect from '@/components/Forms/FormSelect';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useCreateDurgaPujaMutation } from '@/store/admin/puja';
import {
    useGetFeaturesDropdownQuery,
    useGetUnionDropdownQuery,
    useLazyGetWardDropdownQuery,
} from '@/store/publilc_map';
import { useRouter } from 'next/navigation';
import useToaster from '@/components/hooks/useToaster';

const emptyVillage = { village_name: '', mondir_name: '', phone: '' };

const CreatePujaData = () => {
    const router = useRouter()
    const { errorToaster, successToaster } = useToaster();
    //api
    const [Create, { isLoading: isSaving }] = useCreateDurgaPujaMutation()
    const { data: featureData } = useGetFeaturesDropdownQuery()
    const { data: unionData } = useGetUnionDropdownQuery()
    const [triggerWards, { currentData: wardData, isFetching: wardsLoading }] = useLazyGetWardDropdownQuery()
    const features = featureData?.data || [];
    const unions = unionData?.data || [];
    const wards = (wardData?.data || []).map((w) => ({
        ...w,
        label: w.ward_no != null ? `Ward ${w.ward_no} (${w.ward_code})` : w.ward_code,
    }));

    const methods = useForm({
        resolver: zodResolver(pujaSchema),
        defaultValues: {
            feature_id: null,
            union_id: null,
            ward_code: null,
            villages: [emptyVillage]
        }
    });

    const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'villages' });
    const unionId = useWatch({ control: methods.control, name: 'union_id' });
    const villageErrors = methods.formState.errors?.villages;

    // Wards depend on the union: reload them and clear the old pick whenever the union changes.
    useEffect(() => {
        methods.setValue('ward_code', null);
        if (unionId) triggerWards({ union_id: unionId });
    }, [unionId]);

    const onSubmit = (data) => {
        if (wards.length > 0 && !data.ward_code) {
            methods.setError('ward_code', { message: 'Ward is required' });
            return;
        }
        const payload = {
            ...data,
            feature_id: Number(data.feature_id),
            union_id: Number(data.union_id),
            ward_code: data.ward_code || null,
        };
        Create(payload)
            .unwrap()
            .then((res) => {
                if (res?.success || res?.status_code === 201) {
                    successToaster(res?.message || "Puja data created successfully!");
                    router.push("/puja-management");
                }
            })
            .catch((err) => {
                errorToaster(err?.data?.detail || err?.data?.message || "Failed to create puja data.");
                console.log(err);
            })
    }

    return (
        <CardLayout
            title="Add Puja Data"
            titleIcon={Landmark}
        >
            <Formwrapper
                methods={methods}
                onSubmit={onSubmit}
            >
                <div className='grid lg:grid-cols-3 gap-5'>
                    <FormSelect
                        name='feature_id'
                        label='Feature'
                        labelKey='title'
                        valueKey='id'
                        placeholder='Select feature'
                        options={features}
                        required
                    />
                    <FormSelect
                        name='union_id'
                        label='Union'
                        labelKey='name'
                        valueKey='id'
                        placeholder='Select union'
                        options={unions}
                        required
                    />
                    <FormSelect
                        name='ward_code'
                        label='Ward'
                        labelKey='label'
                        valueKey='ward_code'
                        placeholder={!unionId ? 'Select union first' : wardsLoading ? 'Loading...' : wards.length ? 'Select ward' : 'No wards'}
                        options={wards}
                        isDisabled={!unionId || wardsLoading || wards.length === 0}
                    />
                </div>

                <div className='mt-8'>
                    <div className='mb-3 flex items-center justify-between'>
                        <h3 className='text-base font-semibold text-[var(--color-gray-800)]'>
                            Villages <span className="ml-1 text-[var(--color-red-700)]">*</span>
                        </h3>
                        <button
                            type="button"
                            onClick={() => append(emptyVillage)}
                            className="rounded-md border border-[var(--color-primary)] px-4 py-1.5 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-white)] cursor-pointer"
                        >
                            + Add Village
                        </button>
                    </div>

                    <div className='space-y-4'>
                        {fields.map((field, index) => (
                            <div key={field.id} className='rounded-lg border border-[var(--color-gray-200)] p-4'>
                                <div className='mb-3 flex items-center justify-between'>
                                    <span className='text-sm font-medium text-[var(--color-gray-700)]'>Village {index + 1}</span>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="rounded-md bg-[var(--color-red-500)] px-3 py-1 text-sm text-[var(--color-white)] hover:bg-[var(--color-red-600)] cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className='grid lg:grid-cols-3 gap-5'>
                                    {[
                                        { key: 'village_name', label: 'Village Name', placeholder: 'Village name' },
                                        { key: 'mondir_name', label: 'Mondir Name', placeholder: 'Mondir name' },
                                        { key: 'phone', label: 'Phone', placeholder: '01712345678' },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <FormInput
                                                name={`villages.${index}.${key}`}
                                                label={label}
                                                placeholder={placeholder}
                                                required
                                            />
                                            {villageErrors?.[index]?.[key] && (
                                                <p className="mt-1 text-sm text-[var(--color-red-500)]">{villageErrors[index][key].message}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {villageErrors?.message && (
                        <p className="mt-2 text-sm text-[var(--color-red-500)]">{villageErrors.message}</p>
                    )}
                </div>

                <div className='flex items-center justify-center gap-10 mt-20'>
                    <button type='button' onClick={() => router.push("/puja-management")} className='w-40 hover:cursor-pointer hover:bg-[var(--color-primary-light)] rounded font-semibold py-2 border text-[var(--color-primary-light)] hover:text-[var(--color-white)] border-[var(--color-primary-light)]'>Cancel</button>
                    <button type="submit" disabled={isSaving} className='w-40 hover:cursor-pointer hover:bg-[var(--color-primary-button-hover)] rounded font-semibold py-2  bg-[var(--color-primary-light)] text-[var(--color-white)] disabled:opacity-60'>{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
            </Formwrapper>
        </CardLayout>
    )
}

export default CreatePujaData
