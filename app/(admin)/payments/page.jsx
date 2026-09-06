import Loading from '@/components/common/Loading';
import PaymentList from '@/components/modules/admin/PaymentManagement/PaymentList';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentList />
    </Suspense>
  );
};

export default page;
