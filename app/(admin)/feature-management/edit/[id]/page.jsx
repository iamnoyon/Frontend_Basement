import Loading from '@/components/common/Loading'
import EditFeature from '@/components/modules/admin/feature/EditFeature'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <EditFeature />
    </Suspense>
  )
}

export default page
