import Loading from '@/components/common/Loading';
import MakePayment from '@/components/modules/admin/PaymentManagement/MakePayment';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <MakePayment />
    </Suspense>
  );
};

export default page;
