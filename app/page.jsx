'use client';
import LoginPage from '@/components/modules/public/LoginPage'
import React from 'react'
import dynamic from 'next/dynamic';

// Leaflet accesses `window` on import, so it must never render on the server.
const DhamraiMap = dynamic(() => import('@/components/modules/map/DhamraiMap'), {
  ssr: false,
  loading: () => <div className="h-dvh w-full animate-pulse bg-gray-100" />,
});

const page = () => {
  return (
    <div className="h-dvh w-full">
      <DhamraiMap />
    </div>
  )
}

export default page