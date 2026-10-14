// components/layout/menuItems.js

import {
  Church,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";

export const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    activePath: ["/dashboard"],
  },
  // {
  //   name: "Unions",
  //   icon: Users,
  //   path: "/union-management",
  //   activePath: ["/user-management/"],
  // },
  {
    name: "Features",
    icon: Sparkles,
    path: "/feature-management",
    activePath: ["/feature-management/"],
  },
  {
    name: "Puja",
    icon: Church,
    path: "/puja-management",
    activePath: ["/puja-management/"],
  },

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
