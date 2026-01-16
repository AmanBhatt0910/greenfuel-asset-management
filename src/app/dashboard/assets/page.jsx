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
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ============================
   Reusable Components
============================ */

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    IN_STOCK: "accent-bg accent border-default",
    ISSUED: "text-info border-default surface-muted",
    GARBAGE: "text-danger border-default surface-muted",
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs ${styles[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
};

// Filter Button Component
const FilterButton = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-full text-sm border transition-all
      ${
        active
          ? "accent-bg accent border-default"
          : "surface-muted text-secondary border-default hover:surface"
      }
    `}
  >
    {label}
    <span className="ml-2 text-xs opacity-70">({count})</span>
  </button>
);

// Action Button Component
const ActionButton = ({ 
  onClick, 
  icon: Icon, 
  label, 
  variant = "default",
  className = "" 
}) => {
  const variants = {
    default: "surface border-default text-primary hover:surface-muted shadow-sm",
    primary: "gradient-accent text-white hover:opacity-90 shadow-md",
    info: "surface border-default text-info hover:surface-muted shadow-sm",
    danger: "surface border-default text-danger hover:surface-muted shadow-sm",
    warning: "surface border-default hover:surface-muted shadow-sm",
    secondary: "surface border-default text-secondary hover:surface-muted shadow-sm",
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium
        flex items-center gap-1 transition-all
        ${variants[variant]}
        ${className}
      `}
      style={variant === "warning" ? { color: "var(--warning)" } : {}}
    >
      <Icon size={14} /> {label}
    </button>
  );
};

// Search Input Component
const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative w-full lg:w-80">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
    />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full pl-9 pr-3 py-2 rounded-xl
        surface border-default
        text-sm text-primary placeholder:text-secondary
        focus:outline-none focus:ring-2 focus:ring-accent-soft
        transition-shadow
      `}
    />
  </div>
);

// Pagination Select Component
const ItemsPerPageSelect = ({ value, onChange, totalItems, startIndex, endIndex }) => (
  <div className="flex items-center gap-2 text-sm text-secondary">
    <span>Show</span>
    <select
      value={value}
      onChange={onChange}
      className="px-3 py-1.5 rounded-lg surface border-default text-primary focus:outline-none focus:ring-2 focus:ring-accent-soft"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
    <span>
      per page • Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
    </span>
  </div>
);

// Pagination Button Component
const PaginationButton = ({ onClick, disabled, children, active = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      ${active ? 'px-3 py-1.5' : 'p-2'} rounded-lg border-default transition-colors
      ${
        disabled
          ? "surface-muted text-secondary cursor-not-allowed opacity-50"
          : active
          ? "accent-bg accent"
          : "surface text-primary hover:surface-muted"
      }
      ${active ? 'text-sm font-medium' : ''}
    `}
  >
    {children}
  </button>
);

// Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[color:var(--accent)]/30 border-t-[color:var(--accent)] rounded-full animate-spin mx-auto mb-4" />
      <p className="text-secondary">{message}</p>
    </div>
  </div>
);

// Table Header Component
const TableHeader = ({ columns }) => (
  <thead className="surface-muted text-secondary text-xs uppercase">
    <tr>
      {columns.map((col) => (
        <th key={col} className="px-6 py-4 text-left">
          {col}
        </th>
      ))}
    </tr>
  </thead>
);

