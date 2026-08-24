"use client";

import CardLayout from "@/components/common/CardLayout";
import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { useLazyGetExpiringBusinessesQuery } from "@/store/admin/dashboard";
import ReactTable from "@/components/common/ReactTable/ReactTable";
import { createColumnHelper } from "@tanstack/react-table";
import TableSkeleton from "@/components/common/ReactTable/TableSkeleton";

const columnHelper = createColumnHelper();

const ExpireSoonRes = () => {
  const [pageAndLimit, setPageAndLimit] = useState({ page: 1, limit: 5 });
  const [searchQuery, setSearchQuery] = useState("");

  const [triggerList, { data: businessesData, isLoading }] =
    useLazyGetExpiringBusinessesQuery();

  useEffect(() => {
    triggerList({
      page: pageAndLimit.page,
      limit: pageAndLimit.limit,
      ...(searchQuery && { search: searchQuery }),
    });
  }, [pageAndLimit, searchQuery]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("sl", {
        id: "sl",
        header: () => "SL No.",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {(pageAndLimit.page - 1) * pageAndLimit.limit + info.row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor("businessName", {
        id: "businessName",
        header: () => "Business Name",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("admin", {
        id: "ownerName",
        header: () => "Owner Email",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {info.getValue()?.email || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("daysToExpire", {
        id: "daysToExpire",
        header: () => "Days Left",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {info.getValue() + ' days' || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: () => "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-[0.875rem] font-medium text-yellow-800">
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : "-"}
            </span>
          );
        },
      }),
    ],
    [],
  );

  return (
    <CardLayout title="Expiring Soon Businesses" titleIcon={Clock}>
      {isLoading ? (
        <TableSkeleton rowLength={10} columnLength={columns?.length || 5} />
      ) : (
        <ReactTable
          columns={columns}
          dataSource={businessesData?.dataSource || []}
          totalRecords={businessesData?.totalRecords}
          pageAndLimit={pageAndLimit}
          showPageSizeDropdown={
            businessesData?.totalRecords > pageAndLimit.limit
          }
          paginationOn={businessesData?.paginationOn}
          // searchQuery={searchQuery}
          // onSearchChange={setSearchQuery}
          onPageLimitChange={({ page, limit }) => {
            setPageAndLimit({ page, limit });
          }}
        />
      )}
    </CardLayout>
  );
};

export default ExpireSoonRes;
