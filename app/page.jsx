'use client';
import LoginPage from '@/components/modules/public/LoginPage'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic';
import Loading from '@/components/common/Loading';

// Leaflet accesses `window` on import, so it must never render on the server.
const DhamraiMap = dynamic(() => import('@/components/modules/map/DhamraiMap'), {
  ssr: false,
  loading: () => <div className="h-dvh w-full animate-pulse bg-gray-100" />,
});

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="h-dvh w-full">
        <DhamraiMap />
      </div>
    </Suspense>
  )
}

export default page