// Table Row Component with isolated hover effect
const TableRow = ({ row, getActions }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        border-t border-default text-primary
        transition-colors duration-150
        ${isHovered ? 'bg-[var(--surface-muted)]' : ''}
      `}
    >
      <td className="px-6 py-4 font-medium">{row.asset_code}</td>
      <td className="px-6 py-4">{row.make} {row.model}</td>
      <td className="px-6 py-4">{row.serial_no}</td>
      <td className="px-6 py-4">{row.vendor || "-"}</td>
      <td className="px-6 py-4">
        {row.warranty_years ? `${row.warranty_years} yrs` : "-"}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {getActions(row).map((action, idx) => {
            const ActionComp = action.component;
            return <ActionComp key={idx} {...action.props} />;
          })}
        </div>
      </td>
    </tr>
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
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/assets", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
        setState({ loading: false, error: "" });
      } catch {
        setState({ loading: false, error: "Failed to load assets" });
      }
    };
    run();
  }, []);

  const counts = useMemo(() => ({
    ALL: rows.length,
    IN_STOCK: rows.filter((r) => r.status === "IN_STOCK").length,
    ISSUED: rows.filter((r) => r.status === "ISSUED").length,
    GARBAGE: rows.filter((r) => r.status === "GARBAGE").length,
  }), [rows]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Download report function
  const downloadReport = async () => {
    setDownloadLoading(true);

    try {
      const res = await fetch("/api/reports?type=assets", {
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        alert("Failed to generate report");
        setDownloadLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "assets-report.csv";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download report:", err);
      alert("Failed to generate report");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Action configurations based on status
  const getActions = (row) => {
    const actions = [
      {
        component: ActionButton,
        props: {
          onClick: () => router.push(`/dashboard/assets/${row.id}?mode=view`),
          icon: Eye,
          label: "View",
          variant: "default",
        },
      },
    ];

    if (row.status !== "GARBAGE") {
      actions.push({
        component: ActionButton,
        props: {
          onClick: () => router.push(`/dashboard/assets/${row.id}?mode=edit`),
          icon: Edit,
          label: "Edit",
          variant: "primary",
        },
      });
    }

    if (row.status === "IN_STOCK") {
      actions.push(
        {
          component: ActionButton,
          props: {
            onClick: () => router.push(`/dashboard/issues/new?asset=${row.asset_code}`),
            icon: UserPlus,
            label: "Issue",
            variant: "info",
          },
        },
        {
          component: ActionButton,
          props: {
            onClick: () => router.push(`/dashboard/garbage?asset=${row.asset_code}`),
            icon: Trash2,
            label: "Garbage",
            variant: "danger",
          },
        }
      );
    }

    if (row.status === "ISSUED") {
      actions.push(
        {
          component: ActionButton,
          props: {
            onClick: () => router.push(`/dashboard/transfer/new?asset=${row.asset_code}`),
            icon: ArrowRightLeft,
            label: "Transfer",
            variant: "warning",
          },
        },
        {
          component: ActionButton,
          props: {
            onClick: () => router.push(`/dashboard/assets/return?issue=${row.issue_id}`),
            icon: RotateCcw,
            label: "Return",
            variant: "secondary",
          },
        }
      );
    }

    return actions;
  };

  // Filter configuration
  const filters = [
    { key: "ALL", label: "All" },
    { key: "IN_STOCK", label: "In Stock" },
    { key: "ISSUED", label: "Issued" },
    { key: "GARBAGE", label: "Garbage" },
  ];

  const tableColumns = [
    "Asset Code",
    "Make / Model",
    "Serial No",
    "Vendor",
    "Warranty",
    "Status",
    "Actions",
  ];

  if (state.loading) return <LoadingSpinner message="Loading assets…" />;
  if (state.error) return <p className="text-danger">{state.error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Download Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary">Asset Inventory</h2>
          <p className="text-secondary text-sm">
            View and manage all registered assets
          </p>
        </div>
        
        <button
          onClick={downloadReport}
          disabled={downloadLoading}
          className={`
            px-5 py-2.5 rounded-lg font-semibold
            gradient-accent text-white
            hover:opacity-90 transition-opacity
            flex items-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-md
          `}
        >
          <Download size={16} />
          {downloadLoading ? "Generating..." : "Download Report"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <FilterButton
              key={f.key}
              active={statusFilter === f.key}
              label={f.label}
              count={counts[f.key]}
              onClick={() => setStatusFilter(f.key)}
            />
          ))}
        </div>

        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Asset Code or Serial No"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto surface border-default rounded-2xl shadow-xl">
        <table className="min-w-full text-sm">
          <TableHeader columns={tableColumns} />

          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-6 py-8 text-center text-secondary"
                >
                  No assets found
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => (
                <TableRow key={r.id} row={r} getActions={getActions} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredRows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <ItemsPerPageSelect
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            totalItems={filteredRows.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <PaginationButton
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </PaginationButton>

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
                  <PaginationButton
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    active={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}
            </div>

            <PaginationButton
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </PaginationButton>
          </div>
        </div>
      )}
    </motion.div>
  );
}