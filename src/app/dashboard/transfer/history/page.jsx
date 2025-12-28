// src/app/dashboard/transfer/history/page.jsx

"use client";
import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, Search, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AssetTransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/transfers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch transfers");

        const data = await res.json();
        setTransfers(data);
      } catch (err) {
        console.error("Failed to load transfers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, []);

  const statusConfig = {
    Approved: {
      color: "accent",
      icon: CheckCircle,
    },
    Pending: {
      color: "text-warning",
      icon: Clock,
    },
    Rejected: {
      color: "text-danger",
      icon: XCircle,
    },
  };

  const filtered = transfers.filter(
    (t) =>
      t.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.make?.toLowerCase().includes(search.toLowerCase()) ||
      t.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <ArrowRightLeft className="accent" size={28} />
            Asset Transfer History
          </h2>
          <p className="text-sm text-secondary mt-1">
            Complete record of all asset transfers between employees
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <input
            type="text"
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`
              w-full pl-9 pr-4 py-2.5 rounded-xl
              surface border-default
              text-sm text-primary placeholder:text-secondary
              focus:outline-none focus:ring-2 focus:ring-accent-soft
              transition-shadow
            `}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto surface-card">
        {loading ? (
          <div className="p-10 text-center text-secondary">
            Loading transfers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-secondary">
            No transfers found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="surface-muted text-secondary text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Asset Code</th>
                <th className="px-6 py-4 text-left">Make/Model</th>
                <th className="px-6 py-4 text-left">Serial No</th>
                <th className="px-6 py-4 text-left">From</th>
                <th className="px-6 py-4 text-left">To</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const config = statusConfig[t.status] || statusConfig.Pending;
                const StatusIcon = config.icon;
                
                return (
                  <tr
                    key={i}
                    className="border-t border-default hover:accent-bg transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-primary">
                      {t.asset_code}
                    </td>
                    <td className="px-6 py-4 text-primary">
                      {t.make} {t.model}
                    </td>
                    <td className="px-6 py-4 text-primary">{t.serial_no}</td>
                    <td className="px-6 py-4 text-primary">{t.from_emp_code}</td>
                    <td className="px-6 py-4 text-primary">{t.to_emp_code}</td>
                    <td className="px-6 py-4 text-primary">
                      {new Date(t.transfer_date).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${config.color}`}>
                      <span className="flex items-center gap-1.5">
                        <StatusIcon size={16} />
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && filtered.length > 0 && (
        <div className="surface-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold accent">
                {filtered.filter((t) => t.status === "Approved").length}
              </p>
              <p className="text-xs text-secondary uppercase">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {filtered.filter((t) => t.status === "Pending").length}
              </p>
              <p className="text-xs text-secondary uppercase">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-danger">
                {filtered.filter((t) => t.status === "Rejected").length}
              </p>
              <p className="text-xs text-secondary uppercase">Rejected</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}