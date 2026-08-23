"use client"

import React, { useEffect } from 'react'
import StatCard from '@/components/common/StatCard'
import { Gauge } from 'lucide-react'
import { useGetSuperAdminSummaryCardQuery, useLazyGetSuperAdminChartsQuery } from '@/store/admin/dashboard'
import ReactBarChart from '@/components/common/ReactBarChart'
import ReactPieChart from '@/components/common/ReactPieChart'

const SuperAdminDashboard = () => {
    const { data: summaryCards, isLoading } = useGetSuperAdminSummaryCardQuery()
    const [triggerChart, { data: chartData, isLoading: chartLoading }] = useLazyGetSuperAdminChartsQuery()

    useEffect(() => {
        triggerChart({})
    }, [triggerChart])

    return (
        <div>
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

            {/* bar charts  */}
            <div className='grid grid-cols-1 gap-5 lg:gap-10 sm:grid-cols-2 my-5'>
                <ReactBarChart
                    title={`Total Revenue Per Year`}
                    xKey='monthName'
                    data={chartData?.data?.revenuePerMonth || []}
                    loading={chartLoading}
                />
                <ReactBarChart
                    title={`Total Active Business Per Year`}
                    xKey='monthName'
                    data={chartData?.data?.businesses || []}
                    loading={chartLoading}
                    yKey='count'
                    color='#249D8F'
                />
            </div>

            {/* pie chart  */}
            <div className='grid grid-cols-1 gap-5 lg:gap-10 sm:grid-cols-2'>
                <ReactPieChart
                    data={chartData?.data?.pieChart || []}
                    title='Status Overview'
                    loading={chartLoading}
                />
                {/* <ReactKPICard data={chartData?.data?.pieChart || []}/>  */}
            </div>
        </div>
    )
}

export default SuperAdminDashboard