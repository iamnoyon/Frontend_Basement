import React, { Suspense } from 'react'
import UserList from '@/components/modules/admin/User-management/User/UserList';
import Loading from '@/components/common/Loading';

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserList />
    </Suspense>
  )
}

export default page