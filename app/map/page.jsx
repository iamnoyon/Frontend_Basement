'use client';

import dynamic from 'next/dynamic';

// Leaflet accesses `window` on import, so it must never render on the server.
const DhamraiMap = dynamic(() => import('@/components/modules/map/DhamraiMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-100" />,
});

export default function MapPage() {
  return <DhamraiMap />;
}
