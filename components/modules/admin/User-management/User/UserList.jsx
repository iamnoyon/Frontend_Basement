/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import CardLayout from '@/components/common/CardLayout';
import { useEffect, useMemo, useState } from 'react';
import { Plus, List, SquarePen } from 'lucide-react';
import { useLazyGetUserListQuery, useUpdateUserStatusMutation } from '@/store/admin/user-management';
import ReactTable from '@/components/common/ReactTable/ReactTable';
import { createColumnHelper } from '@tanstack/react-table';
import TableSkeleton from '@/components/common/ReactTable/TableSkeleton';
import ThreeDotMenu from '@/components/common/ThreeDotMenu';
import useToaster from '@/components/hooks/useToaster';
import { useRouter } from 'next/navigation';

const columnHelper = createColumnHelper();


const UserList = () => {
    const router = useRouter()
    const [pageAndLimit, setPageAndLimit] = useState({ page: 1, limit: 10 });
    const [searchQuery, setSearchQuery] = useState('');
    const { successToaster } = useToaster()


    // API
    const [triggerList, { data: userData, isLoading }] = useLazyGetUserListQuery();
    const [Update] = useUpdateUserStatusMutation()

    // Action handlers
    const handleStatusUpdate = (id, status) => {
        Update({ id, data:{status: status} })
            .unwrap()
            .then((res) => {
                if (res?.success == true, res?.status_code == 200) {
                    successToaster(res?.message || 'User status updated successfully!')
                }
            })
    }

    // Trigger API call
    useEffect(() => {
        triggerList({
            page: pageAndLimit.page,
            limit: pageAndLimit.limit,
        });
    }, [pageAndLimit]);

    // Columns definition
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('sl', {
                    id: 'sl',
                    header: () => 'SL No.',
                    cell: (info) => (
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
                            {info.row.index + 1}
                        </span>
                    ),
                }),
                columnHelper.accessor('name', {
                    id: 'name',
                    header: () => 'Name',
                    cell: (info) => (
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
                            {info.getValue()}
                        </span>
                    ),
                    enableSorting: true,
                }),
                columnHelper.accessor('email', {
                    id: 'email',
                    header: () => 'Email',
                    cell: (info) => (
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
                            {info.getValue()}
                        </span>
                    ),
                    enableSorting: true,
                }),
                columnHelper.accessor('role', {
                    id: 'role',
                    header: () => 'Role',
                    cell: (info) => {
                        const role = info.getValue();
                        return (
                            <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937] capitalize">
                                {role ? role : '-'}
                            </span>
                        );
                    },
                    enableSorting: true,
                }),
                columnHelper.accessor('business', {
                    id: 'business',
                    header: () => 'Business',
                    cell: (info) => {
                        return (
                            <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
                                {info.getValue()?.businessName}
                            </span>
                        );
                    },
                    enableSorting: true,
                }),
                columnHelper.accessor('status', {
                    id: 'status',
                    header: () => 'Status',
                    cell: (info) => {
                        const status = info.getValue();
                        let bgColor = 'bg-gray-500';
                        if (status === 'active') bgColor = 'bg-[#16A34A]';
                        if (status === 'suspended') bgColor = 'bg-[#F59E0B]';
                        if (status === 'inactive') bgColor = 'bg-[#EF4444]';

                        return (
                            <span className={`inline-block rounded-full px-3 py-1 text-[0.875rem] font-medium text-white ${bgColor}`}>
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
                        const user = info.row.original;

                        return (
                            <div className="flex items-center gap-1">
                                <SquarePen size={16} className="mr-2 cursor-pointer"
                                    onClick={() => router.push(`/user-management/users/edit/${user?.id}`)} />
                                <ThreeDotMenu
                                    object={user}
                                    actions={[
                                        {
                                            label: 'Active',
                                            onClick: () => handleStatusUpdate(info?.row?.original?.id, 'active'),
                                            isDisabled: user?.status === "active",
                                        },
                                        {
                                            label: 'Suspend',
                                            onClick: () => handleStatusUpdate(info?.row?.original?.id, "suspended"),
                                            isDisabled: user?.status === "suspended",
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
            title="User List"
            titleIcon={List}
            buttonText="Add User"
            buttonPermission="user:create"
            buttonIcon={Plus}
            buttonHref="/user-management/users/create"
        >
            {
                (isLoading) ? (
                    <TableSkeleton rowLength={10} columnLength={columns?.length || 5} />
                ) : (
                    <ReactTable
                        columns={columns}
                        dataSource={userData?.dataSource || []}
                        totalRecords={userData?.totalRecords}
                        pageAndLimit={pageAndLimit}
                        showPageSizeDropdown={userData?.totalRecords > pageAndLimit.limit}
                        paginationOn={userData?.paginationOn}
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

export default UserList;