/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import StatCard from '@/components/common/StatCard'
import React, { useEffect, useState } from 'react'
import { useLazyGetAdminSummaryCardQuery } from '@/store/admin/dashboard'
import { Gauge, Receipt, Utensils, Banknote } from 'lucide-react'
import DateRangePicker from '@/components/common/DateRangePicker'
import AdminCharts from './AdminCharts'


const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [triggerSummary, { data: summaryCards, isLoading }] = useLazyGetAdminSummaryCardQuery()
  const formatParams = (range) => ({
    startDate: range.startDate
      ? range.startDate.toISOString().split('T')[0]
      : undefined,
    endDate: range.endDate
      ? range.endDate.toISOString().split('T')[0]
      : undefined,
  })

  useEffect(() => {
    triggerSummary(formatParams(dateRange))
  }, [dateRange])


  return (
    <div>
      <div className='mb-3'>
        <DateRangePicker
          className="ml-auto"
          value={dateRange}
          onChange={setDateRange}
          placeholder="Date From - Date To" />
      </div>
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
      <AdminCharts />
    </div>
  )
}

export default AdminDashboard