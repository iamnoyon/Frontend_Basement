import React, { Suspense } from 'react'
import ProductList from '@/components/modules/admin/product-management/products/ProductList'
import Loading from '@/components/common/Loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  )
}

export default page