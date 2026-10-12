import Loading from '@/components/common/Loading'
import CreatePujaData from '@/components/modules/admin/PujaManagement/CreatePujaData'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreatePujaData />
    </Suspense>
  )
}

export default page
