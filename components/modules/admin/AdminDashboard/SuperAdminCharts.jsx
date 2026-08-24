"use client"

import ReactBarChart from '@/components/common/ReactBarChart'
import ReactPieChart from '@/components/common/ReactPieChart'
import YearPicker from '@/components/common/YearPicker'
import { useLazyGetSuperAdminChartsQuery } from '@/store/admin/dashboard'
import React, { memo, useEffect, useState } from 'react'

const SuperAdminCharts = () => {
    const [year, setYear] = useState(null)
    const [triggerChart, { data: chartData, isLoading: chartLoading }] = useLazyGetSuperAdminChartsQuery()

    useEffect(()=>{
        triggerChart({year: year})
    }, [year])

    return (
        <div className='mt-5'>
            <div>
                <YearPicker className="ml-auto" value={year} onChange={setYear}/>
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

export default memo(SuperAdminCharts)