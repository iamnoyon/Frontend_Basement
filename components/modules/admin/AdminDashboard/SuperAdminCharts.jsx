"use client"

import ReactBarChart from '@/components/common/ReactBarChart'
import ReactPieChart from '@/components/common/ReactPieChart'
import YearPicker from '@/components/common/YearPicker'
import { useLazyGetSuperAdminChartsQuery } from '@/store/admin/dashboard'
import React, { memo, useEffect, useState } from 'react'
import ExpireSoonRes from '@/components/modules/admin/AdminDashboard/ExpireSoonRes'

const SuperAdminCharts = () => {
    const [year, setYear] = useState(null)
    const [triggerChart, { data: chartData, isLoading: chartLoading }] = useLazyGetSuperAdminChartsQuery()

    useEffect(()=>{
        triggerChart({year: year})
    }, [year])

    return (
        <div className='mt-5'>
            <div className='flex justify-between items-center'>
                <h3 className='text-xl font-bold'>Dashboard Charts</h3>
                <YearPicker value={year} onChange={setYear}/>
            </div>
            {/* bar charts  */}
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 my-3'>
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
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 mt-5'>
                <ExpireSoonRes />
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

export default memo(SuperAdminCharts)