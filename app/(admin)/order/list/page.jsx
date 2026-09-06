import Loading from '@/components/common/Loading'
import OrderList from '@/components/modules/admin/OrderManagement/OrderList'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <OrderList />
    </Suspense>
  )
}

export default page