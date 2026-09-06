import React, { Suspense } from 'react'
import CreateProductCategory from '@/components/modules/admin/product-management/productCategory/CreateProductCategory'
import Loading from '@/components/common/Loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateProductCategory />
    </Suspense>
  )
}

export default page