import Loading from '@/components/common/Loading'
import EditPackage from '@/components/modules/admin/PackageManagement/EditPackage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <EditPackage />
    </Suspense>
  )
}

export default page
