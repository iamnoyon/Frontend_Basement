import React, { Suspense } from 'react'
import EditProduct from '@/components/modules/admin/product-management/products/EditProduct'
import Loading from '@/components/common/Loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <EditProduct />
    </Suspense>
  )
}

export default page