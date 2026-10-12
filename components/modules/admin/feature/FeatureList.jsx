/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import CardLayout from '@/components/common/CardLayout';
import { useMemo, useState } from 'react';
import { Plus, List, SquarePen } from 'lucide-react';
import { useGetFeatureListQuery, useUpdateFeatureStatusMutation } from '@/store/admin/feature';
import ReactTable from '@/components/common/ReactTable/ReactTable';
import { createColumnHelper } from '@tanstack/react-table';
import TableSkeleton from '@/components/common/ReactTable/TableSkeleton';
import ThreeDotMenu from '@/components/common/ThreeDotMenu';
import useToaster from '@/components/hooks/useToaster';
import { useRouter } from 'next/navigation';

const columnHelper = createColumnHelper();


const FeatureList = () => {
    const router = useRouter()
    const [pageAndLimit, setPageAndLimit] = useState({ page: 1, limit: 10 });
    const [searchQuery, setSearchQuery] = useState('');
    const { successToaster } = useToaster()

    // API
    const { data: featureData, isLoading } = useGetFeatureListQuery();
    const [Update] = useUpdateFeatureStatusMutation()
    const dataSource = featureData?.data || [];

    // Action handlers
    const handleStatusUpdate = (id, status) => {
        Update({ id, data: { status: status } })
            .unwrap()
            .then((res) => {
                if (res?.success == true) {
                    successToaster(res?.message || 'Feature status updated successfully!')
                }
            })
    }

    // Columns definition
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('sl', {
                    id: 'sl',
                    header: () => 'SL No.',
                    cell: (info) => (
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-heading)]">
                            {info.row.index + 1}
                        </span>
                    ),
                }),
                columnHelper.accessor('title', {
                    id: 'title',
                    header: () => 'Title',
                    cell: (info) => (
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-heading)]">
                            {info.getValue() || '-'}
                        </span>
                    ),
                    enableSorting: true,
                }),
                columnHelper.accessor('is_union_based', {
                    id: 'is_union_based',
                    header: () => 'Union Based',
                    cell: (info) => (
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-heading)]">
                            {info.getValue() ? 'Yes' : 'No'}
                        </span>
                    ),
                    enableSorting: true,
                }),
                columnHelper.accessor('status', {
                    id: 'status',
                    header: () => 'Status',
                    cell: (info) => {
                        const status = info.getValue();
                        let bgColor = 'bg-[var(--color-gray-500)]';
                        if (status === 'active') bgColor = 'bg-[var(--color-success)]';
                        if (status === 'suspended') bgColor = 'bg-[var(--color-warning)]';
                        if (status === 'inactive') bgColor = 'bg-[var(--color-danger)]';

                        return (
                            <span className={`inline-block rounded-full px-3 py-1 text-[0.875rem] font-medium text-[var(--color-white)] ${bgColor}`}>
                                {status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'}
                            </span>
                        );
                    },
                    enableSorting: true,
                }),
                columnHelper.display({
                    id: 'actions',
                    header: () => 'Actions',
                    cell: (info) => {
                        const feature = info.row.original;

                        return (
                            <div className="flex items-center gap-1">
                                <SquarePen size={16} className="mr-2 cursor-pointer"
                                    onClick={() => router.push(`/feature-management/edit/${feature?.id}`)} />
                                <ThreeDotMenu
                                    object={feature}
                                    actions={[
                                        {
                                            label: 'Active',
                                            onClick: () => handleStatusUpdate(feature?.id, 'active'),
                                            isDisabled: feature?.status === "active",
                                        },
                                        {
                                            label: 'Inactive',
                                            onClick: () => handleStatusUpdate(feature?.id, 'inactive'),
                                            isDisabled: feature?.status === "inactive",
                                        },
                                    ]}
                                    isDisabled={false}
                                />
                            </div>
                        );
                    },
                }),
            ],
        []
    );

    return (
        <CardLayout
            title="Feature List"
            titleIcon={List}
            buttonText="Add Feature"
            buttonIcon={Plus}
            buttonHref="/feature-management/create"
        >
            {
                (isLoading) ? (
                    <TableSkeleton rowLength={10} columnLength={columns?.length || 5} />
                ) : (
                    <ReactTable
                        columns={columns}
                        dataSource={dataSource}
                        totalRecords={dataSource.length}
                        pageAndLimit={pageAndLimit}
                        showPageSizeDropdown={dataSource.length > pageAndLimit.limit}
                        paginationOn={false}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onPageLimitChange={({ page, limit }) => {
                            setPageAndLimit({ page, limit });
                        }}
                    />
                )
            }
        </CardLayout>
    );
};

export default FeatureList;
