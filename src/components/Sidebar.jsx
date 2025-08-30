"use client";
import { useState, useEffect } from "react";
import {
  Home, Package, FileText, Repeat, BarChart, Trash2, Archive, Lock, Menu, LogOut, ChevronRight, Leaf
} from "lucide-react";

export default function Sidebar() {
  // Simulated pathname for demo
  const pathname = "/dashboard";
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    { name: "Logout", icon: <LogOut size={20} />, href: "/logout", isLogout: true },
  ];

  const handleNavigation = (href, isLogout) => {
    if (isLogout) {
      // Handle logout logic
      console.log("Logging out...");
      // localStorage.removeItem("token");
      // router.push("/login");
    } else {
      console.log(`Navigating to: ${href}`);
    }
  };

  if (!mounted) return null;

  return (
    <aside
      className={`h-screen transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-72"
      } bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col border-r border-gray-800/50 sticky top-0 backdrop-blur-xl relative overflow-hidden`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl"></div>

      {/* Enhanced Brand Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-400/30">
              <Leaf size={24} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Greenfuel
              </h2>
              <p className="text-xs text-gray-400 font-medium">Asset Management</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-400/30 mx-auto">
            <Leaf size={24} className="text-green-400" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
        >
          <Menu size={20} className="text-gray-400 group-hover:text-green-400 transition-colors" />
        </button>
      </div>

      {/* Scrollable Menu with Enhanced Styling */}
      <div className="flex-1 overflow-y-auto px-3 py-6 relative z-10">
        <nav className="flex flex-col gap-1 mb-8">
          {menu.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
              <div key={i} className="relative group">
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"></div>
                )}
                
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-green-600/20 to-emerald-600/10 text-green-400 font-medium border border-green-500/20"
                        : "hover:bg-gray-800/40 hover:text-green-400 text-gray-300"
                    }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${isActive ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400'} transition-colors`}>
                    {item.icon}
                  </div>
                  
                  {/* Text */}
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                  
                  {/* Hover arrow */}
                  {!collapsed && !isActive && (
                    <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-green-400" />
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45 border-l border-b border-gray-700"></div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Account Section */}
      <div className="relative z-10 p-4 border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <nav className="flex flex-col gap-1">
          {accountMenu.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <div key={i} className="relative group">
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"></div>
                )}
                
                <button
                  onClick={() => handleNavigation(item.href, item.isLogout)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-green-600/20 to-emerald-600/10 text-green-400 font-medium border border-green-500/20"
                        : item.isLogout
                        ? "hover:bg-red-600/10 hover:text-red-400 text-gray-300 hover:border hover:border-red-500/20"
                        : "hover:bg-gray-800/40 hover:text-green-400 text-gray-300"
                    }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 transition-colors ${
                    isActive 
                      ? 'text-green-400' 
                      : item.isLogout 
                      ? 'text-gray-400 group-hover:text-red-400'
                      : 'text-gray-400 group-hover:text-green-400'
                  }`}>
                    {item.icon}
                  </div>
                  
                  {/* Text */}
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                  
                  {/* Hover arrow */}
                  {!collapsed && !isActive && (
                    <ChevronRight size={16} className={`ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200 ${
                      item.isLogout ? 'text-red-400' : 'text-green-400'
                    }`} />
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className={`absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border ${
                      item.isLogout 
                        ? 'bg-red-800/90 border-red-700' 
                        : 'bg-gray-800 border-gray-700'
                    }`}>
                      {item.name}
                      <div className={`absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 border-l border-b ${
                        item.isLogout 
                          ? 'bg-red-800/90 border-red-700' 
                          : 'bg-gray-800 border-gray-700'
                      }`}></div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Version Badge */}
      {!collapsed && (
        <div className="relative z-10 p-4">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-600/10 border border-green-500/20 text-green-400 text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              v2.1.0
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}