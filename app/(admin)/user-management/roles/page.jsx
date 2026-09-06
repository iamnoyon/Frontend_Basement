import Loading from '@/components/common/Loading'
import RoleManagementPage from '@/components/modules/User-management/Role/RoleManagementPage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <RoleManagementPage />
    </Suspense>
  )
}

export default page