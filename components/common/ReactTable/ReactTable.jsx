'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import React, { useState } from 'react';
import TableSkeleton from './TableSkeleton';

const ReactTable = ({
    columns,
    dataSource,
    isLoading = false,
    showPageSizeDropdown = true,
    allowRowSelect = false,
    onRowSelectionChange,
    pageAndLimit,
    onPageLimitChange,
    paginationOn,
    totalRecords,
    searchQuery,
    onSearchChange,
    ExtraContent
}) => {
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: dataSource,
        columns: columns,
        pageCount: totalRecords ? Math.ceil(totalRecords / (pageAndLimit?.limit ?? 10)) : -1,
        state: {
            sorting,
            rowSelection,
            pagination: {
                pageIndex: (pageAndLimit?.page ?? 1) - 1,
                pageSize: pageAndLimit?.limit ?? 10,
            },
        },
        manualPagination: paginationOn ?? false,
        enableRowSelection: allowRowSelect,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        ...((paginationOn ?? false) ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
    });

    React.useEffect(() => {
        if (allowRowSelect && onRowSelectionChange) {
            const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
            onRowSelectionChange(selectedRows);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection]);

    const updatePageLimit = (page, limit) => {
        onPageLimitChange?.({ page, limit });
    };

    return (
        <div className="mx-auto pb-3">
            {isLoading ? (
                <TableSkeleton rowLength={10} columnLength={columns?.length || 5} />
            ) : (
                <div className="">
                    <div className='flex justify-end gap-5 mb-3'>
                        {onSearchChange && (
                            <div className="relative md:w-[200px] w-full">
                                <Search
                                    className="absolute top-1/2 left-3 -translate-y-1/2 transform text-[var(--color-gray-400)]"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    value={searchQuery ?? ''}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search"
                                    className="w-full rounded-lg border border-[var(--color-gray-300)] py-2 pr-4 pl-10 font-['DM_Sans',sans-serif] text-[0.875rem] focus:border-[var(--color-gray-300)] focus:ring-1 focus:ring-[var(--color-gray-300)] focus:outline-none"
                                />
                            </div>
                        )}
                        {
                            ExtraContent && ExtraContent
                        }
                    </div>

                    {/* Table */}
                    <div className="bg-[var(--color-white)] px-4 overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="border-b-[0.5px] border-[var(--color-border-light)]">
                                        {allowRowSelect && (
                                            <th className="w-[43px]">{/* Checkbox removed from header */}</th>
                                        )}
                                        {headerGroup.headers.map((header) => {
                                            const isSortable = header.column.columnDef.enableSorting;
                                            return (
                                                <th
                                                    key={header.id}
                                                    onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                                                    className={`px-1.5 py-1 text-left sm:px-2.5 ${isSortable ? 'cursor-pointer select-none' : ''}`}
                                                >
                                                    <span className="flex items-center gap-1 font-['Figtree',sans-serif] text-[0.75rem] leading-[1.2] text-[var(--color-primary)] uppercase sm:text-[0.875rem]">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {isSortable && <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                                                    </span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length + (allowRowSelect ? 1 : 0)}
                                            className="pt-4 text-center font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-secondary)] sm:text-[1rem]"
                                        >
                                            No data available.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row, index) => {
                                        const isSelected = row.getIsSelected();
                                        return (
                                            <tr
                                                className={`border-b-[0.3px] border-[var(--color-border-light)] ${isSelected ? 'bg-[var(--color-slate-100)]' : index % 2 === 0 ? 'bg-[var(--color-near-white)]' : 'bg-[var(--color-white)]'
                                                    }`}
                                                key={row.id}
                                            >
                                                {allowRowSelect && (
                                                    <td className="px-1.5 py-2 sm:px-2.5 sm:py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.getIsSelected()}
                                                            onChange={row.getToggleSelectedHandler()}
                                                            className="h-4 w-4 cursor-pointer rounded accent-[var(--color-bbp-red)]"
                                                        />
                                                    </td>
                                                )}
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        className="px-1.5 py-2 font-['DM_Sans',sans-serif] text-xs font-normal text-[var(--color-black)] sm:px-2.5 sm:py-3 sm:text-sm md:text-[1rem]"
                                                        key={cell.id}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div
                        className={`flex flex-col items-center gap-3 sm:flex-row sm:gap-0 ${showPageSizeDropdown ? 'sm:justify-between' : 'sm:justify-end'} mt-4 px-4`}
                    >
                        {showPageSizeDropdown && (
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="pageSizeSelect"
                                    className="font-['DM_Sans',sans-serif] text-xs font-normal text-[var(--color-primary)] sm:text-[0.875rem]"
                                >
                                    Items per page
                                </label>
                                <select
                                    id="pageSizeSelect"
                                    value={pageAndLimit?.limit ?? 10}
                                    onChange={(e) => onPageLimitChange?.({ page: 1, limit: Number(e.target.value) })}
                                    className="rounded border border-[var(--color-primary)] px-2 py-1 font-['DM_Sans',sans-serif] text-xs text-[var(--color-primary)] focus:ring-2 focus:outline-none sm:text-[0.875rem]"
                                >
                                    {[10, 20, 30, 50].map((item) => (
                                        <option key={item} value={item} className='text-[var(--color-primary)]'>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {paginationOn && pageAndLimit && totalRecords !== undefined && (
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="text-[var(--color-primary)] sm:mr-10">
                                    {(pageAndLimit.page - 1) * pageAndLimit.limit + 1} {' – '}
                                    {Math.min(pageAndLimit.page * pageAndLimit.limit, totalRecords)} {' of '}
                                    {totalRecords}
                                </div>
                                <button
                                    onClick={() => updatePageLimit(1, pageAndLimit.limit)}
                                    disabled={pageAndLimit.page === 1}
                                    className="text-[var(--color-primary)] transition-colors hover:text-[var(--color-bbp-red)] disabled:opacity-30"
                                >
                                    <ChevronFirst size={14} className="sm:h-5 sm:w-5" />
                                </button>

                                <button
                                    onClick={() => updatePageLimit(pageAndLimit.page - 1, pageAndLimit.limit)}
                                    disabled={pageAndLimit.page === 1}
                                    className="text-[var(--color-primary)] transition-colors hover:text-[var(--color-bbp-red)] disabled:opacity-30"
                                >
                                    <ChevronLeft size={14} className="sm:h-5 sm:w-5" />
                                </button>

                                <button
                                    onClick={() => updatePageLimit(pageAndLimit.page + 1, pageAndLimit.limit)}
                                    disabled={pageAndLimit.page * pageAndLimit.limit >= totalRecords}
                                    className="text-[var(--color-primary)] transition-colors hover:text-[var(--color-bbp-red)] disabled:opacity-30"
                                >
                                    <ChevronRight size={14} className="sm:h-5 sm:w-5" />
                                </button>

                                <button
                                    onClick={() =>
                                        updatePageLimit(
                                            Math.ceil(totalRecords / pageAndLimit.limit),
                                            pageAndLimit.limit
                                        )
                                    }
                                    disabled={pageAndLimit.page * pageAndLimit.limit >= totalRecords}
                                    className="text-[var(--color-primary)] transition-colors hover:text-[var(--color-bbp-red)] disabled:opacity-30"
                                >
                                    <ChevronLast size={14} className="sm:h-5 sm:w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReactTable;
