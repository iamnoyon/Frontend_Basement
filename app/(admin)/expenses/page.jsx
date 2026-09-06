import Loading from '@/components/common/Loading'
import ExpenseList from '@/components/modules/admin/ExpenseManagement/ExpenseList'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <ExpenseList />
    </Suspense>
  )
}

export default page