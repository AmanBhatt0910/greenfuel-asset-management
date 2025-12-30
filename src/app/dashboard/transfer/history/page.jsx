// src/app/dashboard/transfer/history/page.jsx

"use client";
import { useEffect, useState, useMemo } from "react";
import { Clock, CheckCircle, XCircle, Search, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

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
const PageHeader = ({ icon: Icon, title, subtitle, children }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
        <Icon className="accent" size={28} />
        {title}
      </h2>
      <p className="text-sm text-secondary mt-1">{subtitle}</p>
    </div>
    {children}
  </div>
);

// Search Input Component
const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative w-full md:w-72">
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
        w-full pl-9 pr-4 py-2.5 rounded-xl
        surface border-default
        text-sm text-primary placeholder:text-secondary
        focus:outline-none focus:ring-2 focus:ring-accent-soft
        transition-shadow
      `}
    />
  </div>
);

// Table Component
const Table = ({ columns, children, emptyMessage }) => (
  <div className="overflow-x-auto surface-card">
    {children ? (
      <table className="w-full text-sm">
        <thead className="surface-muted text-secondary text-xs uppercase">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    ) : (
      <div className="p-10 text-center text-secondary">{emptyMessage}</div>
    )}
  </div>
);

// Table Row Component
const TransferTableRow = ({ transfer, statusConfig }) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = statusConfig[transfer.status] || statusConfig.Pending;
  const StatusIcon = config.icon;

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        border-t border-default transition-colors
        ${isHovered ? 'bg-[var(--accent-bg)]' : ''}
      `}
    >
      <td className="px-6 py-4 font-medium text-primary">
        {transfer.asset_code}
      </td>
      <td className="px-6 py-4 text-primary">
        {transfer.make} {transfer.model}
      </td>
      <td className="px-6 py-4 text-primary">{transfer.serial_no}</td>
      <td className="px-6 py-4 text-primary">{transfer.from_emp_code}</td>
      <td className="px-6 py-4 text-primary">{transfer.to_emp_code}</td>
      <td className="px-6 py-4 text-primary">
        {new Date(transfer.transfer_date).toLocaleDateString()}
      </td>
      <td className={`px-6 py-4 font-semibold ${config.color}`}>
        <span className="flex items-center gap-1.5">
          <StatusIcon size={16} />
          {transfer.status}
        </span>
      </td>
    </tr>
  );
};

// Stats Card Component
const StatCard = ({ value, label, color }) => (
  <div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-secondary uppercase">{label}</p>
  </div>
);

// Footer Stats Component
const FooterStats = ({ transfers }) => {
  const stats = useMemo(() => [
    {
      label: "Approved",
      value: transfers.filter((t) => t.status === "Approved").length,
      color: "accent",
    },
    {
      label: "Pending",
      value: transfers.filter((t) => t.status === "Pending").length,
      color: "text-warning",
    },
    {
      label: "Rejected",
      value: transfers.filter((t) => t.status === "Rejected").length,
      color: "text-danger",
    },
  ], [transfers]);

  if (transfers.length === 0) return null;

  return (
    <div className="surface-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            value={stat.value}
            label={stat.label}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

/* ============================
   Main Component
============================ */
export default function AssetTransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const res = await fetch("/api/transfers", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

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

  // Status configuration
  const statusConfig = useMemo(() => ({
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
  }), []);

  // Filtered transfers based on search
  const filtered = useMemo(() => {
    if (!search.trim()) return transfers;
    
    const query = search.toLowerCase();
    return transfers.filter(
      (t) =>
        t.asset_code?.toLowerCase().includes(query) ||
        t.make?.toLowerCase().includes(query) ||
        t.model?.toLowerCase().includes(query)
    );
  }, [transfers, search]);

  // Table columns configuration
  const tableColumns = [
    "Asset Code",
    "Make/Model",
    "Serial No",
    "From",
    "To",
    "Date",
    "Status",
  ];

  if (loading) return <LoadingSpinner message="Loading transfers…" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        icon={ArrowRightLeft}
        title="Asset Transfer History"
        subtitle="Complete record of all asset transfers between employees"
      >
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transfers..."
        />
      </PageHeader>

      {/* Table */}
      <Table columns={tableColumns} emptyMessage="No transfers found">
        {filtered.length > 0 &&
          filtered.map((transfer, idx) => (
            <TransferTableRow
              key={idx}
              transfer={transfer}
              statusConfig={statusConfig}
            />
          ))}
      </Table>

      {/* Footer Stats */}
      <FooterStats transfers={filtered} />
    </motion.div>
  );
}