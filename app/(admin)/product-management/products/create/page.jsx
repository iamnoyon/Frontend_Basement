import React, { Suspense } from 'react'
import CreateProduct from '@/components/modules/admin/product-management/products/CreateProduct'
import Loading from '@/components/common/Loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateProduct />
    </Suspense>
  )
}

export default page