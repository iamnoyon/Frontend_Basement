'use client';

/**
 * Durga Puja entries of one feature, one row per ward (GET /durga-puja/list?feature_id=:id).
 * The API groups wards by union name; the store flattens that to [{ key, union_name, ward_no, villages }].
 * Every ward is listed; wards with no entry yet have an empty villages list.
 */

import CardLayout from '@/components/common/CardLayout';
import { useMemo, useState } from 'react';
import { Landmark, Phone, Plus } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import ReactTable from '@/components/common/ReactTable/ReactTable';
import TableSkeleton from '@/components/common/ReactTable/TableSkeleton';
import { useGetDurgaPujaListQuery, useGetFeaturesDropdownQuery } from '@/store/publilc_map';

const columnHelper = createColumnHelper();

const textClass = "font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-heading)]";

// Lower-cased text of a row that the search box matches against.
const searchText = (row) =>
    [
        row.union_name,
        row.ward_code,
        row.ward_no != null ? `ward ${row.ward_no}` : '',
        ...(row.villages ?? []).flatMap((v) => [v.village_name, v.mondir_name, v.phone]),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

const columns = [
    columnHelper.display({
        id: 'sl',
        header: () => 'SL No.',
        cell: (info) => <span className={textClass}>{info.row.index + 1}</span>,
    }),
    columnHelper.accessor('union_name', {
        id: 'union_name',
        header: () => 'Union',
        cell: (info) => <span className={textClass}>{info.getValue() || '-'}</span>,
        enableSorting: true,
    }),
    columnHelper.accessor('ward_no', {
        id: 'ward_no',
        header: () => 'Ward',
        cell: (info) => {
            const { ward_no, ward_code } = info.row.original;
            return (
                <div className={textClass}>
                    <div>{ward_no != null ? `Ward ${ward_no}` : 'Whole area'}</div>
                    {ward_code && <div className="font-mono text-xs text-[var(--color-gray-500)]">{ward_code}</div>}
                </div>
            );
        },
    }),
    columnHelper.accessor('villages', {
        id: 'villages',
        header: () => 'Village / Mondir / Phone',
        cell: (info) => {
            const villages = info.getValue() ?? [];
            if (!villages.length) return <span className="text-sm italic text-[var(--color-gray-400)]">No mondirs added</span>;
            return (
                <ul className="space-y-1.5 py-1">
                    {villages.map((v, i) => (
                        <li key={`${v.village_name}-${v.mondir_name}-${i}`} className={textClass}>
                            <span className="text-[var(--color-gray-500)]">Village: </span>{v.village_name || '-'}
                            <span className="mx-2 text-[var(--color-gray-300)]">|</span>
                            <span className="text-[var(--color-gray-500)]">Mondir: </span>
                            <span className="font-medium">{v.mondir_name || '-'}</span>
                            <span className="mx-2 text-[var(--color-gray-300)]">|</span>
                            {v.phone ? (
                                <a href={`tel:${v.phone}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                                    <Phone size={12} />
                                    {v.phone}
                                </a>
                            ) : (
                                '-'
                            )}
                        </li>
                    ))}
                </ul>
            );
        },
    }),
    columnHelper.accessor((row) => row.villages?.length ?? 0, {
        id: 'mondir_count',
        header: () => 'Mondirs',
        cell: (info) => {
            const count = info.getValue();
            return (
                <span
                    className={`inline-block rounded-full px-3 py-1 text-[0.875rem] font-medium ${
                        count
                            ? 'bg-[var(--color-success)] text-[var(--color-white)]'
                            : 'bg-[var(--color-gray-200)] text-[var(--color-gray-600)]'
                    }`}
                >
                    {count}
                </span>
            );
        },
        enableSorting: true,
    }),
];

const PujaList = () => {
    const [pageAndLimit, setPageAndLimit] = useState({ page: 1, limit: 10 });
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyWithMondirs, setOnlyWithMondirs] = useState(false);

    // API
    const { data: featureData } = useGetFeaturesDropdownQuery();
    const features = featureData?.data || [];
    const [pickedFeatureId, setPickedFeatureId] = useState(null);
    const featureId = pickedFeatureId ?? features[0]?.id ?? null;
    // currentData (not data) so the previous feature's rows don't linger while the next one loads.
    const { currentData, isFetching, error } = useGetDurgaPujaListQuery({ featureId }, { skip: featureId == null });
    const rows = useMemo(() => currentData?.data || [], [currentData]);

    const dataSource = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return rows.filter(
            (row) => (!onlyWithMondirs || row.villages?.length) && (!query || searchText(row).includes(query)),
        );
    }, [rows, searchQuery, onlyWithMondirs]);

    const mondirTotal = rows.reduce((sum, row) => sum + (row.villages?.length ?? 0), 0);
    const wardsWithMondirs = rows.filter((row) => row.villages?.length).length;

    // Filters change the row count, so go back to the first page.
    const changeSearch = (value) => {
        setSearchQuery(value);
        setPageAndLimit((prev) => ({ ...prev, page: 1 }));
    };

    const filters = (
        <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--color-gray-700)]">
                <input
                    type="checkbox"
                    checked={onlyWithMondirs}
                    onChange={(e) => {
                        setOnlyWithMondirs(e.target.checked);
                        setPageAndLimit((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="h-4 w-4 cursor-pointer"
                />
                Only wards with mondirs
            </label>
            <select
                value={featureId ?? ''}
                onChange={(e) => {
                    setPickedFeatureId(Number(e.target.value));
                    setPageAndLimit((prev) => ({ ...prev, page: 1 }));
                }}
                disabled={features.length === 0}
                aria-label="Feature"
                className="h-[38px] min-w-56 rounded-lg border border-[var(--color-gray-300)] bg-[var(--color-white)] px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-gray-300)]"
            >
                {features.length === 0 && <option value="">No features</option>}
                {features.map((f) => (
                    <option key={f.id} value={f.id}>
                        {f.title}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <CardLayout
            title="Puja List"
            titleIcon={Landmark}
            buttonText="Add Puja Data"
            buttonIcon={Plus}
            buttonHref="/puja-management/create"
        >
            {rows.length > 0 && (
                <div className="mx-4 mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div>
                        <span className="text-[var(--color-gray-500)]">Wards: </span>
                        <span className="font-semibold">{rows.length}</span>
                    </div>
                    <div>
                        <span className="text-[var(--color-gray-500)]">Wards with mondirs: </span>
                        <span className="font-semibold">{wardsWithMondirs}</span>
                    </div>
                    <div>
                        <span className="text-[var(--color-gray-500)]">Total mondirs: </span>
                        <span className="font-semibold">{mondirTotal}</span>
                    </div>
                </div>
            )}

            {error ? (
                <div className="m-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
                    Failed to load Durga Puja list ({error.status})
                </div>
            ) : isFetching && !currentData ? (
                <TableSkeleton rowLength={10} columnLength={columns.length} />
            ) : (
                <div className="mt-3">
                    <ReactTable
                        columns={columns}
                        dataSource={dataSource}
                        totalRecords={dataSource.length}
                        pageAndLimit={pageAndLimit}
                        showPageSizeDropdown={dataSource.length > 10}
                        paginationOn={false}
                        searchQuery={searchQuery}
                        onSearchChange={changeSearch}
                        onPageLimitChange={({ page, limit }) => setPageAndLimit({ page, limit })}
                        ExtraContent={filters}
                    />
                </div>
            )}
        </CardLayout>
    );
};

export default PujaList;
