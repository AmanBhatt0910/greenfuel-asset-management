"use client";

import { FileText, Download } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const [type, setType] = useState("assets");
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/reports?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Failed to generate report");
      setLoading(false);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
        >
          <option value="assets">All Assets</option>
          <option value="issued">Issued Assets</option>
          <option value="garbage">Garbage Assets</option>
          <option value="transfers">Transfer History</option>
        </select>

        <button
          onClick={download}
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <FileText size={16} />
          {loading ? "Generating..." : "Generate & Download"}
        </button>
      </div>

      {/* Info */}
      <div className="border border-gray-700 rounded-xl p-4 text-sm text-gray-400">
        <p>✔ Downloads real-time data from the system</p>
        <p>✔ CSV format (Excel compatible)</p>
        <p>✔ Secure & role-protected</p>
      </div>
    </div>
  );
}
