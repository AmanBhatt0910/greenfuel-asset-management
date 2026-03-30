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
  Menu,
  LogOut,
  ChevronRight,
  Leaf,
  Layers,
  PlusSquare,
  History,
  LayoutDashboard,
  Laptop,
  Users,
  KeyRound,
} from "lucide-react";

export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Fetch current user role from the /api/auth/me endpoint
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.role) setUserRole(data.role); })
      .catch(() => {});
  }, []);

  if (!mounted) return null;

  const isAdmin = userRole === "admin";
  const isAdminOrManager = isAdmin || userRole === "manager";

  /* ---------------------------
     Navigation Groups
  ---------------------------- */

  const sections = [

    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard"
        }
      ]
    },

    {
      title: "Assets",
      items: [
        {
          name: "Asset Inventory",
          icon: Package,
          href: "/dashboard/assets"
        },
        ...(isAdminOrManager ? [
          {
            name: "Register Asset",
            icon: PlusSquare,
            href: "/dashboard/assets/new"
          },
        ] : []),
        {
          name: "Issues",
          icon: FileText,
          href: "/dashboard/issues"
        },
        ...(isAdminOrManager ? [
          {
            name: "Issue Asset",
            icon: FileText,
            href: "/dashboard/issues/new"
          },
          {
            name: "Transfer Request",
            icon: Repeat,
            href: "/dashboard/transfer/new"
          },
        ] : []),
        {
          name: "Transfer History",
          icon: History,
          href: "/dashboard/transfer/history"
        },
        ...(isAdminOrManager ? [
          {
            name: "Garbage",
            icon: Trash2,
            href: "/dashboard/garbage"
          }
        ] : [])
      ]
    },

    {
      title: "Software",
      items: [
        {
          name: "Software Inventory",
          icon: Laptop,
          href: "/dashboard/software"
        },
        ...(isAdminOrManager ? [
          {
            name: "Register Software",
            icon: PlusSquare,
            href: "/dashboard/software/new"
          }
        ] : [])
      ]
    },

    {
      title: "Analytics",
      items: [
        {
          name: "Reports",
          icon: BarChart,
          href: "/dashboard/reports"
        },
        {
          name: "Full History",
          icon: Archive,
          href: "/dashboard/history"
        }
      ]
    },

    ...(isAdmin ? [
      {
        title: "Administration",
        items: [
          {
            name: "User Management",
            icon: Users,
            href: "/dashboard/users"
          }
        ]
      }
    ] : [])

  ];

  const accountSection = [
    {
      name: "Change Password",
      icon: KeyRound,
      href: "/dashboard/change-password"
    },
    {
      name: "Logout",
      icon: LogOut,
      href: "/",
      logout: true
    }
  ];

  /* ---------------------------
     Navigation Handler
  ---------------------------- */

  const navigate = async (item) => {

    if (item.logout) {

      await fetch("/api/auth/logout", {
        method: "POST"
      });

      router.replace("/");

      return;
    }

    router.push(item.href);

  };

  /* ---------------------------
     UI
  ---------------------------- */

  return (

    <aside
      className={`
        h-screen sticky top-0 z-40
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-72"}
        surface border-r border-default
        flex flex-col
      `}
    >

      {/* Brand */}

      <div
        className={`
          flex items-center border-b border-default
          ${collapsed ? "justify-center p-4" : "justify-between p-5"}
        `}
      >

        {!collapsed && (

          <div className="flex items-center gap-3">

            <div className="
              p-2 rounded-xl
              accent-bg border border-default
              shadow-sm
            ">
              <Leaf size={22} className="accent"/>
            </div>

            <div>

              <div className="
                text-lg font-bold
                gradient-accent bg-clip-text text-transparent
              ">
                Greenfuel
              </div>

              <div className="text-xs text-secondary">
                Asset Management
              </div>

            </div>

          </div>

        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            p-2 rounded-lg
            surface-muted border border-default
            hover:surface transition
          "
        >
          <Menu size={18}/>
        </button>

      </div>

      {/* Navigation */}

      <div className="flex-1 overflow-y-auto py-4 px-2">

        {sections.map((section, index) => (

          <div key={index} className="mb-4">

            {!collapsed && (
              <div className="
                px-3 mb-2
                text-xs font-semibold
                text-secondary uppercase
                tracking-wider
              ">
                {section.title}
              </div>
            )}

            <div className="space-y-1">

              {section.items.map((item) => {

                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

                const Icon = item.icon;

                return (

                  <button
                    key={item.href}
                    onClick={() => navigate(item)}
                    className={`
                      w-full flex items-center gap-3
                      px-3 py-2.5 rounded-xl
                      transition-all duration-200

                      ${isActive
                        ? `
                          accent-bg accent
                          border border-default
                          shadow-sm
                        `
                        : `
                          text-secondary
                          hover:surface-muted
                        `
                      }
                    `}
                  >

                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "accent"
                          : "text-secondary"
                      }
                    />

                    {!collapsed && (

                      <>
                        <span className="text-sm flex-1 text-left">
                          {item.name}
                        </span>

                        {!isActive && (
                          <ChevronRight
                            size={14}
                            className="opacity-40"
                          />
                        )}
                      </>

                    )}

                  </button>

                );

              })}

            </div>

          </div>

        ))}

      </div>

      {/* Account */}

      <div className="
        border-t border-default
        p-3
      ">

        {accountSection.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.name}
              onClick={() => navigate(item)}
              className={`
                w-full flex items-center gap-3
                px-3 py-2.5 rounded-xl
                transition
                ${item.logout
                  ? "text-danger hover:bg-red-500/10"
                  : "text-secondary hover:surface-muted"
                }
              `}
            >

              <Icon size={18}/>

              {!collapsed && (
                <span className="text-sm">
                  {item.name}
                </span>
              )}

            </button>

          );

        })}

      </div>

      {/* Role badge */}

      {!collapsed && userRole && (

        <div className="px-3 pb-2">
          <div className="
            text-center text-xs
            px-3 py-1.5 rounded-lg
            surface-muted border border-default
            text-secondary capitalize
          ">
            Logged in as <span className="accent font-semibold">{userRole}</span>
          </div>
        </div>

      )}

      {/* Version */}

      {!collapsed && (

        <div className="p-3 border-t border-default">

          <div className="
            text-center text-xs text-secondary
          ">
            Version 2.2.0
          </div>

        </div>

      )}

    </aside>

  );

}
