"use client";

import CardLayout from '@/components/common/CardLayout'
import React from 'react'
import { Layers } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { featureSchema } from './schema';
import Formwrapper from '@/components/Forms/Formwrapper';
import FormInput from '@/components/Forms/FormInput';
import FormSelect from '@/components/Forms/FormSelect';
import FormRadioGroup from '@/components/Forms/FormRadioGroup';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useCreateFeatureMutation } from '@/store/admin/feature';
import { useGetUnionsCoverageQuery } from '@/store/publilc_map';
import { useRouter } from 'next/navigation';
import useToaster from '@/components/hooks/useToaster';

const emptyCandidate = { name: '', image: '' };

const FeatureCreate = () => {
    const router = useRouter()
    const { errorToaster, successToaster } = useToaster();
    //api
    const [Create] = useCreateFeatureMutation()
    const { data: unionData } = useGetUnionsCoverageQuery()
    const unions = Array.isArray(unionData) ? unionData : unionData?.data || [];

    const methods = useForm({
        resolver: zodResolver(featureSchema),
        defaultValues: {
            title: '',
            is_union_based: false,
            union_id: null,
            candidates: [emptyCandidate]
        }
    });

    const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'candidates' });
    const isUnionBased = useWatch({ control: methods.control, name: 'is_union_based' });
    const candidateErrors = methods.formState.errors?.candidates;

    const onSubmit = (data) => {
        const payload = {
            ...data,
            union_id: data.is_union_based ? Number(data.union_id) : null,
        };
        Create(payload)
            .unwrap()
            .then((res) => {
                if (res?.success || res?.status_code === 201) {
                    successToaster(res?.message || "Feature created successfully!");
                    router.push("/feature-management");
                }
            })
            .catch((err) => {
                errorToaster(err?.data?.detail || "Failed to create feature.");
                console.log(err);
            })
    }

    return (
        <CardLayout
            title="Add Feature"
            titleIcon={Layers}
        >
            <Formwrapper
                methods={methods}
                onSubmit={onSubmit}
            >
                <div className='grid lg:grid-cols-3 gap-5'>
                    <FormInput
                        name="title"
                        label="Title"
                        placeholder='Baisakanda UP Chairman Election 2026'
                        required
                    />
                    <FormRadioGroup
                        name="is_union_based"
                        label="Union Based"
                        columns={{ sm: 2 }}
                        options={[
                            { label: 'Yes', id: true },
                            { label: 'No', id: false },
                        ]}
                    />
                    {isUnionBased && (
                        <FormSelect
                            name='union_id'
                            label='Union'
                            labelKey='name'
                            valueKey='id'
                            placeholder='Select union'
                            options={unions}
                            required
                        />
                    )}
                </div>

                <div className='mt-8'>
                    <div className='mb-3 flex items-center justify-between'>
                        <h3 className='text-base font-semibold text-[var(--color-gray-800)]'>
                            Candidates <span className="ml-1 text-[var(--color-red-700)]">*</span>
                        </h3>
                        <button
                            type="button"
                            onClick={() => append(emptyCandidate)}
                            className="rounded-md border border-[var(--color-primary)] px-4 py-1.5 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-white)] cursor-pointer"
                        >
                            + Add Candidate
                        </button>
                    </div>

                    <div className='space-y-4'>
                        {fields.map((field, index) => (
                            <div key={field.id} className='rounded-lg border border-[var(--color-gray-200)] p-4'>
                                <div className='mb-3 flex items-center justify-between'>
                                    <span className='text-sm font-medium text-[var(--color-gray-700)]'>Candidate {index + 1}</span>
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
                                <div className='grid lg:grid-cols-2 gap-5'>
                                    <div>
                                        <FormInput
                                            name={`candidates.${index}.name`}
                                            label="Name"
                                            placeholder='Candidate name'
                                            required
                                        />
                                        {candidateErrors?.[index]?.name && (
                                            <p className="mt-1 text-sm text-[var(--color-red-500)]">{candidateErrors[index].name.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <FormInput
                                            name={`candidates.${index}.image`}
                                            label="Image URL"
                                            placeholder='https://example.com/a.png'
                                            required
                                        />
                                        {candidateErrors?.[index]?.image && (
                                            <p className="mt-1 text-sm text-[var(--color-red-500)]">{candidateErrors[index].image.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {candidateErrors?.message && (
                        <p className="mt-2 text-sm text-[var(--color-red-500)]">{candidateErrors.message}</p>
                    )}
                </div>

                <div className='flex items-center justify-center gap-10 mt-20'>
                    <button type='button' onClick={() => router.push("/feature-management")} className='w-40 hover:cursor-pointer hover:bg-[var(--color-primary-light)] rounded font-semibold py-2 border text-[var(--color-primary-light)] hover:text-[var(--color-white)] border-[var(--color-primary-light)]'>Cancel</button>
                    <button type="submit" className='w-40 hover:cursor-pointer hover:bg-[var(--color-primary-button-hover)] rounded font-semibold py-2  bg-[var(--color-primary-light)] text-[var(--color-white)]'>Save</button>
                </div>
            </Formwrapper>
        </CardLayout>
    )
}

export default FeatureCreate
