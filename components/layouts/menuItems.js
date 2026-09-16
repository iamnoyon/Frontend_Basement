// components/layout/menuItems.js

import {
  LayoutDashboard,
  Users,
} from "lucide-react";

export const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    activePath: ["/dashboard"],
    requiredPermissions: ["dashboard:read"]
  },
  {
    name: "Users",
    icon: Users,
    path: "/user-management/users",
    activePath: ["/user-management/users"],
    requiredPermissions: ["user:read"],
  }
];




export const breadcrumbData = [
    {
        route: '/user-management/users',
        items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User List', url: '#' },
        ]
    },
    {
        route: '/user-management/users/create',
         items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User List', url: '/user-management/users' },
            { label: 'Create', url: '#' },
        ]
    },
     {
        route: '/user-management/users/edit/[id]',
         items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User List', url: '/user-management/users' },
            { label: 'Edit', url: '#' },
        ]
    }
]
