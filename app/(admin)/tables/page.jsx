import Loading from '@/components/common/Loading'
import TableList from '@/components/modules/admin/TableManagement/TableList'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <TableList />
    </Suspense>
  )
}

export default page