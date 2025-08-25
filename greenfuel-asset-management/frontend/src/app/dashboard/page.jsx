"use client";
import { Package, UserPlus, Archive, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const stats = [
    { title: "Total Assets", count: 120, icon: <Package size={24} className="text-green-400" /> },
    { title: "Issued Assets", count: 65, icon: <UserPlus size={24} className="text-blue-400" /> },
    { title: "In Stock", count: 45, icon: <Archive size={24} className="text-yellow-400" /> },
    { title: "Garbage Assets", count: 10, icon: <Trash2 size={24} className="text-red-400" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold mb-6 text-green-400">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4 p-6 bg-gray-900 rounded-xl border border-gray-700 shadow-lg transition-all"
          >
            <div className="p-3 bg-gray-800 rounded-full">{s.icon}</div>
            <div>
              <p className="text-gray-400 text-sm">{s.title}</p>
              <p className="text-2xl font-bold">{s.count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-green-400">Assets by Type</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-green-400">Assets Status</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
