// src/app/dashboard/assets/page.jsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Edit,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

const StatusBadge = ({ status }) => {
  const styles = {
    IN_STOCK: "bg-green-500/10 text-green-400 border-green-500/30",
    ISSUED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    GARBAGE: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs border ${
        styles[status] || ""
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

/* ============================
   Main Page
============================ */
export default function AssetsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* Fetch assets */
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/assets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
        setState({ loading: false, error: "" });
      } catch {
        setState({ loading: false, error: "Failed to load assets" });
      }
    };
    run();
  }, []);

  /* Counts per status */
  const counts = useMemo(() => {
    return {
      ALL: rows.length,
      IN_STOCK: rows.filter((r) => r.status === "IN_STOCK").length,
      ISSUED: rows.filter((r) => r.status === "ISSUED").length,
      GARBAGE: rows.filter((r) => r.status === "GARBAGE").length,
    };
  }, [rows]);

  /* Filtered rows */
  const filteredRows = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  if (state.loading) return <p className="text-gray-400">Loading assets…</p>;
  if (state.error) return <p className="text-red-400">{state.error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Asset Inventory</h2>
        <p className="text-gray-400 text-sm">
          View and manage all registered assets
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "ALL", label: "All" },
          { key: "IN_STOCK", label: "In Stock" },
          { key: "ISSUED", label: "Issued" },
          { key: "GARBAGE", label: "Garbage" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all
              ${
                statusFilter === f.key
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              }`}
          >
            {f.label}
            <span className="ml-2 text-xs opacity-80">
              ({counts[f.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 text-xs uppercase">
            <tr>
              {[
                "Asset Code",
                "Make / Model",
                "Serial No",
                "Vendor",
                "Warranty",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-6 py-4 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  No assets found for selected filter
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <motion.tr
                  key={r.id}
                  whileHover={{
                    backgroundColor: "rgba(16,185,129,0.06)",
                  }}
                  className="border-t border-gray-800"
                >
                  <td className="px-6 py-4 font-medium">
                    {r.asset_code}
                  </td>
                  <td className="px-6 py-4">
                    {r.make} {r.model}
                  </td>
                  <td className="px-6 py-4">{r.serial_no}</td>
                  <td className="px-6 py-4">{r.vendor || "-"}</td>
                  <td className="px-6 py-4">
                    {r.warranty_years
                      ? `${r.warranty_years} yrs`
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/assets/${r.id}?mode=view`
                        )
                      }
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>

                    {r.status !== "GARBAGE" && (
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/assets/${r.id}?mode=edit`
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    )}

                    {r.status === "IN_STOCK" && (
                      <>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/issues/new?asset=${r.asset_code}`
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                        >
                          <UserPlus size={14} /> Issue
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/garbage?asset=${r.asset_code}`
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Garbage
                        </button>
                      </>
                    )}

                    {r.status === "ISSUED" && (
                      <>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/transfer/new?asset=${r.asset_code}`
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-1"
                        >
                          <ArrowRightLeft size={14} /> Transfer
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/assets/return?issue=${r.issue_id}`
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-1"
                        >
                          <RotateCcw size={14} /> Return
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
