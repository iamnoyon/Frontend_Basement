"use client"
import ReactKPICard from '@/components/common/ReactKPICard'
import { useGetSystemHealthQuery } from '@/store/admin/health'
import React from 'react'

const SUFFIX_MAP = {
    "CPU Usage": "%",
    "Memory Usage": "%",
};

const SystemHealth = () => {
    const {data: response} = useGetSystemHealthQuery()
    const raw = response?.data || response || [];
    const performance = Array.isArray(raw) ? raw.map((item) => ({
        ...item,
        suffix: item.suffix || SUFFIX_MAP[item.name] || "",
    })) : [];

  return (
    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 mt-5'>
        <ReactKPICard 
        title='Today Performance'
        data={performance}
        gridCols={2}
        />
    </div>
  )
}

export default SystemHealth