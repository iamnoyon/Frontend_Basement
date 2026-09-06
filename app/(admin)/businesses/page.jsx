import Loading from '@/components/common/Loading'
import BusinessesList from '@/components/modules/admin/Businesses/BusinessesList'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <BusinessesList />
    </Suspense>
  )
}

export default page