import Loading from '@/components/common/Loading'
import NewOrder from '@/components/modules/admin/OrderManagement/NewOrder'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <NewOrder />
    </Suspense>
  )
}

export default Page
