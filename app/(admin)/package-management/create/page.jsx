import Loading from '@/components/common/Loading'
import CreatePackage from '@/components/modules/admin/PackageManagement/CreatePackage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreatePackage />
    </Suspense>
  )
}

export default page
