import Loading from '@/components/common/Loading';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#043570]">Edit Payment</h2>
      </div>
    </Suspense>
  );
};

export default page;
