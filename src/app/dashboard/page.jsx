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

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

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
          fetch("/api/history?limit=5", {
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
    return <p className="text-gray-400">Loading dashboard…</p>;
  }

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
    { name: "Issued", value: stats.issuedAssets, color: "#38bdf8" },
    { name: "In Stock", value: stats.inStockAssets, color: "#facc15" },
    { name: "Garbage", value: stats.garbageAssets, color: "#f43f5e" },
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
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            Overview of assets and system status
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
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
              className="relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gray-900/70 backdrop-blur-xl shadow-lg"
            >
              <div className="relative p-6 flex items-center gap-4">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}
                >
                  <Icon size={24} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">{s.title}</p>
                  <p className="text-3xl font-bold text-white">
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
        <div className="rounded-2xl border border-gray-700 bg-gray-900/70 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
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
        <div className="rounded-2xl border border-gray-700 bg-gray-900/70 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History size={18} />
            Recent Activity
          </h3>

          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No recent activity
              </p>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl border border-gray-700 bg-gray-800/60"
                >
                  <p className="text-sm text-gray-200">
                    {h.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
