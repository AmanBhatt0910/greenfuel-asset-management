"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Package, FileText, Repeat, BarChart, Trash2, Archive, User, Lock } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
    { name: "Asset Inventory", icon: <Package size={20} />, href: "/dashboard/assets" },
    { name: "New Asset Registration", icon: <Package size={20} />, href: "/dashboard/assets/new" },
    { name: "Existing Issues", icon: <FileText size={20} />, href: "/dashboard/issues" },
    { name: "New Asset Issue", icon: <FileText size={20} />, href: "/dashboard/issues/new" },
    { name: "Transfer Request", icon: <Repeat size={20} />, href: "/dashboard/transfers/new" },
    { name: "Transfer History", icon: <Repeat size={20} />, href: "/dashboard/transfers/history" },
    { name: "All History", icon: <Archive size={20} />, href: "/dashboard/history" },
    { name: "Reports", icon: <BarChart size={20} />, href: "/dashboard/reports" },
    { name: "Mark Garbage", icon: <Trash2 size={20} />, href: "/dashboard/garbage" },
  ];

  const accountMenu = [
    { name: "Account Settings", icon: <User size={20} />, href: "/dashboard/account" },
    { name: "Forgot Password", icon: <Lock size={20} />, href: "/forgot-password" },
  ];

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col border-r border-gray-700 sticky top-0">
      {/* Brand */}
      <div className="p-6 mb-4">
        <h2 className="text-3xl font-bold text-green-400 text-center">Greenfuel</h2>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="flex flex-col gap-2 mb-6">
          {menu.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive ? "bg-green-600 text-white shadow-lg" : "hover:bg-gray-800 hover:text-green-400"}`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
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
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive ? "bg-green-600 text-white shadow-lg" : "hover:bg-gray-800 hover:text-green-400"}`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
