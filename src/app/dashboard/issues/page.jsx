// src/app/dashboard/issues/page.jsx

// src/app/dashboard/issues/page.jsx

"use client";
import { useEffect, useState } from "react";
import { Eye, Edit, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AssetIssuesList() {
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/issues", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

      {/* Table */}
      <div className="overflow-x-auto surface-card backdrop-blur-xl">
        {loading ? (
          <div className="p-10 text-center text-secondary">
            Loading issued assets…
          </div>
        ) : filtered.length === 0 ? (
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
              {filtered.map((issue) => (
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

      {/* Footer hint */}
      {!loading && filtered.length > 0 && (
        <div className="text-xs text-secondary flex items-center gap-1">
          Click <ArrowRight size={12} /> View or Edit to manage issue details
        </div>
      )}
    </motion.div>
  );
}