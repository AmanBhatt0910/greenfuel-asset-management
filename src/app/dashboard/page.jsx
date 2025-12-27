"use client";
import {
  Package,
  UserPlus,
  Archive,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  const stats = [
    {
      title: "Total Assets",
      count: 120,
      icon: Package,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Issued Assets",
      count: 65,
      icon: UserPlus,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "In Stock",
      count: 45,
      icon: Archive,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Garbage Assets",
      count: 10,
      icon: Trash2,
      gradient: "from-red-500 to-pink-500",
    },
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
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gray-900/70 backdrop-blur-xl shadow-lg group"
            >
              {/* Glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${s.gradient} blur-2xl`}
              />

              <div className="relative p-6 flex items-center gap-4">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}
                >
                  <Icon size={24} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">{s.title}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {s.count}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights / Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            title: "Assets by Type",
            desc: "Distribution of assets across categories",
          },
          {
            title: "Assets Status",
            desc: "Issued vs available vs discarded",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl border border-gray-700/60 bg-gray-900/70 backdrop-blur-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-1">
              {card.title}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{card.desc}</p>

            {/* Empty state instead of ugly placeholder */}
            <div className="h-56 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded-xl">
              <TrendingUp size={32} className="mb-2 opacity-60" />
              <p className="text-sm">Analytics coming soon</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
