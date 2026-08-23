"use client"

import StatCard from '@/components/common/StatCard'
import React from 'react'
import { useGetAdminChartQuery, useGetAdminSummaryCardQuery } from '@/store/admin/dashboard'
import { BanknoteArrowDown, Gauge, Receipt, ShieldCheck, Utensils, Banknote } from 'lucide-react'
import ReactBarChart from '@/components/common/ReactBarChart'
import ReactPieChart from '@/components/common/ReactPieChart'
import ReactKPICard from '@/components/common/ReactKPICard'
import RecentOrderTable from './RecentOrderTable'


const AdminDashboard = () => {
  const { data: summaryCards, isLoading } = useGetAdminSummaryCardQuery({pollingInterval: 5 * 60 * 1000})
  const { data: chartData, isLoading: chartLoading } = useGetAdminChartQuery({pollingInterval: 5 * 60 * 1000})
  return (
    <div>
      {/* Stat card section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          key={1}
          title='Total Revenue'
          value={`৳ ${summaryCards?.data?.totalRevenue?.value ?? '-'}`}
          iconName={Gauge}
          trendValue={summaryCards?.data?.totalRevenue?.change}
          trend={summaryCards?.data?.totalRevenue?.trend}
          borderColor='border-b-indigo-600'
          loading={isLoading}
        />
        <StatCard
          key={2}
          title='Others Expense'
          value={`৳ ${summaryCards?.data?.totalExpenses?.value ?? '-'}`}
          iconName={Banknote}
          trendValue={summaryCards?.data?.totalExpenses?.change}
          trend={summaryCards?.data?.totalExpenses?.trend}
          borderColor='border-b-rose-700'
          isExpense={true}
          loading={isLoading}
        />
        <StatCard
          key={3}
          title='Total Orders'
          value={summaryCards?.data?.totalOrders?.value ?? '-'}
          iconName={Utensils}
          trendValue={summaryCards?.data?.totalOrders?.change}
          trend={summaryCards?.data?.totalOrders?.trend}
          borderColor='border-b-green-800'
          loading={isLoading}
        />
        <StatCard
          key={4}
          title='Net Profit'
          value={`৳ ${summaryCards?.data?.netProfit?.value ?? '-'}`}
          iconName={Receipt}
          trendValue={summaryCards?.data?.netProfit?.change}
          trend={summaryCards?.data?.netProfit?.trend}
          borderColor='border-b-purple-800'
          loading={isLoading}
        />
        {/* <StatCard
          key={5}
          title='Total Discount'
          value={summaryCards?.data?.totalDiscount?.value}
          iconName={summaryCards?.[0]?.iconName}
          trendValue={summaryCards?.data?.totalDiscount?.change}
          trend={summaryCards?.data?.totalDiscount?.trend}
          borderColor='border-b-lime-600'
        /> */}
      </div>

      {/* Chart section */}
      <div className='grid grid-cols-1 gap-5 lg:gap-10 sm:grid-cols-2 my-5'>
        <ReactBarChart
          title={`Total Revenue (${chartData?.data?.labels[0]?.split('-')[0]})`}
          xKey='monthName'
          data={chartData?.data?.revenuePerMonth || []}
          loading={chartLoading}
        />
        <ReactBarChart
          title={`Net Profit (${chartData?.data?.labels[0]?.split('-')[0]})`}
          xKey='monthName'
          color='#249D8F'
          data={chartData?.data?.netProfitPerMonth || []}
          loading={chartLoading}
        />
      </div>
      <div className='grid grid-cols-1 gap-5 lg:gap-10 sm:grid-cols-2'>
        <RecentOrderTable />
        <ReactPieChart 
        data={chartData?.data?.pieChart || []}
        title='Profit/Expense'
        loading={chartLoading}
        /> 
        {/* <ReactKPICard data={chartData?.data?.pieChart || []}/>  */}
      </div>
    </div>
  )
}

export default AdminDashboard