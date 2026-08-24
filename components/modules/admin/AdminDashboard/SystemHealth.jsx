"use client"
import ReactKPICard from '@/components/common/ReactKPICard'
import ReactLineChart from '@/components/common/ReactLineChart';
import { useGetSystemHealthLineChartQuery, useGetSystemHealthQuery } from '@/store/admin/health'
import React, { memo } from 'react'

const SUFFIX_MAP = {
    "CPU Usage": "%",
    "Memory Usage": "%",
};

const SystemHealth = () => {
    const { data: response, isLoading } = useGetSystemHealthQuery()
    const { data: lineData, isLoading: lineLoading } = useGetSystemHealthLineChartQuery()
    const raw = response?.data || response || [];
    const performance = Array.isArray(raw) ? raw.map((item) => ({
        ...item,
        suffix: item.suffix || SUFFIX_MAP[item.name] || "",
    })) : [];

    return (
        <div>
            <h3 className='text-xl font-bold mt-5'>Performance Monitoring</h3>
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 mt-3'>
                <ReactKPICard
                    title='Today Performance'
                    data={performance}
                    gridCols={2}
                    loading={isLoading}
                />
                <ReactLineChart
                    title='Performance Metrics'
                    data={lineData || []}
                    loading={lineLoading}
                />
            </div>
        </div>
    )
}

export default memo(SystemHealth)