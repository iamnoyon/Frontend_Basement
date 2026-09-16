"use client";

import { useGetRecentOderListQuery } from "@/store/admin/dashboard";

export default function RecentOrderTable() {
    const {
        data: recentOrders,
        isLoading,
        isFetching,
    } = useGetRecentOderListQuery(
        { limit: 5 },
        {
            pollingInterval: 5 * 60 * 1000,
            skipPollingIfUnfocused: true,
        }
    );

    const loading = isLoading || isFetching;

    return (
        <RecentOrderTableContent
            data={recentOrders?.data || []}
            loading={loading}
        />
    );
}

function RecentOrderTableContent({
    data = [],
    loading = false,
}) {
    return (
        <div className="w-full overflow-hidden rounded-lg border border-[var(--color-gray-200)] bg-[var(--color-white)] shadow-sm">
            {/* Mobile horizontal scroll */}
            <div className="bg-[var(--color-primary-table-header)]">
            <h2 className="font-bold ml-5 py-2 text-[var(--color-white)]">Recent Orders</h2>
            </div>
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-gray-50)]">
                        <tr>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--color-gray-700)] sm:px-5">
                                Order no.
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--color-gray-700)] sm:px-5">
                                Table
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[var(--color-gray-700)] sm:px-5">
                                Amount
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[var(--color-gray-700)] sm:px-5">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-gray-100)]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={`skeleton-${index}`}>
                                    <td className="px-4 py-4 sm:px-5">
                                        <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-gray-200)]" />
                                    </td>

                                    <td className="px-4 py-4 sm:px-5">
                                        <div className="h-4 w-20 animate-pulse rounded bg-[var(--color-gray-200)]" />
                                    </td>

                                    <td className="px-4 py-4 sm:px-5">
                                        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-[var(--color-gray-200)]" />
                                    </td>

                                    <td className="px-4 py-4 sm:px-5">
                                        <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-[var(--color-gray-200)]" />
                                    </td>
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((item) => (
                                <tr
                                    key={item?.orderId}
                                    className="transition-colors hover:bg-[var(--color-gray-50)]"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[var(--color-gray-900)] sm:px-5">
                                        {item?.orderId}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-gray-500)] sm:px-5">
                                        {item?.tableName}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-[var(--color-gray-900)] sm:px-5">
                                        ৳ {item?.subTotal}
                                    </td>

                                    <td className="px-4 py-3 text-right sm:px-5">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                                item?.billStatus === "paid"
                                                    ? "bg-[var(--color-green-50)] text-[var(--color-green-600)]"
                                                    : "bg-[var(--color-red-50)] text-[var(--color-red-600)]"
                                            }`}
                                        >
                                            {item?.billStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-5 py-8 text-center text-sm text-[var(--color-gray-500)]"
                                >
                                    No recent orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}