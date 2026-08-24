"use client"

import StatCard from '@/components/common/StatCard'
import { Gauge } from 'lucide-react'
import { useGetSuperAdminSummaryCardQuery } from '@/store/admin/dashboard'
import SuperAdminCharts from './SuperAdminCharts'
import SystemHealth from './SystemHealth'

const SuperAdminDashboard = () => {
    const { data: summaryCards, isLoading } = useGetSuperAdminSummaryCardQuery()

    return (
        <div>
            <h3 className='text-xl font-bold mb-3'>Dashboard Summary</h3>
            {/* Stat card section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5">
                <StatCard
                    key={1}
                    title='Total Businesses'
                    value={`${summaryCards?.data?.totalBusinesses ?? '-'}`}
                    iconName={Gauge}
                    // trendValue={summaryCards?.data?.totalRevenue?.change || ''}
                    // trend={summaryCards?.data?.totalRevenue?.trend || ''}
                    borderColor='border-b-indigo-600'
                    loading={isLoading}
                />
                <StatCard
                    key={2}
                    title='Active Businesses'
                    value={`${summaryCards?.data?.activeSubscriptions ?? '-'}`}
                    iconName={Gauge}
                    // trendValue={summaryCards?.data?.totalRevenue?.change || ''}
                    // trend={summaryCards?.data?.totalRevenue?.trend || ''}
                    borderColor='border-b-yellow-400'
                    loading={isLoading}
                />
                <StatCard
                    key={3}
                    title='Inactive Businesses'
                    value={`${summaryCards?.data?.inactiveSubscriptions ?? '-'}`}
                    iconName={Gauge}
                    // trendValue={summaryCards?.data?.totalRevenue?.change || ''}
                    // trend={summaryCards?.data?.totalRevenue?.trend || ''}
                    borderColor='border-b-purple-800'
                    loading={isLoading}
                />
                <StatCard
                    key={4}
                    title='Total Sell'
                    value={`${summaryCards?.data?.totalRevenue ?? '-'}`}
                    iconName={Gauge}
                    // trendValue={summaryCards?.data?.totalRevenue?.change || ''}
                    // trend={summaryCards?.data?.totalRevenue?.trend || ''}
                    borderColor='border-b-green-800'
                    loading={isLoading}
                />
                <StatCard
                    key={5}
                    title='Expire Soon'
                    value={`${summaryCards?.data?.expiringSoon ?? '-'}`}
                    iconName={Gauge}
                    // trendValue={summaryCards?.data?.totalRevenue?.change || ''}
                    // trend={summaryCards?.data?.totalRevenue?.trend || ''}
                    borderColor='border-b-rose-700'
                    loading={isLoading}
                />
            </div>
            <SuperAdminCharts />
            <SystemHealth />
        </div>
    )
}

export default SuperAdminDashboard