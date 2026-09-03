"use client"

import React from 'react'
import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import FallbackDashboard from './FallbackDashboard';

const RenderDashboard = () => {
    const user = useSelector((state) => state?.user);
    const userRole = user?.role || '';
    console.log(user);

    if(userRole == 'admin' || userRole == 'cashier') return <AdminDashboard />
    if(userRole == 'superadmin') return <SuperAdminDashboard />
    if(userRole == 'waiter') return <FallbackDashboard />

  return null;
}

export default RenderDashboard