import Loading from '@/components/common/Loading'
import CMSContent from '@/components/modules/admin/cms/CMSContent'
import React, { Suspense } from 'react'

function page() {
  return (
    <Suspense fallback={<Loading />}>
      <CMSContent />
    </Suspense>
  )
}

export default page