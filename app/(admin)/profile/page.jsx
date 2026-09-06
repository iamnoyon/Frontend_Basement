import Loading from '@/components/common/Loading'
import ProfilePage from '@/components/modules/Profile/ProfilePage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ProfilePage />
    </Suspense>
  )
}

export default page