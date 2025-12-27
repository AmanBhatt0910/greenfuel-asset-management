// src/app/dashboard/history/page.jsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Package,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 10;

const EVENT_CONFIG = {
  ASSET_REGISTERED: {
    label: "Asset Registered",
    icon: Package,
    color: "text-green-400",
    border: "border-green-500/30",
  },
  ASSET_ISSUED: {
    label: "Asset Issued",
    icon: UserPlus,
    color: "text-blue-400",
    border: "border-blue-500/30",
  },
  ASSET_TRANSFERRED: {
    label: "Asset Transferred",
    icon: ArrowRightLeft,
    color: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  ASSET_GARBAGE: {
    label: "Marked as Garbage",
    icon: Trash2,
    color: "text-red-400",
    border: "border-red-500/30",
  },
};

export default function AssetHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalPages = Math.ceil(history.length / PAGE_SIZE);

  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return history.slice(start, start + PAGE_SIZE);
  }, [history, page]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <History className="text-green-400" size={26} />
          Asset Activity History
        </h2>
        <p className="text-sm text-gray-400">
          Complete audit trail of all asset-related actions
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-10 border-l border-gray-700">
        {loading ? (
          <div className="p-10 text-gray-400">Loading history…</div>
        ) : paginatedHistory.length === 0 ? (
          <div className="p-10 text-gray-400">No history records found</div>
        ) : (
          paginatedHistory.map((item) => {
            const config = EVENT_CONFIG[item.event_type] || {};
            const Icon = config.icon || Package;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="relative mb-10"
              >
                {/* Icon */}
                <div
                  className={`
                    absolute -left-[18px] top-4
                    w-9 h-9 rounded-full
                    flex items-center justify-center
                    bg-gray-900 border
                    ${config.border || "border-gray-600"}
                  `}
                >
                  <Icon
                    size={18}
                    className={config.color || "text-gray-400"}
                  />
                </div>

                {/* Card */}
                <div
                  className={`
                    bg-gray-900/80 backdrop-blur
                    border rounded-xl p-5
                    shadow-lg transition-all
                    hover:border-green-500/40
                    ${config.border || "border-gray-700"}
                  `}
                >
                  <div className="flex justify-between gap-6">
                    <div>
                      <h3
                        className={`font-semibold ${
                          config.color || "text-white"
                        }`}
                      >
                        {config.label || item.event_type}
                      </h3>

                      <p className="text-sm text-gray-300 mt-1">
                        {item.description}
                      </p>

                      {item.asset_code && (
                        <p className="text-xs text-gray-400 mt-1">
                          Asset Code: {item.asset_code}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Performed by:{" "}
                        <span className="text-gray-300">
                          {item.performed_by || "System"}
                        </span>
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                      <div>
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        {new Date(item.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700
                       text-sm flex items-center gap-1
                       disabled:opacity-40 hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <span className="text-sm text-gray-400">
            Page <span className="text-white">{page}</span> of{" "}
            <span className="text-white">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700
                       text-sm flex items-center gap-1
                       disabled:opacity-40 hover:bg-gray-700"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
