import Loading from '@/components/common/Loading'
import CreateExpense from '@/components/modules/admin/ExpenseManagement/CreateExpense'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
        <CreateExpense />
    </Suspense>
  )
}

export default page