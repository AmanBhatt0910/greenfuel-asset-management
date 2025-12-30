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
import { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ITEMS_PER_PAGE = 5;

/* ============================
   Reusable Components
============================ */

// Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[color:var(--accent)]/30 border-t-[color:var(--accent)] rounded-full animate-spin mx-auto mb-4" />
      <p className="text-secondary">{message}</p>
    </div>
  </div>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="text-center py-8">
    <p className="text-danger">Failed to load dashboard: {message}</p>
  </div>
);

// Dashboard Header Component
const DashboardHeader = ({ systemHealthy = true }) => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-4xl font-bold gradient-accent bg-clip-text text-transparent">
        Dashboard
      </h2>
      <p className="text-secondary mt-1">
        Overview of assets and system status
      </p>
    </div>

    {systemHealthy && (
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl accent-bg border-default accent text-sm">
        <TrendingUp size={16} />
        System Healthy
      </div>
    )}
  </div>
);

// Stat Card Component
const StatCard = ({ title, count, icon: Icon, gradient, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    whileHover={{ y: -6 }}
    className="relative overflow-hidden rounded-2xl surface border-default backdrop-blur-xl shadow-lg"
  >
    <div className="relative p-6 flex items-center gap-4">
      <div
        className={`p-4 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
      >
        <Icon size={24} />
      </div>

      <div>
        <p className="text-sm text-secondary">{title}</p>
        <p className="text-3xl font-bold text-primary">{count}</p>
      </div>
    </div>
  </motion.div>
);

// Chart Card Component
const ChartCard = ({ title, children }) => (
  <div className="surface-card p-6">
    <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
    {children}
  </div>
);

// Activity Item Component
const ActivityItem = ({ description, createdAt }) => (
  <div className="p-3 rounded-xl surface-muted border-default">
    <p className="text-sm text-primary">{description}</p>
    <p className="text-xs text-secondary mt-1">
      {new Date(createdAt).toLocaleString()}
    </p>
  </div>
);

// Pagination Controls Component
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
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
        onClick={() => onPageChange(currentPage + 1)}
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
  );
};

// Pie Chart Component
const AssetDistributionChart = ({ data }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={4}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

/* ============================
   Main Dashboard
============================ */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch("/api/dashboard/stats", { credentials: "include" }),
          fetch("/api/history?limit=50", { credentials: "include" }),
        ]);

        if (!statsRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch data");
        }

        setStats(await statsRes.json());
        setHistory(await historyRes.json());
      } catch (err) {
        console.error("Dashboard load failed", err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // Stats card configuration
  const statCards = useMemo(() => [
    {
      title: "Total Assets",
      key: "totalAssets",
      icon: Package,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Issued Assets",
      key: "issuedAssets",
      icon: UserPlus,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "In Stock",
      key: "inStockAssets",
      icon: Archive,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Garbage Assets",
      key: "garbageAssets",
      icon: Trash2,
      gradient: "from-red-500 to-pink-500",
    },
  ], []);

  // Pie chart data
  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Issued", value: stats.issuedAssets, color: "var(--info)" },
      { name: "In Stock", value: stats.inStockAssets, color: "var(--warning)" },
      { name: "Garbage", value: stats.garbageAssets, color: "var(--danger)" },
    ];
  }, [stats]);

  // Pagination logic
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    return history.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [history, currentPage]);

  if (error) return <ErrorMessage message={error} />;
  if (!stats) return <LoadingSpinner message="Loading dashboard…" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      {/* Header */}
      <DashboardHeader systemHealthy />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={card.key}
            title={card.title}
            count={stats[card.key]}
            icon={card.icon}
            gradient={card.gradient}
            index={index}
          />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <ChartCard title="Asset Status Distribution">
          <AssetDistributionChart data={pieData} />
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard
          title={
            <div className="flex items-center gap-2">
              <History size={18} />
              Recent Activity
            </div>
          }
        >
          <div className="space-y-4">
            {paginatedHistory.length === 0 ? (
              <p className="text-secondary text-sm">No recent activity</p>
            ) : (
              paginatedHistory.map((h) => (
                <ActivityItem
                  key={h.id}
                  description={h.description}
                  createdAt={h.created_at}
                />
              ))
            )}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </ChartCard>
      </div>
    </motion.div>
  );
}