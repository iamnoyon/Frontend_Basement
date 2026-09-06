import Loading from '@/components/common/Loading'
import UserCreate from '@/components/modules/User-management/User/UserCreate'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserCreate />
    </Suspense>
      
  )
}

export default page