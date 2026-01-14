// src/app/dashboard/issues/page.jsx

"use client";
import { useEffect, useState } from "react";
import { Eye, Edit, Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AssetIssuesList() {
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch issues");
        const data = await res.json();
        setIssues(data);
      } catch (err) {
        console.error("Failed to fetch issues", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filtered = issues.filter((i) =>
    [i.employee_name, i.emp_code, i.department, i.asset_code, i.serial_no]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[color:var(--accent)]/30 border-t-[color:var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">Loading issued assets…</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-primary">Issued Assets</h2>
          <p className="text-sm text-secondary">
            Assets currently assigned to employees
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, asset, serial..."
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

      {/* Results count and items per page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <div className="text-secondary">
          Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(endIndex, filtered.length)} of {filtered.length} results
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-secondary">
            Per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`
              px-3 py-1.5 rounded-lg
              surface border-default
              text-primary text-sm
              focus:outline-none focus:ring-2 focus:ring-accent-soft
              cursor-pointer
            `}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto surface-card backdrop-blur-xl">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-secondary">
            No issued assets found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="surface-muted text-secondary text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Employee</th>
                <th className="px-6 py-4">Emp Code</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Asset Code</th>
                <th className="px-6 py-4">Make / Model</th>
                <th className="px-6 py-4">Serial No</th>
                <th className="px-6 py-4">Issued On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-t border-default hover:accent-bg transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-primary">
                    {issue.employee_name}
                  </td>
                  <td className="px-6 py-4 text-primary">{issue.emp_code}</td>
                  <td className="px-6 py-4 text-primary">{issue.department}</td>
                  <td className="px-6 py-4 text-primary">{issue.asset_code}</td>
                  <td className="px-6 py-4 text-primary">{issue.make_model}</td>
                  <td className="px-6 py-4 text-primary">{issue.serial_no}</td>
                  <td className="px-6 py-4 text-primary">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => window.open(`/api/issues/${issue.id}/form`, "_blank")}
                        className={`
                          px-3 py-2 rounded-lg text-xs font-medium
                          surface-muted border-default
                          text-primary hover:surface
                          transition-all shadow-sm
                        `}
                      >
                        Generate PDF
                      </button>

                      {/* View */}
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/issues/${issue.id}?mode=view`
                          )
                        }
                        className={`
                          flex items-center gap-1.5 px-3 py-2
                          rounded-lg text-xs font-medium
                          surface-muted border-default
                          text-primary hover:surface
                          transition-all shadow-sm
                        `}
                      >
                        <Eye size={14} />
                        View
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/issues/${issue.id}?mode=edit`
                          )
                        }
                        className={`
                          flex items-center gap-1.5 px-3 py-2
                          rounded-lg text-xs font-semibold
                          gradient-accent text-white
                          hover:opacity-90 transition-all shadow-md
                        `}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page info */}
          <div className="text-sm text-secondary">
            Page {currentPage} of {totalPages}
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                transition-all
                ${
                  currentPage === 1
                    ? "surface-muted text-secondary cursor-not-allowed opacity-50"
                    : "surface border-default text-primary hover:surface-card"
                }
              `}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-secondary">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium
                      transition-all
                      ${
                        currentPage === page
                          ? "gradient-accent text-white shadow-md"
                          : "surface border-default text-primary hover:surface-card"
                      }
                    `}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <div className="sm:hidden px-3 py-2 surface border-default rounded-lg text-sm font-medium text-primary">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                transition-all
                ${
                  currentPage === totalPages
                    ? "surface-muted text-secondary cursor-not-allowed opacity-50"
                    : "surface border-default text-primary hover:surface-card"
                }
              `}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer hint */}
      {filtered.length > 0 && (
        <div className="text-xs text-secondary flex items-center gap-1">
          Click <ArrowRight size={12} /> View or Edit to manage issue details
        </div>
      )}
    </motion.div>
  );
}