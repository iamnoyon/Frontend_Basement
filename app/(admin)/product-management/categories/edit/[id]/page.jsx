import React, { Suspense } from 'react'
import EditProductCategory from '@/components/modules/admin/product-management/productCategory/EditProductCategory.jsx'
import Loading from '@/components/common/Loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <EditProductCategory />
    </Suspense>
  )
}

export default page