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
          <h2 className="text-3xl font-bold text-white">Issued Assets</h2>
          <p className="text-sm text-gray-400">
            Assets currently assigned to employees
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, asset, serial..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl
                       bg-gray-900 border border-gray-700
                       text-sm text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-green-500/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Loading issued assets…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No issued assets found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-gray-300 text-xs uppercase">
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
                  className="border-t border-gray-800 hover:bg-green-500/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {issue.employee_name}
                  </td>
                  <td className="px-6 py-4">{issue.emp_code}</td>
                  <td className="px-6 py-4">{issue.department}</td>
                  <td className="px-6 py-4">{issue.asset_code}</td>
                  <td className="px-6 py-4">{issue.make_model}</td>
                  <td className="px-6 py-4">{issue.serial_no}</td>
                  <td className="px-6 py-4">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => window.open(`/api/issues/${issue.id}/form`, "_blank")}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                      >
                        Generate Issue Form (PDF)
                      </button>

                      {/* View */}
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/issues/${issue.id}?mode=view`
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5
                                   rounded-lg bg-blue-600/90 hover:bg-blue-600
                                   text-white text-xs transition"
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
                        className="flex items-center gap-1.5 px-3 py-1.5
                                   rounded-lg bg-green-600/90 hover:bg-green-600
                                   text-white text-xs transition"
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
        <div className="text-xs text-gray-500 flex items-center gap-1">
          Click <ArrowRight size={12} /> View or Edit to manage issue details
        </div>
      )}
    </motion.div>
  );
}
