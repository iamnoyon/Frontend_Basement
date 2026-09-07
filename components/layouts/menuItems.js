// components/layout/menuItems.js

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Plus,
  Vault,
  ChartBarStacked,
  Banknote,
  UtensilsCrossed,
  AlignVerticalSpaceBetween,
  PanelTopDashed,
  Dock,
  ShieldCheck,
} from "lucide-react";
import { FaChrome } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { MdFormatListBulletedAdd } from "react-icons/md";

export const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    activePath: ["/dashboard"],
    requiredPermissions: ["dashboard:read"]
  },
  // {
  //   name: "Businesses",
  //   icon: LayoutDashboard,
  //   path: "/businesses",
  //   activePath: ["/businesses"],
  //   superadminOnly: true,
  // },
  // {
  //   name: "Payments",
  //   icon: Banknote,
  //   path: "/payments",
  //   activePath: ["/payments"],
  //   superadminOnly: true,
  // },
  // {
  //   name: "Orders",
  //   icon: ShoppingCart,
  //   path: "/order",
  //   activePath: ["/order"],
  //   requiredPermissions: ["order:create", "order:read"],
  // },
  // {
  //   name: "Menu Management",
  //   icon: Dock,
  //   path: "#",
  //   activePath: ["/product-management/"],
  //   requiredPermissions: ["category:read", "product:read"],
  //   children: [
  //     {
  //       name: "Category",
  //       path: "/product-management/categories",
  //       icon: AlignVerticalSpaceBetween,
  //       requiredPermissions: ["category:read"],
  //     },
  //     {
  //       name: "Menu Items",
  //       path: "/product-management/products",
  //       icon: UtensilsCrossed,
  //       requiredPermissions: ["product:read"],
  //     },
  //   ],
  // },
  // {
  //   name: "Tables",
  //   icon: Vault,
  //   path: "/tables",
  //   activePath: ["/tables"],
  //   requiredPermissions: ["table:read"],
  // },
  // {
  //   name: "Others Expense",
  //   icon: Banknote,
  //   path: "/expenses",
  //   activePath: ["/expenses"],
  //   requiredPermissions: ["expense:read"],
  // },
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
