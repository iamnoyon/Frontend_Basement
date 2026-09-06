import React, { Suspense } from 'react'
import ProductCategoryList from '@/components/modules/admin/product-management/productCategory/ProductCategoryList'
import Loading from '@/components/common/Loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ProductCategoryList />
    </Suspense>
  )
}

export default page