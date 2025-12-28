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
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ============================
   Status Badge (token-based)
============================ */
const StatusBadge = ({ status }) => {
  const styles = {
    IN_STOCK: "accent-bg accent border-default",
    ISSUED: "text-info border-default surface-muted",
    GARBAGE: "text-danger border-default surface-muted",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs ${styles[status] || ""}`}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const counts = useMemo(() => {
    return {
      ALL: rows.length,
      IN_STOCK: rows.filter((r) => r.status === "IN_STOCK").length,
      ISSUED: rows.filter((r) => r.status === "ISSUED").length,
      GARBAGE: rows.filter((r) => r.status === "GARBAGE").length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;

    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.asset_code?.toLowerCase().includes(q) ||
          r.serial_no?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rows, statusFilter, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (state.loading) return <p className="text-secondary">Loading assets…</p>;
  if (state.error) return <p className="text-danger">{state.error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-primary">Asset Inventory</h2>
        <p className="text-secondary text-sm">
          View and manage all registered assets
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
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
              className={`
                px-4 py-1.5 rounded-full text-sm border transition-all
                ${
                  statusFilter === f.key
                    ? "accent-bg accent border-default"
                    : "surface-muted text-secondary border-default hover:surface"
                }
              `}
            >
              {f.label}
              <span className="ml-2 text-xs opacity-70">
                ({counts[f.key]})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <input
            type="text"
            placeholder="Search by Asset Code or Serial No"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full pl-9 pr-3 py-2 rounded-xl
              surface border-default
              text-sm text-primary placeholder:text-secondary
              focus:outline-none focus:ring-2 focus:ring-accent-soft
              transition-shadow
            `}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto surface border-default rounded-2xl shadow-xl">
        <table className="min-w-full text-sm">
          <thead className="surface-muted text-secondary text-xs uppercase">
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
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-secondary"
                >
                  No assets found
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => (
                <motion.tr
                  key={r.id}
                  whileHover={{ backgroundColor: "var(--surface-muted)" }}
                  className="border-t border-default text-primary"
                >
                  <td className="px-6 py-4 font-medium">
                    {r.asset_code}
                  </td>
                  <td className="px-6 py-4">{r.make} {r.model}</td>
                  <td className="px-6 py-4">{r.serial_no}</td>
                  <td className="px-6 py-4">{r.vendor || "-"}</td>
                  <td className="px-6 py-4">
                    {r.warranty_years ? `${r.warranty_years} yrs` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/assets/${r.id}?mode=view`)
                        }
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium
                          surface border-default text-primary
                          hover:surface-muted transition-colors
                          flex items-center gap-1 shadow-sm
                        `}
                      >
                        <Eye size={14} /> View
                      </button>

                      {r.status !== "GARBAGE" && (
                        <button
                          onClick={() =>
                            router.push(`/dashboard/assets/${r.id}?mode=edit`)
                          }
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-semibold
                            gradient-accent text-white
                            hover:opacity-90 transition-opacity
                            flex items-center gap-1 shadow-md
                          `}
                        >
                          <Edit size={14} /> Edit
                        </button>
                      )}

                      {r.status === "IN_STOCK" && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/issues/new?asset=${r.asset_code}`)
                            }
                            className={`
                              px-3 py-1.5 rounded-lg text-xs font-medium
                              surface border-default text-info
                              hover:surface-muted transition-colors
                              flex items-center gap-1 shadow-sm
                            `}
                          >
                            <UserPlus size={14} /> Issue
                          </button>

                          <button
                            onClick={() =>
                              router.push(`/dashboard/garbage?asset=${r.asset_code}`)
                            }
                            className={`
                              px-3 py-1.5 rounded-lg text-xs font-medium
                              surface border-default text-danger
                              hover:surface-muted transition-colors
                              flex items-center gap-1 shadow-sm
                            `}
                          >
                            <Trash2 size={14} /> Garbage
                          </button>
                        </>
                      )}

                      {r.status === "ISSUED" && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/transfer/new?asset=${r.asset_code}`)
                            }
                            className={`
                              px-3 py-1.5 rounded-lg text-xs font-medium
                              surface border-default
                              hover:surface-muted transition-colors
                              flex items-center gap-1 shadow-sm
                            `}
                            style={{ color: 'var(--warning)' }}
                          >
                            <ArrowRightLeft size={14} /> Transfer
                          </button>

                          <button
                            onClick={() =>
                              router.push(`/dashboard/assets/return?issue=${r.issue_id}`)
                            }
                            className={`
                              px-3 py-1.5 rounded-lg text-xs font-medium
                              surface border-default text-secondary
                              hover:surface-muted transition-colors
                              flex items-center gap-1 shadow-sm
                            `}
                          >
                            <RotateCcw size={14} /> Return
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredRows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Items per page */}
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg surface border-default text-primary focus:outline-none focus:ring-2 focus:ring-accent-soft"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              per page • Showing {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} of {filteredRows.length}
            </span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                p-2 rounded-lg border-default transition-colors
                ${
                  currentPage === 1
                    ? "surface-muted text-secondary cursor-not-allowed opacity-50"
                    : "surface text-primary hover:surface-muted"
                }
              `}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        currentPage === pageNum
                          ? "accent-bg accent border-default"
                          : "surface text-primary hover:surface-muted border-default"
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                p-2 rounded-lg border-default transition-colors
                ${
                  currentPage === totalPages
                    ? "surface-muted text-secondary cursor-not-allowed opacity-50"
                    : "surface text-primary hover:surface-muted"
                }
              `}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}