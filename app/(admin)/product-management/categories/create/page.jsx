import React from 'react'
import CreateProductCategory from '@/components/modules/admin/product-management/productCategory/CreateProductCategory'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateProductCategory />
    </Suspense>
  )
}

export default page