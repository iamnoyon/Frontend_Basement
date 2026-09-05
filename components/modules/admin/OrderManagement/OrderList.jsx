/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CardLayout from "@/components/common/CardLayout";
import { useMemo, useState } from "react";
import { Trash2, List, Plus } from "lucide-react";
import ReactTable from "@/components/common/ReactTable/ReactTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect } from "react";
import Swal from "sweetalert2";
import useToaster from "@/components/hooks/useToaster";
import useDebounce from "@/components/hooks/useDebounce";
import {
  useLazyGetOrderListQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from "@/store/admin/order";

const columnHelper = createColumnHelper();

const isAdmin = true;

const OrderList = ({ onEditOrder }) => {
  const [pageAndLimit, setPageAndLimit] = useState({ page: 1, limit: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { successToaster, errorToaster } = useToaster();

  const [triggerList, { data: orderList, isLoading }] =
    useLazyGetOrderListQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  useEffect(() => {
    triggerList({
      page: pageAndLimit.page,
      limit: pageAndLimit.limit,
      search: debouncedSearch,
    });
  }, [pageAndLimit, debouncedSearch]);

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor("sl", {
        id: "sl",
        header: () => "SL No.",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {(pageAndLimit.page - 1) * pageAndLimit.limit + info.row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor("orderId", {
        id: "orderId",
        header: () => "Order ID",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("tableName", {
        id: "tableName",
        header: () => "Table",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("totalBill", {
        id: "totalBill",
        header: () => "Total Bill",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            ৳{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("discount", {
        id: "discount",
        header: () => "Discount",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            ৳{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("subTotal", {
        id: "subTotal",
        header: () => "Sub Total",
        cell: (info) => (
          <span className="font-['DM_Sans',sans-serif] text-sm text-[#1f2937]">
            ৳{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("billStatus", {
        id: "billStatus",
        header: () => "Payment",
        cell: (info) => {
          const isPaid = info.getValue() === "paid";
          const orderId = info.row.original.id;

          return isPaid ? (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-green-50 text-green-700 border-green-200`}
            >
              <span className={`h-2 w-2 rounded-full bg-green-500`} />
              Paid
            </span>
          ) : (
            <button
              onClick={() =>
                Swal.fire({
                  title: "Confirm Payment",
                  icon: "info",
                  draggable: true,
                  width: "350px",
                  padding: "1.25rem",
                  showCancelButton: true,
                  confirmButtonColor: "#043570",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, mark as paid",
                  cancelButtonText: "Cancel",
                  didOpen: (popup) => {
                    popup.style.zIndex = "10001";
                    const icon = popup.querySelector(".swal2-icon");
                    if (icon) icon.style.transform = "scale(0.7)";
                  },
                }).then((result) => {
                  if (result.isConfirmed) {
                    updateOrderStatus({
                      id: orderId,
                      data: { billStatus: "paid" },
                    });
                  }
                })
              }
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-red-50 text-red-700 border-red-200 cursor-pointer hover:bg-red-100 transition-colors`}
            >
              <span className={`h-2 w-2 rounded-full bg-red-500`} />
              Unpaid
            </button>
          );
        },
      }),
    ];

    if (isAdmin) {
      cols.push(
        columnHelper.display({
          id: "actions",
          header: () => "Actions",
          cell: (info) => {
            const order = info.row.original;
            const isPaid = order.billStatus === "paid";

            return (
              <div className="flex items-center gap-1">
                <Trash2
                  size={16}
                  className={`mr-2 ${isPaid ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
                  onClick={
                    isPaid
                      ? undefined
                      : () =>
                          Swal.fire({
                            title: "Are you sure?",
                            text: "You won't be able to revert this!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#3085d6",
                            confirmButtonText: "Yes, delete it!",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              deleteOrder(order?.id)
                                .unwrap()
                                .then((res) => {
                                  if (res?.success) {
                                    successToaster(res?.message);
                                  }
                                })
                                .catch((err) => {
                                  errorToaster(
                                    err?.data?.message ||
                                      "Failed to delete order",
                                  );
                                });
                            }
                          })
                  }
                />
              </div>
            );
          },
        }),
      );
    }

    return cols;
  }, [pageAndLimit]);

  return (
    <CardLayout
    >
      <ReactTable
        columns={columns}
        dataSource={orderList?.dataSource || []}
        isLoading={isLoading}
        totalRecords={orderList?.totalRecords}
        showPageSizeDropdown={orderList?.totalRecords > pageAndLimit.limit}
        paginationOn={orderList?.paginationOn}
        pageAndLimit={pageAndLimit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPageLimitChange={({ page, limit }) => {
          setPageAndLimit({ page, limit });
        }}
      />
    </CardLayout>
  );
};

export default OrderList;
