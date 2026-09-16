import React, { Suspense } from 'react'
import Loading from '@/components/common/Loading'
import FallbackDashboard from '@/components/modules/admin/AdminDashboard/FallbackDashboard'
import AdminDashboard from '@/components/modules/admin/AdminDashboard/AdminDashboard'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <FallbackDashboard />
      {/* <AdminDashboard /> */}
    </Suspense>
  )
}

export default page