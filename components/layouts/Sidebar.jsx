"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./menuItems";
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";

export default function Sidebar({ onNavClick, hideToggle }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [showText, setShowText] = useState(!collapsed);

  const userPermissions = useSelector((state) => state?.user?.permissions) || [];
  const user = useSelector((state) => state?.user);
  const userRole = user?.role || '';

  const permissionValues = useMemo(() => {
    return userPermissions.map((p) => (typeof p === "string" ? p : p.value));
  }, [userPermissions]);

  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some((p) => permissionValues.includes(p));
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems
      .map((item) => {
        if (item.superadminOnly && userRole !== "superadmin") return null;
        if (item.children) {
          const filteredChildren = item.children.filter((child) =>
            hasPermission(child.requiredPermissions)
          );
          if (filteredChildren.length === 0 && !hasPermission(item.requiredPermissions)) {
            return null;
          }
          return { ...item, children: filteredChildren };
        }
        if (!hasPermission(item.requiredPermissions)) return null;
        return item;
      })
      .filter(Boolean);
  }, [permissionValues, userRole]);

  const isPathActive = (path) =>
    pathname === path || pathname.startsWith(path + "/");

  const toggleMenu = (menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleNavClick = () => {
    onNavClick?.();
  };


  useEffect(() => {
    if (collapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => {
        setShowText(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  return (
    <aside
      className={`flex h-full w-full flex-col border-r bg-[#02162e] transition-all duration-300 ${collapsed ? "lg:w-20" : "lg:w-70"
        }`}
    >
      {/* Header */}
      <div className={`relative flex h-16 items-center ${collapsed ? "px-2" : "px-6"}`}>
        {showText && (
          !user?.business?.businessName ? (
            <h1 className="text-xl font-semibold tracking-tight text-[#C98A4A]">
              {user?.business?.businessName}
            </h1>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Cloud
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-[#C98A4A]">
                Cafe
              </span>
            </div>
          )
        )}

        {!hideToggle && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-6 rounded-lg p-2 text-white transition hover:cursor-pointer hover:text-gray-300"
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
      </div>

      <div className="border-b border-[#052950]" />

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);

            const isActive =
              item.activePath?.some(isPathActive) ||
              item.children?.some((child) => isPathActive(child.path));

            const isOpen = openMenu === item.name;

            return (
              <li key={item.name}>

                {/* ── Parent: has children → button (toggle only, no nav) ── */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex w-full items-center justify-between rounded-xl py-3 text-sm font-medium transition-all hover:cursor-pointer ${collapsed ? "justify-center px-2" : "px-4"
                      } ${isActive
                        ? "bg-[#063C76] text-white shadow-md"
                        : "text-gray-300 hover:bg-[#063C76]"
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} />
                      {!collapsed && <span>{item.name}</span>}
                    </span>

                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>

                ) : (

                  /* ── Parent: no children → Link (navigates) ── */
                  <Link
                    href={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all ${collapsed ? "justify-center px-2" : "px-4"
                      } ${isActive
                        ? "bg-[#063C76] text-white shadow-md"
                        : "text-gray-300 hover:bg-[#063C76]"
                      }`}
                  >
                    <Icon size={20} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )}

                {/* ── Children ── */}
                {!collapsed && hasChildren && (
                  <ul
                    className={`ml-6 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 mt-2 opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isPathActive(child.path);

                      return (
                        <li key={child.name}>
                          <Link
                            href={child.path}
                            onClick={handleNavClick}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${childActive
                              ? "bg-[#0A4D99] text-white"
                              : "text-gray-400 hover:bg-[#063C76]"
                              }`}
                          >
                            {ChildIcon && <ChildIcon size={16} />}
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-[#052950] p-4">
          <p className="text-center text-xs text-gray-400">© 2026 <span className="text-[#C98A4A]">cloudcafe</span></p>
        </div>
      )}
    </aside>
  );
}