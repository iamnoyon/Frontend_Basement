import Loading from '@/components/common/Loading'
import CreateTable from '@/components/modules/admin/TableManagement/CreateTable'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateTable />
    </Suspense>
  )
}

export default page