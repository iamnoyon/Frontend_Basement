"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetAdminWithBusinessQuery } from "@/store/admin/user-management";
import {
  useLazyGetPackageListQuery,
  useAdminPurchasePackageMutation,
} from "@/store/admin/package";
import {
  User,
  Building2,
  ChevronDown,
  Loader2,
  CreditCard,
  Check,
} from "lucide-react";
import Loading from "@/components/common/Loading";
import useToaster from "@/components/hooks/useToaster";
import { useRouter } from "next/navigation";

const MakePayment = () => {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const { successToaster, errorToaster } = useToaster();

  const { data: userData, isLoading, isError } = useGetAdminWithBusinessQuery();
  const [triggerPackageList, { data: packageList, isLoading: packageLoading }] =
    useLazyGetPackageListQuery();
  const [adminPurchase, { isLoading: isPaying }] =
    useAdminPurchasePackageMutation();

  useEffect(() => {
    triggerPackageList();
  }, [triggerPackageList]);

  const users = useMemo(() => {
    if (Array.isArray(userData)) return userData;
    if (Array.isArray(userData?.data)) return userData.data;
    if (Array.isArray(userData?.dataSource)) return userData.dataSource;
    return [];
  }, [userData]);
  const selectedUser = useMemo(
    () => users.find((u) => String(u?.id) === String(selectedUserId)) || null,
    [users, selectedUserId]
  );

  const packages = useMemo(
    () => packageList?.dataSource || [],
    [packageList]
  );

  const canSubmit = !!selectedPackage && !!selectedUser && !isPaying;

  const handleSubmit = () => {
    if (!selectedUser) {
      errorToaster("Please select a user.");
      return;
    }
    if (!selectedPackage) {
      errorToaster("Please select a package.");
      return;
    }
    adminPurchase({
      packageId: selectedPackage?.id,
      adminId: selectedUser?.id,
    })
      .unwrap()
      .then((res) => {
        if (res?.success) {
          router.push("/payments");
          successToaster(res?.message || "Package purchased successfully");
          if (res?.data?.gatewayUrl) {
            window.location.href = res.data.gatewayUrl;
          }
        }
      })
      .catch((err) => {
        errorToaster(err?.data?.message || "Failed to purchase package");
      });
  };

  return (
    <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-200 flex-shrink-0">
            <CreditCard size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 tracking-tight">
              Make Payment
            </h2>
            <p className="text-xs text-gray-400">
              Select user and a package to create payment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              canSubmit
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-200/40 hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPaying ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Dropdown */}
        <div className="max-w-md">
          <label
            htmlFor="user-select"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Select User
          </label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isLoading}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-800 focus:border-[#043570] focus:outline-none focus:ring-2 focus:ring-[#043570]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">
                {isLoading ? "Loading users..." : "Choose a user"}
              </option>
              {users.map((user) => (
                <option key={user?.id} value={user?.id}>
                  {user?.name}
                  {user?.email ? ` (${user.email})` : ""}
                </option>
              ))}
            </select>
            {isLoading ? (
              <Loader2
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
              />
            ) : (
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            )}
          </div>
        </div>

        {/* Selected User Details */}
        {selectedUser ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <User size={14} className="text-[#043570]" />
                <span>User Name</span>
              </div>
              <p className="mt-2 text-base font-semibold text-[#1f2937]">
                {selectedUser?.name || "—"}
              </p>
              {selectedUser?.email && (
                <p className="mt-1 text-xs text-gray-500">{selectedUser.email}</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Building2 size={14} className="text-[#043570]" />
                <span>Business Name</span>
              </div>
              <p className="mt-2 text-base font-semibold text-[#1f2937]">
                {selectedUser?.businessName || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
            {isError
              ? "Failed to load users."
              : isLoading
                ? "Loading users..."
                : "No user selected."}
          </div>
        )}

        {/* Packages */}
        {packageLoading ? (
          <div className="flex justify-center py-10">
            <Loading />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-200/30"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}

                    <h3 className="text-base font-bold text-gray-800 mb-2">
                      {pkg.packageName}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        ${pkg.price}
                      </span>
                      <span className="text-sm text-gray-400">
                        / {pkg.numberOfMonth}{" "}
                        {pkg.numberOfMonth > 1 ? "months" : "month"}
                      </span>
                    </div>

                    {pkg.shortNote && (
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                        {pkg.shortNote}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          pkg.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pkg.status === "active" ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {packages.length === 0 && !packageLoading && (
              <p className="text-center text-sm text-gray-400 py-8">
                No packages available
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MakePayment;
