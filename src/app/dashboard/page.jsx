// src/app/dashboard/page.jsx

"use client";

import {
  Package,
  UserPlus,
  Archive,
  Trash2,
  TrendingUp,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ITEMS_PER_PAGE = 5;

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/history?limit=50", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(await statsRes.json());
        setHistory(await historyRes.json());
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    fetchData();
  }, [router]);

  if (!stats) {
    return <p className="text-secondary">Loading dashboard…</p>;
  }

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const cards = [
    {
      title: "Total Assets",
      count: stats.totalAssets,
      icon: Package,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Issued Assets",
      count: stats.issuedAssets,
      icon: UserPlus,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "In Stock",
      count: stats.inStockAssets,
      icon: Archive,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Garbage Assets",
      count: stats.garbageAssets,
      icon: Trash2,
      gradient: "from-red-500 to-pink-500",
    },
  ];

  const pieData = [
    { name: "Issued", value: stats.issuedAssets, color: "var(--info)" },
    { name: "In Stock", value: stats.inStockAssets, color: "var(--warning)" },
    { name: "Garbage", value: stats.garbageAssets, color: "var(--danger)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold gradient-accent bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-secondary mt-1">
            Overview of assets and system status
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl accent-bg border-default accent text-sm">
          <TrendingUp size={16} />
          System Healthy
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-2xl surface border-default backdrop-blur-xl shadow-lg"
            >
              <div className="relative p-6 flex items-center gap-4">
                {/* ICON COLORS KEPT STATIC AS PER DESIGN RULES */}
                <div
                  className={`p-4 rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}
                >
                  <Icon size={24} />
                </div>

                <div>
                  <p className="text-sm text-secondary">{s.title}</p>
                  <p className="text-3xl font-bold text-primary">
                    {s.count}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="surface-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Asset Status Distribution
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="surface-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <History size={18} />
            Recent Activity
          </h3>

          <div className="space-y-4">
            {paginatedHistory.length === 0 ? (
              <p className="text-secondary text-sm">
                No recent activity
              </p>
            ) : (
              paginatedHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl surface-muted border-default"
                >
                  <p className="text-sm text-primary">
                    {h.description}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`
                  px-3 py-1 rounded-lg text-sm
                  surface-muted border-default
                  hover:surface transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
              >
                Previous
              </button>

              <span className="text-xs text-secondary">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`
                  px-3 py-1 rounded-lg text-sm
                  surface-muted border-default
                  hover:surface transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}