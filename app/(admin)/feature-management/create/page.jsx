import Loading from '@/components/common/Loading'
import FeatureCreate from '@/components/modules/admin/feature/FeatureCreate'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <FeatureCreate />
    </Suspense>
  )
}

export default page