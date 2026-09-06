import Loading from '@/components/common/Loading'
import EditExpense from '@/components/modules/admin/ExpenseManagement/EditExpense'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <EditExpense />
    </Suspense>
  )
}

export default page