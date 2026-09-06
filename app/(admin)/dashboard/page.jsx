import Loading from '@/components/common/Loading'
import RenderDashboard from '@/components/modules/admin/AdminDashboard/RenderDashboard'
import React from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <RenderDashboard />
    </Suspense>
  )
}

export default page