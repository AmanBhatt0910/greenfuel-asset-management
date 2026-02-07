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

// Page Header Component
const PageHeader = ({ icon: Icon, title, subtitle }) => (
  <div>
    <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
      <Icon className="accent" size={26} />
      {title}
    </h2>
    <p className="text-sm text-secondary">{subtitle}</p>
  </div>
);

// Timeline Item Component
const TimelineItem = ({ item, config }) => {
  const Icon = config.icon || Package;

  return (
    <motion.div
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
          surface border-default
        `}
      >
        <Icon size={18} className={config.color || "text-secondary"} />
      </div>

      {/* Card */}
      <div
        className={`
          surface backdrop-blur
          border-default rounded-xl p-5
          shadow-lg transition-all
          hover:border-default hover:shadow-xl
        `}
      >
        <div className="flex justify-between gap-6">
          <div className="flex-1">
            <h3 className={`font-semibold ${config.color || "text-primary"}`}>
              {config.label || item.event_type}
            </h3>
            <p className="text-sm text-primary mt-1">{item.description}</p>
            {item.asset_code && (
              <p className="text-xs text-secondary mt-1">
                Asset Code: {item.asset_code}
              </p>
            )}
            <p className="text-xs text-secondary mt-2">
              Performed by:{" "}
              <span className="text-primary">
                {item.performed_by || "System"}
              </span>
            </p>
          </div>
          <div className="text-right text-xs text-secondary whitespace-nowrap">
            <div>{new Date(item.created_at).toLocaleDateString()}</div>
            <div>{new Date(item.created_at).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ message }) => (
  <div className="p-10 text-secondary text-center">{message}</div>
);

// Pagination Button Component
const PaginationButton = ({ onClick, disabled, children, direction }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-3 py-1.5 rounded-lg surface border-default
      text-sm flex items-center gap-1
      disabled:opacity-40 hover:surface-muted
      transition-colors
    `}
  >
    {direction === "prev" && <ChevronLeft size={16} />}
    {children}
    {direction === "next" && <ChevronRight size={16} />}
  </button>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 pt-4">
      <PaginationButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        direction="prev"
      >
        Prev
      </PaginationButton>

      <span className="text-sm text-secondary">
        Page <span className="text-primary">{currentPage}</span> of{" "}
        <span className="text-primary">{totalPages}</span>
      </span>

      <PaginationButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        direction="next"
      >
        Next
      </PaginationButton>
    </div>
  );
};

// Timeline Container Component
const Timeline = ({ children, isEmpty }) => (
  <div className="relative pl-10 border-l border-default">
    {isEmpty ? <EmptyState message="No history records found" /> : children}
  </div>
);

/* ============================
   Main Component
============================ */
export default function AssetHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

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

  // Event configuration
  const eventConfig = useMemo(
    () => ({
      ASSET_REGISTERED: {
        label: "Asset Registered",
        icon: Package,
        color: "accent",
      },

      ASSET_ISSUED: {
        label: "Asset Issued",
        icon: UserPlus,
        color: "text-info",
      },

      ASSET_TRANSFERRED: {
        label: "Asset Transferred",
        icon: ArrowRightLeft,
        color: "text-warning",
      },

      ASSET_GARBAGE: {
        label: "Marked as Garbage",
        icon: Trash2,
        color: "text-danger",
      },

      /* SOFTWARE EVENTS */

      SOFTWARE_REGISTERED: {
        label: "Software Registered",
        icon: Package,
        color: "accent",
      },

      SOFTWARE_ASSIGNED: {
        label: "Software Assigned",
        icon: UserPlus,
        color: "text-info",
      },

      SOFTWARE_REMOVED: {
        label: "Software Removed",
        icon: Trash2,
        color: "text-danger",
      },

      SOFTWARE_UPDATED: {
        label: "Software Updated",
        icon: Package,
        color: "text-warning",
      },

    }),
    []
  );

  // Pagination calculations
  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return history.slice(start, start + PAGE_SIZE);
  }, [history, page]);

  if (loading) return <LoadingSpinner message="Loading history…" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        icon={History}
        title="Asset Activity History"
        subtitle="Complete audit trail of all asset-related actions"
      />

      {/* Timeline */}
      <Timeline isEmpty={paginatedHistory.length === 0}>
        {paginatedHistory.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            config={eventConfig[item.event_type] || {}}
          />
        ))}
      </Timeline>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </motion.div>
  );
}