"use client";

import { CreditCard, Calendar, CheckCircle2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useLazyGetPackageListQuery, useMakePaymentMutation } from "@/store/admin/package";
import Loading from "@/components/common/Loading";

export default function BillingInfo({ user, statusColor }) {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [triggerList, { data: packageList, isLoading }] = useLazyGetPackageListQuery();
    const [MakePayment] = useMakePaymentMutation()
    useEffect(() => {
        triggerList();
    }, []);

    const handlePayment = () => {
        MakePayment({packageId: selectedPackage?.id})
        .unwrap()
        .then((res)=>{
            if(res?.success){
                window.location.href = res?.data?.gatewayUrl;
            }
        })
    }

    const packages = packageList?.dataSource || [];

    return (
        <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-200 flex-shrink-0">
                        <CreditCard size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 tracking-tight">
                            Billing Information
                        </h2>
                        <p className="text-xs text-gray-400">Subscription & payment details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                    <button
                        onClick={handlePayment}
                        disabled={!selectedPackage}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            selectedPackage
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-200/40 hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Continue to Payment
                    </button>
                    {user?.billing_status && (
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
                            {user?.billing_status}
                        </span>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loading />
                </div>
            ) : (
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {packages.map((pkg) => {
                            const isSelected = selectedPackage?.id === pkg.id;
                            return (
                                <div
                                    key={pkg.id}
                                    onClick={() => setSelectedPackage(pkg)}
                                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-200/30'
                                            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
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
                                            / {pkg.numberOfMonth} {pkg.numberOfMonth > 1 ? 'months' : 'month'}
                                        </span>
                                    </div>

                                    {pkg.shortNote && (
                                        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                                            {pkg.shortNote}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                            pkg.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {pkg.status === 'active' ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {packages.length === 0 && !isLoading && (
                        <p className="text-center text-sm text-gray-400 py-8">No packages available</p>
                    )}

                </div>
            )}

        </div>
    );
}
