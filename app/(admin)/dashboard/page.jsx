import React, { Suspense } from 'react'
import Loading from '@/components/common/Loading'
import FallbackDashboard from '@/components/modules/admin/AdminDashboard/FallbackDashboard'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <FallbackDashboard />
    </Suspense>
  )
}

export default page