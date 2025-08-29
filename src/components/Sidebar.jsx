"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, Package, FileText, Repeat, BarChart, Trash2, Archive, User, Lock, Menu
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
    { name: "Account Settings", icon: <User size={20} />, href: "/dashboard/account" },
    { name: "Forgot Password", icon: <Lock size={20} />, href: "/forgot-password" },
  ];

  return (
    <aside
      className={`h-screen transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col border-r border-gray-700 sticky top-0 backdrop-blur-lg`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <h2 className="text-2xl font-bold text-green-400">Greenfuel</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="flex flex-col gap-2 mb-6">
          {menu.map((item, i) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative z-10
                    ${
                      isActive
                        ? "bg-green-600/20 text-green-400 font-semibold"
                        : "hover:bg-gray-800 hover:text-green-400"
                    }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Account Section */}
      <div className="p-4 border-t border-gray-700">
        <nav className="flex flex-col gap-2">
          {accountMenu.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-lg"
                  />
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative z-10
                    ${
                      isActive
                        ? "bg-green-600/20 text-green-400 font-semibold"
                        : "hover:bg-gray-800 hover:text-green-400"
                    }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
