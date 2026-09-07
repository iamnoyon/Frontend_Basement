import Loading from '@/components/common/Loading'
import UserEdit from '@/components/modules/User-management/User/UserEdit'
import UserPermissionUpdate from '@/components/modules/admin/User-management/User/UserPermissionUpdate'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className='flex flex-col gap-10'>
        <UserEdit />
        <UserPermissionUpdate />
      </div>
    </Suspense>
  )
}

export default page