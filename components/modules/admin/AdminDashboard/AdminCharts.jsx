/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import ReactBarChart from '@/components/common/ReactBarChart'
import React, { memo, useEffect, useState } from 'react'
import RecentOrderTable from './RecentOrderTable'
import ReactPieChart from '@/components/common/ReactPieChart'
import DateRangePicker from '@/components/common/DateRangePicker'
import { useLazyGetAdminChartQuery } from '@/store/admin/dashboard'

const AdminCharts = () => {
    const [dateRangeForChart, setDateRangeForChart] = useState({
        startDate: null,
        endDate: null,
    });
    const [triggerChart, { data: chartData, isLoading: chartLoading }] = useLazyGetAdminChartQuery();
     const formatParams = (range) => ({
        startDate: range.startDate
          ? range.startDate.toISOString().split('T')[0]
          : undefined,
        endDate: range.endDate
          ? range.endDate.toISOString().split('T')[0]
          : undefined,
      })
    
      useEffect(() => {
        triggerChart(formatParams(dateRangeForChart))
      }, [dateRangeForChart])

    return (
        <div>
            {/* Chart section */}
            <div className='mt-5'>
                <DateRangePicker
                    className="ml-auto"
                    value={dateRangeForChart}
                    onChange={setDateRangeForChart}
                    placeholder="Date From - Date To" />
            </div>
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

export default memo(AdminCharts)