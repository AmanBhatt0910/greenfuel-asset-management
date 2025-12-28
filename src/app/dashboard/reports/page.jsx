"use client";

import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FileText className="accent" size={28} />
          Reports
        </h2>
        <p className="text-sm text-secondary mt-1">
          Generate and download system reports in CSV format
        </p>
      </div>

      {/* Controls Card */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-primary">
          Generate Report
        </h3>

        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`
              px-4 py-2.5 rounded-lg
              surface border-default
              text-primary
              focus:outline-none focus:ring-2 focus:ring-accent-soft
              transition-shadow flex-1
            `}
          >
            <option value="assets">All Assets</option>
            <option value="issued">Issued Assets</option>
            <option value="garbage">Garbage Assets</option>
            <option value="transfers">Transfer History</option>
          </select>

          <button
            onClick={download}
            disabled={loading}
            className={`
              px-6 py-2.5 rounded-lg font-semibold
              gradient-accent text-white
              hover:opacity-90 transition-opacity
              flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-md
            `}
          >
            <Download size={16} />
            {loading ? "Generating..." : "Generate & Download"}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="surface-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Report Features
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="accent text-lg">✓</span>
            <div>
              <p className="text-primary font-medium">Real-time Data</p>
              <p className="text-secondary">
                Downloads the latest information from the system
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="accent text-lg">✓</span>
            <div>
              <p className="text-primary font-medium">Excel Compatible</p>
              <p className="text-secondary">
                CSV format that opens directly in Microsoft Excel and Google Sheets
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="accent text-lg">✓</span>
            <div>
              <p className="text-primary font-medium">Secure & Protected</p>
              <p className="text-secondary">
                Role-based access control ensures data security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types Info */}
      <div className="surface-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Available Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportTypeCard
            title="All Assets"
            description="Complete inventory of all assets in the system"
          />
          <ReportTypeCard
            title="Issued Assets"
            description="Assets currently assigned to employees"
          />
          <ReportTypeCard
            title="Garbage Assets"
            description="Assets marked for disposal or retirement"
          />
          <ReportTypeCard
            title="Transfer History"
            description="Complete audit trail of asset transfers"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ReportTypeCard({ title, description }) {
  return (
    <div className="surface-muted border-default rounded-lg p-4">
      <h4 className="font-semibold text-primary mb-1">{title}</h4>
      <p className="text-sm text-secondary">{description}</p>
    </div>
  );
}