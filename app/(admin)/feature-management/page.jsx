import Loading from '@/components/common/Loading'
import FeatureList from '@/components/modules/admin/feature/FeatureList'
import React, { Suspense } from 'react'

const page = () => {
    return (
        <Suspense fallback={<Loading />}>
            <FeatureList />
        </Suspense>
    )
}

export default page