import Loading from '@/components/common/Loading'
import EditTable from '@/components/modules/admin/TableManagement/EditTable'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <EditTable />
    </Suspense>
  )
}

export default page