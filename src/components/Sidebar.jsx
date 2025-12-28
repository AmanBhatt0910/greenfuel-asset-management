// src/components/Sidebar.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Package,
  FileText,
  Repeat,
  BarChart,
  Trash2,
  Archive,
  Lock,
  Menu,
  LogOut,
  ChevronRight,
  Leaf,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const menu = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
    { name: "Asset Inventory", icon: <Package size={20} />, href: "/dashboard/assets" },
    { name: "New Asset Registration", icon: <Package size={20} />, href: "/dashboard/assets/new" },
    { name: "Existing Issues", icon: <FileText size={20} />, href: "/dashboard/issues" },
    { name: "New Asset Issue", icon: <FileText size={20} />, href: "/dashboard/issues/new" },
    { name: "Transfer Request", icon: <Repeat size={20} />, href: "/dashboard/transfer/new" },
    { name: "Transfer History", icon: <Repeat size={20} />, href: "/dashboard/transfer/history" },
    { name: "All History", icon: <Archive size={20} />, href: "/dashboard/history" },
    { name: "Reports", icon: <BarChart size={20} />, href: "/dashboard/reports" },
    { name: "Mark Garbage", icon: <Trash2 size={20} />, href: "/dashboard/garbage" },
  ];

  const accountMenu = [
    { name: "Forgot Password", icon: <Lock size={20} />, href: "/forgot-password" },
    { name: "Logout", icon: <LogOut size={20} />, href: "/", isLogout: true },
  ];

  const handleNavigation = (href, isLogout) => {
    if (isLogout) {
      localStorage.removeItem("token");
      router.push("/");
    } else {
      router.push(href);
    }
  };

  return (
    <aside
      className={`h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      } surface border-r border-default backdrop-blur-xl flex flex-col overflow-hidden`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center p-6 border-b border-default ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl accent-bg border border-default">
              <Leaf size={24} className="accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-accent bg-clip-text text-transparent">
                Greenfuel
              </h2>
              <p className="text-xs text-secondary">Asset Management</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg surface-muted border border-default"
        >
          <Menu size={20} className="text-secondary" />
        </button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <nav className="flex flex-col gap-1">
          {menu.map((item, i) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);

            return (
              <button
                key={i}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "accent-bg accent border border-default font-medium"
                    : "surface-muted text-secondary"
                }`}
              >
                <div className={isActive ? "accent" : "text-secondary"}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="text-sm truncate">{item.name}</span>
                )}
                {!collapsed && !isActive && (
                  <ChevronRight
                    size={16}
                    className="ml-auto opacity-50"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Section */}
      <div className="p-4 border-t border-default">
        <nav className="flex flex-col gap-1">
          {accountMenu.map((item, i) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={i}
                onClick={() => handleNavigation(item.href, item.isLogout)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.isLogout
                    ? "text-danger surface-muted"
                    : isActive
                    ? "accent-bg accent border border-default"
                    : "surface-muted text-secondary"
                }`}
              >
                <div
                  className={
                    item.isLogout ? "text-danger" : "text-secondary"
                  }
                >
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="text-sm truncate">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Version */}
      {!collapsed && (
        <div className="p-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full accent-bg border border-default accent text-xs font-medium">
            v2.1.0
          </span>
        </div>
      )}
    </aside>
  );
}
