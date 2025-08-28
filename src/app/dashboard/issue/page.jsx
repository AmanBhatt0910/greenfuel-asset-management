// app/dashboard/issues/page.jsx
"use client";
import { useEffect, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";

export default function AssetIssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        if (res.ok) {
          const data = await res.json();
          setIssues(data);
        }
      } catch (err) {
        console.error("Failed to fetch issues", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Filter based on search input
  const filtered = issues.filter((i) =>
    [i.employee_name, i.emp_code, i.department, i.asset_code, i.serial_no]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Existing Asset Issues</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issued assets..."
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table / Loader */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading issues...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No issues found</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Employee Name</th>
                <th className="px-6 py-3">Emp Code</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Asset Code</th>
                <th className="px-6 py-3">Make/Model</th>
                <th className="px-6 py-3">Serial No</th>
                <th className="px-6 py-3">Issued Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-b border-gray-700 hover:bg-gray-800 transition-all"
                >
                  <td className="px-6 py-3">{issue.employee_name}</td>
                  <td className="px-6 py-3">{issue.emp_code}</td>
                  <td className="px-6 py-3">{issue.department}</td>
                  <td className="px-6 py-3">{issue.asset_code}</td>
                  <td className="px-6 py-3">{issue.make_model}</td>
                  <td className="px-6 py-3">{issue.serial_no}</td>
                  <td className="px-6 py-3">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 flex justify-end gap-3">
                    <button className="p-2 rounded-lg bg-green-600 hover:bg-green-700">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-yellow-600 hover:bg-yellow-700">
                      <RotateCcw size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
