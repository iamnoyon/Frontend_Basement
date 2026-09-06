import Loading from '@/components/common/Loading'
import PackageList from '@/components/modules/admin/PackageManagement/PackageList'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <PackageList />
    </Suspense>
  )
}

export default page