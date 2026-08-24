"use client"

import React from 'react'
import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const RenderDashboard = () => {
    const user = useSelector((state) => state?.user);
    const userRole = user?.role || '';

    if(userRole == 'admin') return <AdminDashboard />
    if(userRole == 'superadmin') return <SuperAdminDashboard />

  return null
}

export default RenderDashboard